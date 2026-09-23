import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  let body: { accessToken?: unknown; refreshToken?: unknown } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
  const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : "";
  if (!accessToken || !refreshToken) {
    return NextResponse.json({ ok: false, error: "missing tokens" }, { status: 400 });
  }

  const cookieStore = await cookies();

  // Converge the cookie jar before writing the fresh session. Long-lived
  // Chrome profiles can carry stale supabase auth-token cookies from earlier
  // sessions (base key and/or legacy `.N` chunks). RSL's chunk reader can
  // reassemble those stale pieces into an invalid session on some requests,
  // which surfaces as a signed-in tab next to a login screen in the same
  // browser. Clearing every key under the current ref makes the jar
  // deterministic on each login.
  const supabaseRef =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/^https?:\/\/([^.]+)\.supabase\.co/)?.1 ?? "qnlpdcoobmcytrhbgjll";
  const authTokenKey = `sb-${supabaseRef}-auth-token`;
  for (const { name } of cookieStore.getAll()) {
    if (
      name === authTokenKey ||
      name.startsWith(`${authTokenKey}.`) ||
      name.startsWith(`${authTokenKey}-code-verifier`)
    ) {
      cookieStore.set(name, "", { maxAge: 0, path: "/" });
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignored — cookies are still written to the response.
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}