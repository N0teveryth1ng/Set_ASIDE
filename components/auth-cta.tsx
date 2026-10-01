"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { recipe } from "@/lib/tokens";

type Status = "checking" | "signed-in" | "signed-out";

const AuthCtaContext = createContext<Status>("checking");

// The check reads a local cookie, so it normally settles in a few tens of
// milliseconds. This is a hard ceiling on how long a cookie-holder's page may
// stay blank: it is armed before anything else can throw, so a slow network, a
// thrown client or a cookie that never settles all fall open to the signed-out
// buttons. It can never downgrade a resolved "signed-in".
const CHECK_TIMEOUT_MS = 400;

const FOOTER_LINK = "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100";

// data-auth-pending maps to the camelCase dataset key authPending; the head
// script in layout.tsx sets it, and React clears it once it has committed a
// resolved state so the reveal is driven by that render, not a mid-swap repaint.
const PENDING_ATTR = "authPending";

function releasePending() {
  const d = document.documentElement;
  if (d.dataset[PENDING_ATTR]) delete d.dataset[PENDING_ATTR];
}

export function AuthCtaProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    const finish = (next: Status) => {
      if (!cancelled) setStatus(next);
    };

    const timer = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "signed-out" : current));
    }, CHECK_TIMEOUT_MS);

    let unsubscribe = () => {};
    try {
      const supabase = createClient();

      // DISPLAY ONLY. This decides what the buttons say, nothing more. The
      // landing page itself stays statically generated, and every route that
      // actually needs a session (/dashboard, /login) is decided server-side in
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
      unsubscribe = () => listener.subscription.unsubscribe();
    } catch {
      finish("signed-out");
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Once the state has resolved, the inline head-script fallback is no longer
  // needed and the slot can paint whatever this render committed.
  useEffect(() => {
    if (status !== "checking") releasePending();
  }, [status]);

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
      data-session-cta=""
      data-nav-cta=""
      className="flex min-h-[2.375rem] min-w-[13.5rem] items-center justify-end gap-2"
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
    <div data-session-cta="" className="mt-4 flex flex-col gap-2">
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
  className = "",
  variant = "large",
}: {
  className?: string;
  variant?: "large" | "hero";
}) {
  const status = useAuthCta();
  const signedIn = status === "signed-in";
  const style = `${variant === "hero" ? recipe.btnHero : recipe.btnPrimaryLg} ${className}`;

  return (
    <Link
      data-session-cta=""
      href={signedIn ? "/dashboard" : "/login"}
      className={style}
    >
      {signedIn ? "Go to dashboard" : "Get started"}
    </Link>
  );
}

export function FooterAuthCtas() {
  const status = useAuthCta();
  const signedIn = status === "signed-in";

  return (
    <ul data-session-cta="" className="mt-3 space-y-2 text-sm">
      <li aria-hidden={signedIn || undefined} className={signedIn ? "invisible" : ""}>
        <Link href="/login" className={FOOTER_LINK}>
          Log in
        </Link>
      </li>
      <li>
        <Link href={signedIn ? "/dashboard" : "/login"} className={FOOTER_LINK}>
          {signedIn ? "Go to dashboard" : "Get started"}
        </Link>
      </li>
    </ul>
  );
}
