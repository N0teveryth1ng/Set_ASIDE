import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  email: string | null;
}

function decodeAccessPayload(accessToken: string): Record<string, unknown> | null {
  try {
    const segments = accessToken.split(".");
    if (segments.length < 2) return null;
    return JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function emailFromPayload(payload: Record<string, unknown>): string | null {
  const metadata = payload.user_metadata as Record<string, unknown> | undefined;
  return typeof payload.email === "string"
    ? payload.email
    : typeof metadata?.email === "string"
      ? metadata.email
      : null;
}

export async function getSessionUserFromCookie(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  // @supabase/ssr 0.12.x splits the session cookie into `sb-<ref>-auth-token.0`, `.1`, …
  const base = cookieStore
    .getAll()
    .map((c) => c.name.match(/^(sb-.+-auth-token)(?:\.(\d+))?$/))
    .find((m): m is RegExpMatchArray => m !== null)?.[1];

  if (!base) return null;

  const chunks = cookieStore
    .getAll()
    .map((c) => ({ name: c.name, index: c.name.match(/^sb-.+-auth-token\.(\d+)$/)?.[1], value: c.value }))
    .filter((c) => c.name === base || c.name.startsWith(base + "."))
    .sort((a, b) => (a.index ? Number(a.index) : 0) - (b.index ? Number(b.index) : 0));

  const value = chunks.map((c) => c.value).join("");
  if (!value) return null;

  // Session cookie is `base64-` + base64url JSON (decisions.md D-018); older
  // values are a plain `accessToken.refreshToken` pair.
  if (value.startsWith("base64-")) {
    try {
      const session = JSON.parse(
        Buffer.from(value.slice("base64-".length), "base64url").toString("utf8"),
      ) as { user?: { id?: unknown; email?: unknown }; access_token?: unknown };
      if (typeof session.user?.id === "string") {
        return {
          id: session.user.id,
          email: typeof session.user.email === "string" ? session.user.email : null,
        };
      }
      if (typeof session.access_token === "string") {
        const payload = decodeAccessPayload(session.access_token);
        if (payload && typeof payload.sub === "string") {
          return { id: payload.sub, email: emailFromPayload(payload) };
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  if (value.split(".").length >= 3) {
    const payload = decodeAccessPayload(value.split(".").slice(0, 3).join("."));
    if (payload && typeof payload.sub === "string") {
      return { id: payload.sub, email: emailFromPayload(payload) };
    }
  }

  return null;
}