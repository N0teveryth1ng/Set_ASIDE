"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

function CallbackInner() {
  const searchParams = useSearchParams();
  const [stage, setStage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          isSingleton: false,
          auth: { detectSessionInUrl: false },
        },
      );

      const next = safeNext(searchParams.get("next"));

      // The implicit flow delivers tokens in the URL hash fragment, which is
      // never sent to the server. The PKCE flow delivers them as ?code= in the
      // query string. Both, plus ?token_hash=, are handled here client-side.
      const hashParams = new URLSearchParams(
        window.location.hash.length > 1 ? window.location.hash.substring(1) : "",
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      try {
        if (accessToken && refreshToken) {
          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, refreshToken }),
          });
          const json = await res.json().catch(() => null);
          if (!res.ok || json?.ok !== true) throw new Error("token exchange failed");
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type: type as "magiclink" | "email",
            token_hash: tokenHash,
          });
          if (error) throw error;
        } else {
          if (!cancelled) setStage("Missing sign-in parameters.");
          return;
        }

        // Full navigation so the server re-reads the freshly written cookie.
        window.location.replace(next);
      } catch {
        if (!cancelled) setStage("Sign-in failed. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <p className="text-sm text-gray-500">{stage}</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", marginTop: "40vh" }}>Signing you in…</p>}>
      <CallbackInner />
    </Suspense>
  );
}