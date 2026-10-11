import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { event, RENDER_ERROR } from '@mocks/events';
import { ErrorBoundary } from '@/components/ErrorBoundary';

vi.mock('@/lib/events', () => import('@mocks/events'));

const onCaughtError = vi.fn();

const Broken = () => {
  throw RENDER_ERROR;
};

describe('ErrorBoundary', () => {
  describe('GIVEN children that render', () => {
    describe('WHEN the boundary renders', () => {
      beforeEach(() => {
        render(
          <ErrorBoundary fallback={<p>Fallback</p>}>
            <p>Content</p>
          </ErrorBoundary>,
        );
      });

      test('THEN the children are shown and nothing is reported', () => {
        expect(screen.getByText('Content')).toBeInTheDocument();
        expect(screen.queryByText('Fallback')).not.toBeInTheDocument();
        expect(event.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a child that throws while rendering', () => {
    describe('WHEN the boundary renders', () => {
      beforeEach(() => {
        render(
          <ErrorBoundary fallback={<p>Fallback</p>}>
            <Broken />
          </ErrorBoundary>,
          { onCaughtError },
        );
      });

      test('THEN the fallback replaces the children', () => {
        expect(screen.getByText('Fallback')).toBeInTheDocument();
      });

      test('THEN the error is reported without a toast', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(RENDER_ERROR, { toast: false, context: 'boundary.render' });
      });
    });
  });
});
