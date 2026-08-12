import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { deleteNodeOp } from '@mocks/canvas';
import { emitCanvasOperation, subscribeCanvasOperations } from '@/lib/canvas';

const onFirst = vi.fn();
const onSecond = vi.fn();

const unsubscribers: Array<() => void> = [];

afterEach(() => {
  unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
});

describe('operations', () => {
  describe('GIVEN two subscribed listeners', () => {
    beforeEach(() => {
      unsubscribers.push(subscribeCanvasOperations(onFirst));
      unsubscribers.push(subscribeCanvasOperations(onSecond));
    });

    describe('WHEN an operation is emitted', () => {
      beforeEach(() => {
        emitCanvasOperation(deleteNodeOp('n1'));
      });

      test('THEN both listeners receive it', () => {
        expect(onFirst).toHaveBeenCalledExactlyOnceWith(deleteNodeOp('n1'));
        expect(onSecond).toHaveBeenCalledExactlyOnceWith(deleteNodeOp('n1'));
      });
    });
  });

  describe('GIVEN a listener that unsubscribed', () => {
    beforeEach(() => {
      const unsubscribe = subscribeCanvasOperations(onFirst);
      unsubscribers.push(subscribeCanvasOperations(onSecond));
      unsubscribe();
    });

    describe('WHEN an operation is emitted', () => {
      beforeEach(() => {
        emitCanvasOperation(deleteNodeOp('n1'));
      });

      test('THEN only the remaining listener receives it', () => {
        expect(onFirst).not.toHaveBeenCalled();
        expect(onSecond).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GIVEN no listeners', () => {
    describe('WHEN an operation is emitted', () => {
      test('THEN nothing throws', () => {
        expect(() => emitCanvasOperation(deleteNodeOp('n1'))).not.toThrow();
      });
    });
  });
});
