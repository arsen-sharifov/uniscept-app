import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { event, LAYOUT_ERROR } from '@mocks/events';
import GlobalError from '@/app/global-error';

vi.mock('@/lib/events', () => import('@mocks/events'));

const reset = vi.fn();

describe('GlobalError', () => {
  describe('GIVEN a root layout that failed to render', () => {
    beforeEach(() => {
      render(<GlobalError error={LAYOUT_ERROR} reset={reset} />, { container: document });
    });

    describe('WHEN the error page shows', () => {
      test('THEN the error is reported without a toast', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(LAYOUT_ERROR, { toast: false, context: 'route.global' });
      });
    });

    describe('WHEN try again is pressed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
      });

      test('THEN the app is reset', () => {
        expect(reset).toHaveBeenCalledOnce();
      });
    });
  });
});
