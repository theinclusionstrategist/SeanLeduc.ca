import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Initialize the Supabase SSR client for Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update the request cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Update the response so Next.js applies the cookie changes
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Refresh session & fetch the user securely from the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 4. Define route access classifications
  const isPortalRoute = pathname.startsWith('/portal');
  const isClientPortalRoute = pathname.startsWith('/client-portal');

  // Agent/Admin Verification Helper
  const isAgent = (email?: string) => {
    if (!email) return false;
    const adminEmails = [
      'sean@seanleduc.ca',
      'shaun@seanleduc.ca',
      'agent@seanleduc.ca',
      'theinclusionstrategist@gmail.com'
    ];
    return adminEmails.includes(email.toLowerCase().trim()) || email.toLowerCase().trim().endsWith('@seanleduc.ca');
  };

  // ==========================================
  // 🚦 TRAFFIC CONTROL & SECURITY ROUTING
  // ==========================================

  // A. UNAUTHENTICATED USERS
  if (!user) {
    // If a public visitor tries to access a protected dashboard, bounce them to login
    if (isPortalRoute || isClientPortalRoute) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // Allow them to proceed to public pages (/, /financial, /speaking, etc.)
    return supabaseResponse;
  }

  // B. AUTHENTICATED USERS
  if (user) {
    const userIsAgent = isAgent(user.email);

    // If logged-in user visits the /login page, auto-redirect to their specific hub
    if (pathname === '/login') {
      url.pathname = userIsAgent ? '/portal' : '/client-portal';
      return NextResponse.redirect(url);
    }

    // STRICT SECURITY: If a standard Client tries to type /portal in the URL, block and bounce them
    if (!userIsAgent && isPortalRoute) {
      url.pathname = '/client-portal';
      return NextResponse.redirect(url);
    }

    // UX: If an Agent types /client-portal, redirect them back to their Command Center
    if (userIsAgent && isClientPortalRoute) {
      url.pathname = '/portal';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

// 5. Tell Next.js which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/ (API routes - we handle auth inside the API route itself)
     * 2. _next/static (static files)
     * 3. _next/image (image optimization files)
     * 4. favicon.ico, sitemap.xml, robots.txt (metadata files)
     * 5. any file with an extension (e.g., .svg, .png, .jpg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
