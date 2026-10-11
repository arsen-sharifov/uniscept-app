import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DEFAULT_PREFERENCES } from '@constants';
import { headers } from '@mocks/nextHeaders';
import { getLocale } from '@mocks/nextIntlServer';
import RootLayout from '@/app/layout';
import { THEME_BOOTSTRAP } from '@/app/themeBootstrap';

vi.mock('next/font/google', () => import('@mocks/nextFont'));
vi.mock('next/headers', () => import('@mocks/nextHeaders'));
vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  ...(await import('@mocks/nextIntl')),
}));
vi.mock('next-intl/server', () => import('@mocks/nextIntlServer'));
vi.mock('@/i18n', () => import('@mocks/i18n'));

const bootstrapScript = () => document.head.querySelector('script');

describe('RootLayout', () => {
  describe('GIVEN a ukrainian request that carries a script nonce', () => {
    beforeEach(() => {
      getLocale.mockResolvedValue('uk');
      headers.mockResolvedValue(new Headers({ 'x-nonce': 'nonce-1' }));
    });

    describe('WHEN the document renders', () => {
      beforeEach(async () => {
        render(await RootLayout({ children: <main>Page</main> }), { container: document });
      });

      test('THEN the document speaks ukrainian and starts on the default look', () => {
        expect(document.documentElement).toHaveAttribute('lang', 'uk');
        expect(document.documentElement).toHaveAttribute('data-theme', DEFAULT_PREFERENCES.theme);
        expect(document.documentElement).toHaveAttribute('data-canvas-pattern', DEFAULT_PREFERENCES.canvasPattern);
      });

      test('THEN the theme bootstrap runs under the nonce before the page', () => {
        expect(bootstrapScript()).toHaveAttribute('nonce', 'nonce-1');
        expect(bootstrapScript()?.innerHTML).toBe(THEME_BOOTSTRAP);
        expect(screen.getByRole('main')).toHaveTextContent('Page');
      });
    });
  });

  describe('GIVEN a request without a nonce', () => {
    beforeEach(() => {
      getLocale.mockResolvedValue('en');
      headers.mockResolvedValue(new Headers());
    });

    describe('WHEN the document renders', () => {
      beforeEach(async () => {
        render(await RootLayout({ children: <main>Page</main> }), { container: document });
      });

      test('THEN the theme bootstrap carries no nonce', () => {
        expect(bootstrapScript()).not.toHaveAttribute('nonce');
      });
    });
  });
});
