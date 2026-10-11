import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TToastType } from '@interfaces';

import { TRANSLATIONS } from '@mocks/i18n';
import { EventBoundary } from '@/components/EventBoundary';
import { useToastStore } from '@/lib/events';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const onCaughtError = vi.fn();

afterEach(() => {
  useToastStore.getState().clear();
});

describe('EventBoundary', () => {
  describe('GIVEN a page with a raised toast', () => {
    beforeEach(() => {
      useToastStore.getState().add({ type: 'success', message: 'Saved', duration: 5000 });
    });

    describe('WHEN the boundary renders around the page', () => {
      beforeEach(() => {
        render(
          <EventBoundary>
            <p>Page</p>
          </EventBoundary>,
        );
      });

      test('THEN the page and the toast are both shown', () => {
        expect(screen.getByText('Page')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Saved');
      });
    });
  });

  describe('GIVEN a toast the toaster cannot draw', () => {
    beforeEach(() => {
      useToastStore.getState().add({ type: 'unknown' as TToastType, message: 'Broken', duration: 5000 });
    });

    describe('WHEN the boundary renders around the page', () => {
      beforeEach(() => {
        render(
          <EventBoundary>
            <p>Page</p>
          </EventBoundary>,
          { onCaughtError },
        );
      });

      test('THEN the page stays and only the notifications are dropped', () => {
        expect(screen.getByText('Page')).toBeInTheDocument();
        expect(screen.queryByRole('region', { name: TRANSLATIONS.common.notifications })).not.toBeInTheDocument();
      });
    });
  });
});
