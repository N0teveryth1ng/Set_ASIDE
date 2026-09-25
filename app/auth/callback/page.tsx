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

      // Establish the session through the server route so the cookie is
      // written server-side (the only mechanism the middleware reliably
      // accepts on fresh navigations, e.g. a new tab or a reload). The
      // implicit flow delivers tokens in the URL hash fragment (never sent
      // to the server); the PKCE flow delivers them as ?code= in the query
      // string and leaves the code_verifier in the browser, so it must be
      // exchanged client-side first — then the real tokens are handed to
      // the server route just like every other flow.
      const establish = async (at: string, rt: string) => {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: at, refreshToken: rt }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.ok !== true) throw new Error("token exchange failed");
      };

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
          await establish(accessToken, refreshToken);
        } else if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!data.session?.access_token || !data.session.refresh_token) {
            throw new Error("no session from code exchange");
          }
          await establish(data.session.access_token, data.session.refresh_token);
        } else if (tokenHash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            type: type as "magiclink" | "email",
            token_hash: tokenHash,
          });
          if (error) throw error;
          if (!data.session?.access_token || !data.session.refresh_token) {
            throw new Error("no session from token verification");
          }
          await establish(data.session.access_token, data.session.refresh_token);
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <p className="text-sm text-gray-500 dark:text-gray-400">{stage}</p>
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