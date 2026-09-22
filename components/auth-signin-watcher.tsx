"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthSignInWatcher() {
  const router = useRouter();
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

    const supabase = createClient();
    void (async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return;

      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      router.replace("/dashboard");
    })();
  }, [router]);

  return null;
}