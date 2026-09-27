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
  const tokenCookie = cookieStore
    .getAll()
    .find((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!tokenCookie?.value) return null;

  // @supabase/ssr 0.12.x stores the session as `base64-` + base64url JSON
  // (D-018). Fall back to the plain `accessToken.refreshToken` shape.
  if (tokenCookie.value.startsWith("base64-")) {
    try {
      const json = Buffer.from(tokenCookie.value.slice("base64-".length), "base64url").toString("utf8");
      const session = JSON.parse(json) as {
        user?: { id?: unknown; email?: unknown };
        access_token?: unknown;
      };
      if (typeof session.user?.id === "string") {
        return { id: session.user.id, email: typeof session.user.email === "string" ? session.user.email : null };
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

  if (tokenCookie.value.split(".").length >= 3) {
    const accessToken = tokenCookie.value.split(".").slice(0, 3).join(".");
    const payload = decodeAccessPayload(accessToken);
    if (payload && typeof payload.sub === "string") {
      return { id: payload.sub, email: emailFromPayload(payload) };
    }
  }

  return null;
}