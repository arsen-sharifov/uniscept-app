import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createAuroraRenderer, renderer } from '@mocks/auroraRenderer';
import {
  stubAnimationFrame,
  stubFontsReady,
  stubIntersectionObserver,
  stubMediaQueries,
  stubResizeObserver,
  stubScrollIntoView,
} from '@mocks/browser';
import { TRANSLATIONS } from '@mocks/i18n';
import { LANDING_SCREEN_LABELS } from '@mocks/landing';
import { Landing } from '@/app/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/app/fragments/utils/auroraRenderer', () => import('@mocks/auroraRenderer'));

let scrollIntoView: ReturnType<typeof stubScrollIntoView>;
let fonts: ReturnType<typeof stubFontsReady>;
let visibility: ReturnType<typeof stubIntersectionObserver>;

const rail = () => screen.getByRole('navigation', { name: TRANSLATIONS.landing.header.logo });

beforeEach(() => {
  vi.useFakeTimers();
  stubAnimationFrame();
  stubMediaQueries();
  stubResizeObserver();
  fonts = stubFontsReady();
  visibility = stubIntersectionObserver();
  scrollIntoView = stubScrollIntoView();
  createAuroraRenderer.mockReturnValue(renderer);
});

afterEach(() => {
  fonts.restore();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Landing', () => {
  describe('GIVEN the landing page', () => {
    beforeEach(() => {
      render(<Landing />);
    });

    describe('WHEN it renders', () => {
      test('THEN the hero leads and the rail lists every screen with the first one current', () => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(TRANSLATIONS.landing.hero.title);
        expect(
          within(rail())
            .getAllByRole('button')
            .map((dot) => dot.getAttribute('aria-label')),
        ).toEqual(LANDING_SCREEN_LABELS);
        expect(within(rail()).getByRole('button', { name: LANDING_SCREEN_LABELS[0] })).toHaveAttribute(
          'aria-current',
          'true',
        );
      });
    });

    describe('WHEN the problem dot of the rail is pressed', () => {
      beforeEach(() => {
        fireEvent.click(within(rail()).getByRole('button', { name: TRANSLATIONS.landing.problem.title }));
      });

      test('THEN the problem screen scrolls into view', () => {
        expect(scrollIntoView).toHaveBeenCalledOnce();
        expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('problem'));
      });
    });

    describe('WHEN the problem screen comes into view', () => {
      beforeEach(() => {
        act(() => visibility.intersect(document.getElementById('problem')!));
      });

      test('THEN the rail marks it as the current screen', () => {
        expect(within(rail()).getByRole('button', { name: TRANSLATIONS.landing.problem.title })).toHaveAttribute(
          'aria-current',
          'true',
        );
        expect(within(rail()).getByRole('button', { name: LANDING_SCREEN_LABELS[0] })).not.toHaveAttribute(
          'aria-current',
        );
      });
    });

    describe('WHEN the secondary call to action of the hero is pressed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.landing.hero.ctaSecondary }));
      });

      test('THEN the problem screen scrolls into view', () => {
        expect(scrollIntoView).toHaveBeenCalledOnce();
        expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('problem'));
      });
    });

    describe('WHEN the logo in the header is pressed', () => {
      beforeEach(() => {
        fireEvent.click(
          within(screen.getByRole('banner')).getByRole('button', { name: TRANSLATIONS.landing.header.logo }),
        );
      });

      test('THEN the page scrolls back to the hero', () => {
        expect(scrollIntoView).toHaveBeenCalledOnce();
        expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('top'));
      });
    });
  });
});
