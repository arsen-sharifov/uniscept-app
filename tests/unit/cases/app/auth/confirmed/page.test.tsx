import { readFileSync } from 'node:fs';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { useWorldArrival } from '@mocks/landingHooks';
import ConfirmedPage from '@/app/auth/confirmed/page';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/app/fragments/hooks', () => import('@mocks/landingHooks'));
vi.mock('@/app/fragments/utils', () => import('@mocks/landingUtils'));

const stylesheet = document.createElement('style');

beforeEach(() => {
  stylesheet.textContent = readFileSync('src/app/styles/landing.css', 'utf8');
  document.head.appendChild(stylesheet);
  document.documentElement.setAttribute('data-scripted', '');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  stylesheet.remove();
  document.documentElement.removeAttribute('data-scripted');
});

describe('ConfirmedPage', () => {
  describe('GIVEN the email confirmation page with its background ready', () => {
    beforeEach(() => {
      useWorldArrival.mockReturnValue({ field: true, content: true });
    });

    describe('WHEN the page renders with the landing stylesheet', () => {
      beforeEach(() => {
        render(<ConfirmedPage />);
      });

      test('THEN the confirmation message and close button are visible', () => {
        expect(screen.getByRole('heading', { name: TRANSLATIONS.auth.confirmed.heading })).toBeVisible();
        expect(screen.getByRole('button', { name: TRANSLATIONS.auth.confirmed.close })).toBeVisible();
      });
    });

    describe('WHEN the close button is pressed', () => {
      beforeEach(() => {
        vi.spyOn(window, 'close').mockImplementation(() => undefined);
        render(<ConfirmedPage />);
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.auth.confirmed.close }));
      });

      test('THEN the confirmation tab closes', () => {
        expect(window.close).toHaveBeenCalledTimes(1);
      });
    });
  });
});
