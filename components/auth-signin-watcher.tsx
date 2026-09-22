"use client";

import { useEffect, useRef } from "react";

function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export default function AuthSignInWatcher() {
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const hashParams = new URLSearchParams(
      window.location.hash.length > 1 ? window.location.hash.substring(1) : "",
    );
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (!accessToken || !refreshToken) return;

    void (async () => {
      let ok = false;
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
        const json = await res.json().catch(() => null);
        ok = res.ok && json?.ok === true;
      } catch {
        ok = false;
      }

      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );

      // The session cookie is now set server-side; a hard navigation ensures
      // middleware + server components read the fresh session on first load.
      window.location.replace(ok ? safeNext(new URLSearchParams(window.location.search).get("next")) : "/login?error=token");
    })();
  }, []);

  return null;
}