import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { DEFAULT_PREFERENCES } from '@constants';

import { THEME_BOOTSTRAP } from './themeBootstrap';
import './globals.css';

export const metadata: Metadata = {
  title: 'Uniscept',
  description: 'A platform for structured discussions and argument mapping',
};

const RootLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className="scroll-smooth"
      data-theme={DEFAULT_PREFERENCES.theme}
      data-canvas-pattern={DEFAULT_PREFERENCES.canvasPattern}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="bg-[color:var(--app-bg)] text-[color:var(--text)] antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
