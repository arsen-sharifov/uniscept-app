import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { useToastStore } from '@/lib/events';

afterEach(() => {
  useToastStore.getState().clear();
});

describe('toastStore', () => {
  describe('GIVEN an empty store', () => {
    describe('WHEN a toast is added', () => {
      let id: string;

      beforeEach(() => {
        id = useToastStore.getState().add({ type: 'success', message: 'Saved', duration: 5000 });
      });

      test('THEN it appears with the returned id', () => {
        expect(useToastStore.getState().toasts).toEqual([{ id, type: 'success', message: 'Saved', duration: 5000 }]);
      });
    });

    describe('WHEN more toasts than the visible cap are added', () => {
      beforeEach(() => {
        ['one', 'two', 'three', 'four', 'five'].forEach((message) =>
          useToastStore.getState().add({ type: 'info', message, duration: 5000 }),
        );
      });

      test('THEN only the latest four remain', () => {
        expect(useToastStore.getState().toasts).toEqual([
          expect.objectContaining({ message: 'two' }),
          expect.objectContaining({ message: 'three' }),
          expect.objectContaining({ message: 'four' }),
          expect.objectContaining({ message: 'five' }),
        ]);
      });
    });
  });

  describe('GIVEN a store with toasts', () => {
    let dismissedId: string;

    beforeEach(() => {
      dismissedId = useToastStore.getState().add({ type: 'info', message: 'first', duration: 5000 });
      useToastStore.getState().add({ type: 'info', message: 'second', duration: 5000 });
    });

    describe('WHEN one toast is dismissed', () => {
      beforeEach(() => {
        useToastStore.getState().dismiss(dismissedId);
      });

      test('THEN only the other toast remains', () => {
        expect(useToastStore.getState().toasts).toEqual([expect.objectContaining({ message: 'second' })]);
      });
    });

    describe('WHEN the store is cleared', () => {
      beforeEach(() => {
        useToastStore.getState().clear();
      });

      test('THEN no toasts remain', () => {
        expect(useToastStore.getState().toasts).toEqual([]);
      });
    });
  });
});
