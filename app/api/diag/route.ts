import { NextResponse } from "next/server";
import net from "node:net";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function ms(fn: () => Promise<unknown>): Promise<number> {
  const t = Date.now();
  await fn();
  return Date.now() - t;
}

function tcpConnectMs(host: string, port: number, timeout = 8000): Promise<number> {
  return new Promise((resolve) => {
    const t = Date.now();
    const socket = net.connect({ host, port });
    const done = (v: number) => {
      socket.destroy();
      resolve(v);
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => done(Date.now() - t));
    socket.once("timeout", () => done(-1));
    socket.once("error", () => done(-1));
  });
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const pooler = (process.env.DATABASE_URL ?? "").match(/@([^:]+):(\d+)/);
  const dbHost = pooler?.[1] ?? "aws-0-ap-southeast-1.pooler.supabase.com";
  const dbPort = Number(pooler?.[2] ?? 5432);

  // Control: static edge endpoint, no database involved.
  const health = await ms(() => fetch(`${url}/auth/v1/health`, { headers: { apikey: anon } }));

  // Rejected API call: the anon key gets 401 at the gateway, so Postgres is never touched.
  const anonDenied = await ms(() =>
    fetch(`${url}/rest/v1/Settings?select=id&limit=1`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    }),
  );

  // Real data path: service-role PostgREST query, which IS served by Postgres.
  const realQuery = await ms(() =>
    fetch(`${url}/rest/v1/Settings?select=id,userId&limit=1`, {
      headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
    }),
  );

  // Real auth path: validate a real access token against the auth server.
  const login = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "probe@invalid.local", password: "x" }),
  });
  await login.text();
  const realAuth = await ms(() =>
    fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${serviceRole}` },
    }),
  );

  const tcp = await tcpConnectMs(dbHost, dbPort);

  return NextResponse.json({
    functionRegion: process.env.VERCEL_REGION ?? "unknown",
    dbHost,
    dbPort,
    edgeHealthMs: health,
    anonDeniedMs: anonDenied,
    realPostgresQueryMs: realQuery,
    realAuthCallMs: realAuth,
    tcpToPostgresMs: tcp,
    timestamp: new Date().toISOString(),
  });
}