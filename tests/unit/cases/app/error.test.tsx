import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { event, DIGEST_ROUTE_ERROR } from '@mocks/events';
import { TRANSLATIONS } from '@mocks/i18n';
import RootError from '@/app/error';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const reset = vi.fn();

describe('RootError', () => {
  describe('GIVEN a route that failed to render', () => {
    beforeEach(() => {
      render(<RootError error={DIGEST_ROUTE_ERROR} reset={reset} />);
    });

    describe('WHEN the error page shows', () => {
      test('THEN the error is reported without a toast', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(DIGEST_ROUTE_ERROR, {
          toast: false,
          context: 'route.error',
        });
      });
    });

    describe('WHEN retry is pressed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.common.errorPages.retry }));
      });

      test('THEN the route is reset', () => {
        expect(reset).toHaveBeenCalledOnce();
      });
    });
  });
});
