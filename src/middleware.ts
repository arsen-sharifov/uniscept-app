import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isAuthApi = pathname.startsWith('/auth/');

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const code = request.nextUrl.searchParams.get('code');

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    const url = request.nextUrl.clone();
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

  if (!user && !isAuthRoute && pathname !== '/') {
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
