import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { ErrorFallback } from '@/components/ErrorBoundary';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onReset = vi.fn();

describe('ErrorFallback', () => {
  describe('GIVEN a way to retry', () => {
    beforeEach(() => {
      render(<ErrorFallback onReset={onReset} />);
    });

    describe('WHEN it renders', () => {
      test('THEN it explains the failure', () => {
        expect(screen.getByText(TRANSLATIONS.common.errorPages.errorTitle)).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.common.errorPages.errorHint)).toBeInTheDocument();
      });
    });

    describe('WHEN retry is pressed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.common.errorPages.retry }));
      });

      test('THEN it resets', () => {
        expect(onReset).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN no way to retry', () => {
    beforeEach(() => {
      render(<ErrorFallback />);
    });

    describe('WHEN it renders', () => {
      test('THEN it offers the way home instead of a retry', () => {
        expect(screen.getByRole('button', { name: TRANSLATIONS.common.errorPages.backHome })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: TRANSLATIONS.common.errorPages.retry })).not.toBeInTheDocument();
      });
    });
  });
});
