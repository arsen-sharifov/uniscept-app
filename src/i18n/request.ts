import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import type { TLocale } from '@interfaces';

import { createClient } from '@/lib/supabase/server';

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from './consts';

const resolveLocale = async (): Promise<TLocale> => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale as TLocale)) {
    return cookieLocale as TLocale;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return DEFAULT_LOCALE;
    }

    const { data } = await supabase.from('user_preferences').select('language').eq('user_id', user.id).maybeSingle();

    return (data?.language as TLocale | undefined) ?? DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
};

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  return {
    locale,
    messages: (await import(`@/locales/${locale}.json`)).default,
  };
});
