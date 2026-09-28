"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { recipe } from "@/lib/tokens";

type Status = "checking" | "signed-in" | "signed-out";

const AuthCtaContext = createContext<Status>("checking");

// The check reads a local cookie, so it settles in milliseconds. The timeout
// only exists so a cookie that never settles cannot leave the buttons stuck in
// the hidden placeholder state; it can never downgrade a resolved "signed-in".
const CHECK_TIMEOUT_MS = 3000;

export function AuthCtaProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const finish = (next: Status) => {
      if (!cancelled) setStatus(next);
    };

    // DISPLAY ONLY. This decides what the buttons say, nothing more. The landing
    // page itself stays statically generated, and every route that actually
    // needs a session (/dashboard, /login) is decided server-side in
    // middleware.ts. A signed-in user clicking through still hits that check.
    void supabase.auth
      .getSession()
      .then(({ data }) => finish(data.session ? "signed-in" : "signed-out"))
      .catch(() => finish("signed-out"));

    // A stale or corrupt cookie can make the client drop the session after a
    // failed refresh. Report that as signed out instead of stranding the CTA.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      finish(session ? "signed-in" : "signed-out");
    });

    const timer = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "signed-out" : current));
    }, CHECK_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthCtaContext.Provider value={status}>{children}</AuthCtaContext.Provider>;
}

export function useAuthCta(): Status {
  return useContext(AuthCtaContext);
}

// While the check runs the buttons are rendered but not painted, so the nav
// keeps its exact width and no "Log in" ever flashes before the swap.
function pending(status: Status) {
  return status === "checking" ? "invisible" : "";
}

export function NavAuthCta() {
  const status = useAuthCta();

  return (
    <div
      data-nav-cta=""
      className={`flex min-h-[2.375rem] min-w-[13.5rem] items-center justify-end gap-2 ${pending(status)}`}
    >
      {status === "signed-in" ? (
        <Link href="/dashboard" className={`${recipe.btnPrimary} px-4 py-2`}>
          Go to dashboard
        </Link>
      ) : (
        <>
          <Link href="/login" className={`${recipe.btnGhost} px-4 py-2`}>
            Log in
          </Link>
          <Link href="/login" className={`${recipe.btnPrimary} px-4 py-2`}>
            Get started
          </Link>
        </>
      )}
    </div>
  );
}

export function NavAuthCtaMobile({ onNavigate }: { onNavigate: () => void }) {
  const status = useAuthCta();

  return (
    <div className={`mt-4 flex flex-col gap-2 ${pending(status)}`}>
      {status === "signed-in" ? (
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={`${recipe.btnPrimary} px-4 py-2 text-center`}
        >
          Go to dashboard
        </Link>
      ) : (
        <>
          <Link href="/login" onClick={onNavigate} className={`${recipe.btnGhost} px-4 py-2 text-center`}>
            Log in
          </Link>
          <Link href="/login" onClick={onNavigate} className={`${recipe.btnPrimary} px-4 py-2 text-center`}>
            Get started
          </Link>
        </>
      )}
    </div>
  );
}

export function SignupCta({
  variant,
  className = "",
}: {
  variant: "hero" | "panel" | "footer";
  className?: string;
}) {
  const status = useAuthCta();
  const signedIn = status === "signed-in";

  if (variant === "footer") {
    return (
      <Link
        href={signedIn ? "/dashboard" : "/login"}
        className={`text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 ${pending(status)}`}
      >
        {signedIn ? "Go to dashboard" : "Log in"}
      </Link>
    );
  }

  return (
    <Link
      href={signedIn ? "/dashboard" : "/login"}
      className={`${recipe.btnPrimaryLg} ${className} ${pending(status)}`}
    >
      {signedIn ? "Go to dashboard" : "Get started"}
    </Link>
  );
}
