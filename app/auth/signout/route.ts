import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 (See Other): the client re-requests /login with GET. A plain
  // redirect (307) preserves the POST method, and /login only accepts GET,
  // producing an HTTP 405 on the login page.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}