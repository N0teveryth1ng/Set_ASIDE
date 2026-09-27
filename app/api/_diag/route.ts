import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function timed<T>(fn: () => Promise<T>): Promise<{ ms: number; ok: boolean }> {
  const t = Date.now();
  try {
    await fn();
    return { ms: Date.now() - t, ok: true };
  } catch {
    return { ms: Date.now() - t, ok: false };
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseHost = new URL(url).host;
  const dbHost = (process.env.DATABASE_URL ?? "").match(/@([^:]+)/)?.[1] ?? "n/a";

  const authHealth = await timed(() => fetch(`${url}/auth/v1/health`, { headers: { apikey: anon } }));
  const restQuery = await timed(() =>
    fetch(`${url}/rest/v1/Settings?select=id&limit=1`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    }),
  );

  return NextResponse.json({
    functionRegion: process.env.VERCEL_REGION ?? "unknown",
    supabaseHost,
    dbHost,
    authHealthMs: authHealth.ms,
    restQueryMs: restQuery.ms,
    timestamp: new Date().toISOString(),
  });
}