import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { stubMediaQueries } from '@mocks/browser';
import { setLocale, TRANSLATIONS } from '@mocks/i18n';
import { PREFERENCES } from '@mocks/preferences';
import { AppearanceSection } from '@/app/platform/components/Settings/fragments';

vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/badges', () => import('@mocks/badges'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const onUpdate = vi.fn();

afterEach(() => {
  document.documentElement.removeAttribute('lang');
  vi.unstubAllGlobals();
});

describe('AppearanceSection', () => {
  describe('GIVEN the Eclipse theme on the Blueprint canvas', () => {
    beforeEach(() => {
      render(<AppearanceSection preferences={PREFERENCES} onUpdate={onUpdate} />);
    });

    describe('WHEN another theme is picked', () => {
      beforeEach(() => {
        fireEvent.click(
          within(screen.getByRole('radiogroup', { name: TRANSLATIONS.platform.settings.appearance.theme })).getByRole(
            'radio',
            { name: new RegExp(TRANSLATIONS.platform.settings.appearance.themeTide) },
          ),
        );
      });

      test('THEN the theme preference is updated', () => {
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('theme', 'tide');
      });
    });

    describe('WHEN the active theme and the active canvas pattern are picked again', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('radio', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.themeEclipse) }),
        );
        fireEvent.click(
          screen.getByRole('radio', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.patternLines) }),
        );
      });

      test('THEN nothing is updated', () => {
        expect(onUpdate).not.toHaveBeenCalled();
      });
    });

    describe('WHEN another canvas pattern is picked', () => {
      beforeEach(() => {
        fireEvent.click(
          within(screen.getByRole('radiogroup', { name: TRANSLATIONS.platform.settings.appearance.canvas })).getByRole(
            'radio',
            { name: new RegExp(TRANSLATIONS.platform.settings.appearance.patternDots) },
          ),
        );
      });

      test('THEN the canvas pattern preference is updated', () => {
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('canvasPattern', 'dots');
      });
    });

    describe('WHEN following the system theme is switched on', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('switch', { name: TRANSLATIONS.platform.settings.appearance.themeAuto }));
      });

      test('THEN the theme becomes automatic', () => {
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('theme', 'auto');
      });
    });

    describe('WHEN another language is picked', () => {
      beforeEach(async () => {
        setLocale.mockResolvedValue(undefined);
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: new RegExp(TRANSLATIONS.platform.settings.appearance.languages.fr) }),
          );
        });
      });

      test('THEN the language preference is updated', () => {
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('language', 'fr');
      });
    });
  });

  describe('GIVEN a theme that follows a light system', () => {
    beforeEach(() => {
      stubMediaQueries();
      render(<AppearanceSection preferences={{ ...PREFERENCES, theme: 'auto' }} onUpdate={onUpdate} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the switch is on and no palette is picked', () => {
        expect(screen.getByRole('switch', { name: TRANSLATIONS.platform.settings.appearance.themeAuto })).toBeChecked();
        expect(
          within(screen.getByRole('radiogroup', { name: TRANSLATIONS.platform.settings.appearance.theme })).queryByRole(
            'radio',
            { checked: true },
          ),
        ).not.toBeInTheDocument();
      });
    });

    describe('WHEN following the system is switched off', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('switch', { name: TRANSLATIONS.platform.settings.appearance.themeAuto }));
      });

      test('THEN the light palette of the pair is kept', () => {
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('theme', 'daybreak');
      });
    });
  });

  describe('GIVEN a theme that follows a dark system', () => {
    beforeEach(() => {
      stubMediaQueries().change('(prefers-color-scheme: dark)', true);
      render(<AppearanceSection preferences={{ ...PREFERENCES, theme: 'auto' }} onUpdate={onUpdate} />);
    });

    describe('WHEN following the system is switched off', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('switch', { name: TRANSLATIONS.platform.settings.appearance.themeAuto }));
      });

      test('THEN the dark palette of the pair is kept', () => {
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('theme', 'eclipse');
      });
    });
  });
});
