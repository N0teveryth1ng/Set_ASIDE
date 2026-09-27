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

export async function getSessionUserFromCookie(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore
    .getAll()
    .find((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!tokenCookie?.value) return null;

  const parts = tokenCookie.value.split(".");
  const accessToken =
    parts.length >= 6 ? parts.slice(0, 3).join(".") : parts.length === 3 ? tokenCookie.value : null;
  if (!accessToken) return null;

  const payload = decodeAccessPayload(accessToken);
  if (!payload || typeof payload.sub !== "string") return null;

  const metadata = payload.user_metadata as Record<string, unknown> | undefined;
  const email =
    typeof payload.email === "string"
      ? payload.email
      : typeof metadata?.email === "string"
        ? metadata.email
        : null;

  return { id: payload.sub, email };
}