import { type RenderResult, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { saveState } from '@mocks/canvas';
import { TRANSLATIONS, translate } from '@mocks/i18n';
import { SaveStatus } from '@/components/Canvas/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

let view: RenderResult;

describe('SaveStatus', () => {
  describe('GIVEN a save that is being retried', () => {
    describe('WHEN the second attempt is running', () => {
      beforeEach(() => {
        render(<SaveStatus state={saveState({ status: 'retrying', retryAttempt: 2 })} />);
      });

      test('THEN a polite status output names the retry and its attempt', () => {
        expect(screen.getByRole('status', { name: TRANSLATIONS.platform.canvas.save.retrying })).toHaveTextContent(
          translate('platform.canvas.save.retryAttempt', { n: 2 }),
        );
        expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
        expect(screen.getByRole('status').tagName).toBe('OUTPUT');
      });
    });
  });

  describe('GIVEN a canvas that went offline with pending changes', () => {
    describe('WHEN the status renders', () => {
      beforeEach(() => {
        render(<SaveStatus state={saveState({ status: 'offline', pendingCount: 3 })} />);
      });

      test('THEN a polite status output counts the pending changes', () => {
        expect(screen.getByRole('status', { name: TRANSLATIONS.platform.canvas.save.offline })).toHaveTextContent(
          translate('platform.canvas.save.offlinePending', { count: 3 }),
        );
      });
    });
  });

  describe('GIVEN a save that failed', () => {
    describe('WHEN the status renders', () => {
      beforeEach(() => {
        render(<SaveStatus state={saveState({ status: 'error' })} />);
      });

      test('THEN an assertive alert offers retry and discard', () => {
        expect(screen.getByRole('alert', { name: TRANSLATIONS.platform.canvas.save.errorTitle })).toHaveAttribute(
          'aria-live',
          'assertive',
        );
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.save.retryAriaLabel }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.save.discardAriaLabel }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a save that failed for two changes', () => {
    describe('WHEN the status renders', () => {
      beforeEach(() => {
        render(<SaveStatus state={saveState({ status: 'error', failedCount: 2 })} />);
      });

      test('THEN the alert counts the unsaved changes', () => {
        expect(screen.getByRole('alert', { name: TRANSLATIONS.platform.canvas.save.errorTitle })).toHaveTextContent(
          translate('platform.canvas.save.errorChanges', { count: 2 }),
        );
      });
    });
  });

  describe('GIVEN a save that went through', () => {
    describe('WHEN the status renders', () => {
      beforeEach(() => {
        view = render(<SaveStatus state={saveState({ status: 'saved', lastSavedAt: 1 })} />);
      });

      test('THEN nothing is shown', () => {
        expect(view.container).toBeEmptyDOMElement();
      });
    });
  });
});
