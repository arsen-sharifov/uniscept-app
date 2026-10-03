import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { awardBadge } from '@mocks/badges';
import { setLocale, TRANSLATIONS } from '@mocks/i18n';
import { router } from '@mocks/navigation';
import { PREFERENCES } from '@mocks/preferences';
import { AppearanceSection } from '@/app/platform/components/Settings/fragments';
import { event } from '@/lib/events';

vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/badges', () => import('@mocks/badges'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const onUpdate = vi.fn();

afterEach(() => {
  document.documentElement.removeAttribute('lang');
});

describe('AppearanceSection', () => {
  describe('GIVEN a language cookie that fails to save', () => {
    beforeEach(() => {
      setLocale.mockRejectedValue(new Error('cookie store down'));
      render(<AppearanceSection preferences={PREFERENCES} onUpdate={onUpdate} />);
    });

    describe('WHEN another language is picked', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.fr) }),
          );
        });
      });

      test('THEN the pick rolls back to the previous language', () => {
        expect(vi.mocked(onUpdate).mock.calls).toEqual([
          ['language', 'fr'],
          ['language', 'uk'],
        ]);
        expect(router.refresh).not.toHaveBeenCalled();
        expect(awardBadge).not.toHaveBeenCalled();
      });

      test('THEN the failure reaches the user as a toast', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.saveFailed,
          context: 'settings.setLocale',
        });
      });

      test('THEN the language status stays silent so the failure is announced once', () => {
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
      });
    });
  });

  describe('GIVEN a language cookie that saves', () => {
    beforeEach(() => {
      setLocale.mockResolvedValue(undefined);
      render(<AppearanceSection preferences={PREFERENCES} onUpdate={onUpdate} />);
    });

    describe('WHEN another language is picked', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.fr) }),
          );
        });
      });

      test('THEN the page refreshes in the new language', () => {
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('language', 'fr');
        expect(setLocale).toHaveBeenCalledExactlyOnceWith('fr');
        expect(document.documentElement).toHaveAttribute('lang', 'fr');
        expect(router.refresh).toHaveBeenCalledOnce();
      });

      test('THEN the Linguist badge is awarded', () => {
        expect(awardBadge).toHaveBeenCalledExactlyOnceWith('linguist');
      });
    });
  });
});
