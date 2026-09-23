"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { palette, recipe, space, type } from "@/lib/tokens";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29C5.02 13.57 4.89 12.8 4.89 12s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const clearUrlError = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("error")) return;
    params.delete("error");
    const query = params.size > 0 ? `?${params.toString()}` : "";
    router.replace(`${window.location.pathname}${query}`, { scroll: false });
  };

  const signInWithGoogle = async () => {
    clearUrlError();
    setBusy(true);
    setMessage(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
    if (err) setMessage(err.message);
    setBusy(false);
  };

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    clearUrlError();
    setBusy(true);
    setMessage(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
    setBusy(false);
    if (err) {
      setMessage(err.message);
    } else {
      setSent(true);
    }
  };

  const errorText: Record<string, string> = {
    auth: "Sign-in failed. The link may have expired.",
    token: "The email link is invalid or already used.",
    missing: "Missing sign-in parameters.",
  };

  return (
    <main className={`flex min-h-screen items-center justify-center ${palette.canvas} p-4`}>
      <div className={`${recipe.surfaceBox} w-full max-w-sm p-8`}>
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${palette.cta} ${palette.textInverse}`}
            aria-hidden
          >
            <span className="font-display text-lg font-semibold">S</span>
          </span>
          <div>
            <h1 className={`${type.brand} ${palette.text}`}>Set-Aside</h1>
            <p className={`${type.tiny} ${palette.textFaint}`}>Sign in to your ledger</p>
          </div>
        </div>

        {(error || message) && (
          <p role="alert" className={`mt-5 ${recipe.errorBoxLg} ${palette.lossText}`}>
            {error ? (errorText[error] ?? "Something went wrong.") : message}
          </p>
        )}
        {sent && (
          <p className={`mt-5 ${recipe.successNote}`}>
            Magic link sent. Check your inbox and click the link to sign in.
          </p>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy}
            className={`${recipe.btnGhostLg} flex w-full items-center justify-center gap-3`}
          >
            <GoogleMark />
            Continue with Google
          </button>
        </div>

        <div className={`mt-6 flex items-center gap-3 ${type.tiny} ${palette.textGhost} uppercase tracking-wide`}>
          <div className={`h-px flex-1 ${palette.inkSoftHover}`} />
          or
          <div className={`h-px flex-1 ${palette.inkSoftHover}`} />
        </div>

        <form onSubmit={sendMagicLink} className={`mt-6 ${space.stackXxs}`}>
          <label htmlFor="login-email" className={recipe.labelThin}>
            Enter your email
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={`${recipe.inputControl} w-full`}
          />
          <button
            type="submit"
            disabled={busy}
            className={`${recipe.btnPrimaryLg} w-full`}
          >
            Send magic link
          </button>
          <p className={`mt-1 ${type.tiny} ${palette.textFaint}`}>
            We&apos;ll email you a one-click sign-in link. No password.
          </p>
        </form>

        <p className={`mt-8 border-t pt-5 text-center ${type.tiny} ${palette.textFaint}`}>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}