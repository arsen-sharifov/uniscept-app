import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';

import { createRootAttributeSubscription } from '@/lib/utils';

const onChange = vi.fn();
const onOtherChange = vi.fn();

let unsubscribe: () => void;

afterEach(() => {
  document.documentElement.removeAttribute('data-watched');
  document.documentElement.removeAttribute('data-other');
});

describe('createRootAttributeSubscription', () => {
  describe('GIVEN a subscriber to one root attribute', () => {
    beforeEach(() => {
      unsubscribe = createRootAttributeSubscription(['data-watched'])(onChange);
    });

    afterEach(() => {
      unsubscribe();
    });

    describe('WHEN the watched attribute changes', () => {
      beforeEach(async () => {
        document.documentElement.setAttribute('data-watched', 'on');
        await Promise.resolve();
      });

      test('THEN the subscriber is notified', () => {
        expect(onChange).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN another attribute changes', () => {
      beforeEach(async () => {
        document.documentElement.setAttribute('data-other', 'on');
        await Promise.resolve();
      });

      test('THEN the subscriber is left alone', () => {
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a subscriber that has unsubscribed', () => {
    beforeEach(() => {
      createRootAttributeSubscription(['data-watched'])(onChange)();
    });

    describe('WHEN the watched attribute changes', () => {
      beforeEach(async () => {
        document.documentElement.setAttribute('data-watched', 'on');
        await Promise.resolve();
      });

      test('THEN the subscriber is not notified', () => {
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN two subscribers of one subscription', () => {
    let unsubscribeOther: () => void;
    let disconnect: MockInstance<MutationObserver['disconnect']>;

    beforeEach(() => {
      disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
      const subscribe = createRootAttributeSubscription(['data-watched']);
      unsubscribe = subscribe(onChange);
      unsubscribeOther = subscribe(onOtherChange);
    });

    afterEach(() => {
      unsubscribe();
    });

    describe('WHEN one leaves and the watched attribute changes', () => {
      beforeEach(async () => {
        unsubscribeOther();
        document.documentElement.setAttribute('data-watched', 'on');
        await Promise.resolve();
      });

      test('THEN the one that stayed is still notified', () => {
        expect(onChange).toHaveBeenCalledOnce();
        expect(onOtherChange).not.toHaveBeenCalled();
      });
    });

    describe('WHEN both leave', () => {
      beforeEach(() => {
        unsubscribeOther();
        unsubscribe();
      });

      test('THEN the observer disconnects', () => {
        expect(disconnect).toHaveBeenCalledOnce();
      });
    });
  });
});
