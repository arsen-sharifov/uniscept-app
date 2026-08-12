import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { MODAL_SCROLL_LOCK_KEY } from '@constants';
import { adjustScrollLock } from '@/components/Modal/utils';

afterEach(() => {
  Reflect.deleteProperty(window, MODAL_SCROLL_LOCK_KEY);
  document.body.style.overflow = '';
});

describe('adjustScrollLock', () => {
  describe('GIVEN an unlocked page', () => {
    describe('WHEN a modal locks the scroll', () => {
      beforeEach(() => {
        adjustScrollLock(1);
      });

      test('THEN the body stops scrolling', () => {
        expect(document.body.style.overflow).toBe('hidden');
        expect(Reflect.get(window, MODAL_SCROLL_LOCK_KEY)).toBe(1);
      });
    });

    describe('WHEN the lock is decremented without a lock', () => {
      beforeEach(() => {
        adjustScrollLock(-1);
      });

      test('THEN the counter floors at zero and the body stays scrollable', () => {
        expect(document.body.style.overflow).toBe('');
        expect(Reflect.get(window, MODAL_SCROLL_LOCK_KEY)).toBe(0);
      });
    });
  });

  describe('GIVEN a server environment', () => {
    beforeEach(() => {
      vi.stubGlobal('window', undefined);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    describe('WHEN a modal locks the scroll', () => {
      test('THEN nothing happens', () => {
        expect(() => adjustScrollLock(1)).not.toThrow();
        expect(document.body.style.overflow).toBe('');
      });
    });
  });

  describe('GIVEN two stacked modals', () => {
    beforeEach(() => {
      adjustScrollLock(1);
      adjustScrollLock(1);
    });

    describe('WHEN one modal closes', () => {
      beforeEach(() => {
        adjustScrollLock(-1);
      });

      test('THEN the body stays locked', () => {
        expect(document.body.style.overflow).toBe('hidden');
        expect(Reflect.get(window, MODAL_SCROLL_LOCK_KEY)).toBe(1);
      });
    });

    describe('WHEN both modals close', () => {
      beforeEach(() => {
        adjustScrollLock(-1);
        adjustScrollLock(-1);
      });

      test('THEN the body scroll restores', () => {
        expect(document.body.style.overflow).toBe('');
        expect(Reflect.get(window, MODAL_SCROLL_LOCK_KEY)).toBe(0);
      });
    });
  });
});
