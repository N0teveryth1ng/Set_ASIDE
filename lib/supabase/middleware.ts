import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Builds a server client for the edge, tracking cookie writes so a refreshed
 * session is carried on whichever response we end up returning.
 */
function withSessionClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, response: () => response };
}

/**
 * Server-side gate for the app itself. A signed-in user opening /login is sent
 * to /dashboard; a signed-out one gets the login form.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const isLoginRoute = request.nextUrl.pathname === "/login";
  const { supabase, response } = withSessionClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isLoginRoute) {
    // getUser() validates against the auth server, so a stale or corrupt cookie
    // resolves to no user and the login form renders normally. It can never send
    // us back to /login and start a loop.
    if (!user) return response();

    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    const redirect = NextResponse.redirect(url);

    // getUser() may have refreshed an about-to-expire session, writing the new
    // session cookie through setAll onto the tracked response. A fresh redirect
    // drops those writes, so the browser keeps the stale cookie and the next
    // navigation bounces again. Carry every cookie off the tracked response,
    // with its attributes, so the refreshed session reaches the browser.
    for (const cookie of response().cookies.getAll()) {
      redirect.cookies.set(cookie.name, cookie.value, cookie);
    }
    return redirect;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  return response();
}
