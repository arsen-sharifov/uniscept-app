import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import type { TLocale } from '@interfaces';

import { createClient } from '@/lib/supabase/server';

import { LOCALE_COOKIE, LOCALES, PUBLIC_PATHS } from './consts';
import { negotiateLocale } from './utils';

const resolveLocale = async (): Promise<TLocale> => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale as TLocale)) {
    return cookieLocale as TLocale;
  }

  const requestHeaders = await headers();
  const browserLocale = negotiateLocale(requestHeaders.get('accept-language'));

  const pathname = requestHeaders.get('x-pathname');
  if (pathname && (PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth/'))) {
    return browserLocale;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return browserLocale;
    }

    const { data } = await supabase.from('user_preferences').select('language').eq('user_id', user.id).maybeSingle();

    return (data?.language as TLocale | undefined) ?? browserLocale;
  } catch {
    return browserLocale;
  }
};

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  return {
    locale,
    messages: (await import(`@/locales/${locale}.json`)).default,
  };
});
