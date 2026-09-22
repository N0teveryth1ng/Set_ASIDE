"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { palette, radius, recipe, space, type } from "@/lib/tokens";

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

  const signInWithGoogle = async () => {
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
      <div className={`${radius.box} w-full max-w-sm space-y-6 p-8 ${palette.surface} ${palette.border}`}>
        <div className="space-y-1">
          <h1 className={`${type.heading} ${palette.text}`}>Set-Aside</h1>
          <p className={type.text + " " + palette.textFaint}>Sign in to your ledger</p>
        </div>

        {error && (
          <p className={`${recipe.errorBoxLg} ${palette.lossText}`}>
            {errorText[error] ?? "Something went wrong."}
          </p>
        )}
        {message && (
          <p className={`${recipe.errorBoxLg} ${palette.lossText}`}>{message}</p>
        )}
        {sent && <p className={recipe.successNote}>Magic link sent. Check your inbox and click the link to sign in.</p>}

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={busy}
          className={`${recipe.btnGhostLg} w-full`}
        >
          Continue with Google
        </button>

        <div className={`flex items-center gap-3 ${type.tiny} ${palette.textGhost} uppercase tracking-wide`}>
          <div className={`h-px flex-1 ${palette.inkSoftHover}`} />
          or
          <div className={`h-px flex-1 ${palette.inkSoftHover}`} />
        </div>

        <form onSubmit={sendMagicLink} className={space.stackXxs}>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={recipe.inputControl}
          />
          <button
            type="submit"
            disabled={busy}
            className={`${recipe.btnPrimaryLg} w-full`}
          >
            Send magic link
          </button>
        </form>
      </div>
    </main>
  );
}