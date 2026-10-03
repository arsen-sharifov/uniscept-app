import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { PUBLIC_PATHS } from '@/i18n/consts';
import { buildContentSecurityPolicy } from '@/lib/utils/security';

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isAuthApi = pathname.startsWith('/auth/');
  const isPublicRoute = PUBLIC_PATHS.includes(pathname);

  const requestHeaders = new Headers(request.headers);
  const nonce = btoa(crypto.randomUUID());
  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    isDevelopment: process.env.NODE_ENV === 'development',
  });
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', contentSecurityPolicy);

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const code = request.nextUrl.searchParams.get('code');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const url = request.nextUrl.clone();

    if (error) {
      url.pathname = '/login';
      url.search = '';
      url.searchParams.set('error', 'invalid_code');

      return NextResponse.redirect(url);
    }

    url.pathname = '/auth/confirmed';
    url.searchParams.delete('code');

    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });

    return redirect;
  }

  if (isAuthApi) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/platform';
    url.search = '';

    return NextResponse.redirect(url);
  }

  return response;
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
