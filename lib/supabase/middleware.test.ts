import { test } from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import { NextRequest } from "next/server";
import { updateSession } from "./middleware.ts";

/**
 * Real end-to-end test of the signed-in /login branch against live Supabase.
 *
 * A real session is minted (generate_link + verify), then stored as an
 * about-to-expire cookie so getUser() is forced to refresh it on the request.
 * The refresh writes the new session cookie onto the tracked middleware
 * response; if updateSession drops it when building the /dashboard redirect,
 * the browser is left with the stale cookie and the next navigation bounces.
 * These tests assert the redirect carries the refreshed cookie (with its
 * attributes) and that following it lands on /dashboard without bouncing.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = url ? new URL(url).hostname.split(".")[0] : null;
const COOKIE = ref ? `sb-${ref}-auth-token` : "sb-";
const live = Boolean(url && anon && service && ref);
const skip = live
  ? false
  : "requires .env with live Supabase keys (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)";

const supabaseUrl = url!;
const anonKey = anon!;
const serviceKey = service!;

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  user?: { id?: string };
}

async function authJson(endpoint: string, body: Record<string, unknown>): Promise<Response> {
  const res = await fetch(`${supabaseUrl}${endpoint}`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res;
}

async function createUser(email: string): Promise<void> {
  const r = await authJson("/auth/v1/admin/users", { email, email_confirm: true });
  if (r.status !== 200 && r.status !== 201) throw new Error(`admin create user ${r.status}: ${await r.text()}`);
}

async function mintSession(email: string): Promise<Session> {
  const link = await authJson("/auth/v1/admin/generate_link", {
    type: "magiclink",
    email,
    redirect_to: "https://set-aside-nine.vercel.app",
  });
  if (link.status !== 200 && link.status !== 201) throw new Error(`generate_link ${link.status}`);
  const parsed: { action_link?: string; url?: string } = await link.json();
  const q = new URL(parsed.action_link || parsed.url || "").searchParams;
  const token_hash = q.get("token_hash") || q.get("token");
  const verify = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash }),
  });
  if (verify.status !== 200 && verify.status !== 201) throw new Error(`verify ${verify.status}: ${await verify.text()}`);
  return (await verify.json()) as Session;
}

function encodeCookie(session: Session): string {
  return `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
}

// Reconstructs the cookie value the browser holds from one or more Set-Cookie
// headers (the session may have been chunked as name.0 / name.1 / ...).
function decodeAuthValue(setCookies: string[]): string | null {
  const single = setCookies.find((h) => h.startsWith(`${COOKIE}=`) || h.startsWith(`${COOKIE};`));
  if (single) return single.split(";")[0].slice(`${COOKIE}=`.length);
  const chunks: string[] = [];
  for (let i = 0; ; i++) {
    const hit = setCookies.find((h) => h.startsWith(`${COOKIE}.${i}=`));
    if (!hit) break;
    chunks.push(hit.split(";")[0].slice(`${COOKIE}.${i}=`.length));
  }
  if (chunks.length === 0) return null;
  return chunks.join("");
}

function parseSession(value: string): Session {
  const b64 = value.startsWith("base64-") ? value.slice("base64-".length) : value;
  return JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as Session;
}

test("signed-in /login redirect carries the refreshed session cookie", { skip }, async () => {
  const email = `mw-refresh-${Date.now()}@gmail.com`;
  await createUser(email);
  const session = await mintSession(email);

  // About to expire (now + 60s, inside the 90s refresh margin) but still valid:
  // getUser() on the request refreshes via the refresh token, writing new cookies.
  const plantedValue = encodeCookie({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });

  const req = new NextRequest("http://localhost:3000/login", {
    headers: { cookie: `${COOKIE}=${plantedValue}` },
  });
  const res = await updateSession(req);

  assert.equal(res.status, 307, `redirect status, got ${res.status}`);
  const location = res.headers.get("location");
  assert.ok(location, "redirect has a Location header");
  assert.equal(new URL(location).pathname, "/dashboard");

  const setCookies = res.headers
    .getSetCookie()
    .filter((h) => h.startsWith(`${COOKIE}=`) || h.startsWith(`${COOKIE}.`));
  assert.ok(setCookies.length > 0, "the /dashboard redirect must carry the session cookie Set-Cookie headers");

  const refreshedValue = decodeAuthValue(setCookies);
  assert.ok(refreshedValue, "refreshed cookie value present");
  const refreshed = parseSession(refreshedValue);
  assert.ok(refreshed.access_token, "refreshed session has an access token");
  assert.notEqual(refreshed.access_token, session.access_token, "the cookie must hold the refreshed (rotated) token, not the planted one");

  // The carried cookie must have made it onto the redirect with the full cookie
  // attribute set (Path, SameSite, Max-Age) instead of a bare name=value, which
  // is the failure mode when a fresh response drops the write options. HttpOnly
  // is deliberately absent: @supabase/ssr's createServerClient default for
  // cookieOptions is httpOnly:false, so no other response in this app writes it
  // either — the redirect must simply match the tracked response, which it does.
  for (const sc of setCookies) {
    assert.match(sc, /Path=\//, `attribute preserved on ${sc}`);
    assert.match(sc, /SameSite=lax/i, `attribute preserved on ${sc}`);
    assert.match(sc, /Max-Age=34560000/, `library default Max-Age preserved on ${sc}`);
  }

  // Follow the redirect the way a browser would: send the carried cookies to
  // /dashboard. The refreshed session is valid there, so it must NOT bounce.
  const carried = setCookies
    .map((h) => h.split(";")[0])
    .filter((kv) => kv.includes("=") && !kv.endsWith("="))
    .join("; ");
  const nextReq = new NextRequest("http://localhost:3000/dashboard", {
    headers: { cookie: carried },
  });
  const nextRes = await updateSession(nextReq);

  assert.equal(nextRes.status, 200, `/dashboard with the carried cookies must forward (NextResponse.next), got ${nextRes.status}`);
  assert.equal(nextRes.headers.get("location"), null, "no redirect to /login (no bounce)");
});