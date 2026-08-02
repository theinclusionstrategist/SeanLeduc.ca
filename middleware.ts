import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const isPortalRoute = pathname.startsWith('/portal');
  const isClientPortalRoute = pathname.startsWith('/client-portal');
  const isSecretHQRoute = pathname === '/hq';

  const isAgent = (email?: string) => {
    if (!email) return false;
    const adminEmails = ['sean@seanleduc.ca', 'shaun@seanleduc.ca', 'agent@seanleduc.ca', 'theinclusionstrategist@gmail.com'];
    return adminEmails.includes(email.toLowerCase().trim()) || email.toLowerCase().trim().endsWith('@seanleduc.ca');
  };

  // A. UNAUTHENTICATED USERS
  if (!user) {
    if (isPortalRoute || isClientPortalRoute) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // B. AUTHENTICATED USERS
  if (user) {
    const userIsAgent = isAgent(user.email);

    // If an Agent goes to the client login or secret HQ login, route them to command center
    if (userIsAgent && (pathname === '/login' || pathname === '/hq' || isClientPortalRoute)) {
      url.pathname = '/portal';
      return NextResponse.redirect(url);
    }

    // If a Client goes to the secret HQ, Agent portal, or client login, route them to client hub
    if (!userIsAgent && (pathname === '/login' || pathname === '/hq' || isPortalRoute)) {
      url.pathname = '/client-portal';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
