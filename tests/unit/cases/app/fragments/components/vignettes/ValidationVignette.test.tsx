import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { useVignettePhase } from '@mocks/landingHooks';
import { ValidationVignette } from '@/app/fragments/components/vignettes';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/app/fragments/hooks', () => import('@mocks/landingHooks'));

afterEach(cleanup);

describe('ValidationVignette', () => {
  describe('GIVEN a refuted premise still connected to the conclusion', () => {
    beforeEach(() => {
      useVignettePhase.mockReturnValue(1);
    });

    describe('WHEN the validation cascade is displayed', () => {
      beforeEach(() => {
        render(<ValidationVignette />);
      });

      test('THEN the conclusion is affected', () => {
        expect(
          screen.getByText(TRANSLATIONS.landing.product.vignettes.validationConclusion).parentElement,
        ).toHaveAttribute('data-status', 'affected');
      });
    });
  });

  describe('GIVEN the repaired phase of the demonstration', () => {
    beforeEach(() => {
      useVignettePhase.mockReturnValue(2);
    });

    describe('WHEN the conclusion recovers', () => {
      beforeEach(() => {
        render(<ValidationVignette />);
      });

      test('THEN only the valid supporting edge remains', () => {
        expect(document.querySelectorAll('svg > path[marker-end]')).toHaveLength(1);
        expect(document.querySelector('path[marker-end]')).toHaveAttribute('marker-end', 'url(#hero-arrow-valid)');
      });

      test('THEN the conclusion is valid while the rejected premise remains refuted', () => {
        expect(
          screen.getByText(TRANSLATIONS.landing.product.vignettes.validationConclusion).parentElement,
        ).toHaveAttribute('data-status', 'valid');
        expect(
          screen.getByText(TRANSLATIONS.landing.product.vignettes.validationPremise).parentElement,
        ).toHaveAttribute('data-status', 'refuted');
      });
    });
  });
});
