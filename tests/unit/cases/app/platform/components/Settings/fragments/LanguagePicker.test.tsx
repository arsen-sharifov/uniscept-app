import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { awardBadge } from '@mocks/badges';
import { setLocale, TRANSLATIONS } from '@mocks/i18n';
import { router } from '@mocks/navigation';
import { LanguagePicker } from '@/app/platform/components/Settings/fragments';
import { event } from '@/lib/events';

vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/badges', () => import('@mocks/badges'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const onChange = vi.fn();

afterEach(() => {
  document.documentElement.removeAttribute('lang');
});

describe('LanguagePicker', () => {
  describe('GIVEN a language cookie that fails to save', () => {
    beforeEach(() => {
      setLocale.mockRejectedValue(new Error('cookie store down'));
      render(<LanguagePicker onChange={onChange} />);
    });

    describe('WHEN another language is picked', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.fr) }),
          );
        });
      });

      test('THEN the language preference is left as it was', () => {
        expect(onChange).not.toHaveBeenCalled();
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
      render(<LanguagePicker onChange={onChange} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the interface language is the one marked as picked', () => {
        expect(
          screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.en) }),
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
          screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.uk) }),
        ).toHaveAttribute('aria-pressed', 'false');
      });
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
        expect(onChange).toHaveBeenCalledExactlyOnceWith('fr');
        expect(setLocale).toHaveBeenCalledExactlyOnceWith('fr');
        expect(document.documentElement).toHaveAttribute('lang', 'fr');
        expect(router.refresh).toHaveBeenCalledOnce();
      });

      test('THEN the Linguist badge is awarded', () => {
        expect(awardBadge).toHaveBeenCalledExactlyOnceWith('linguist');
      });
    });

    describe('WHEN the interface language is picked', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.en) }),
          );
        });
      });

      test('THEN nothing is saved or refreshed', () => {
        expect(setLocale).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
        expect(router.refresh).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a language cookie that takes a while to save', () => {
    let pendingSave: PromiseWithResolvers<void>;

    beforeEach(() => {
      pendingSave = Promise.withResolvers<void>();
      setLocale.mockReturnValue(pendingSave.promise);
      render(<LanguagePicker onChange={onChange} />);
    });

    afterEach(async () => {
      await act(async () => pendingSave.resolve());
    });

    describe('WHEN another language is picked', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.fr) }),
          );
        });
      });

      test('THEN the saving status is announced and the languages are locked meanwhile', () => {
        expect(screen.getByRole('status')).toHaveTextContent(TRANSLATIONS.platform.settings.languageSaving);
        expect(
          screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.uk) }),
        ).toBeDisabled();
      });
    });
  });
});
