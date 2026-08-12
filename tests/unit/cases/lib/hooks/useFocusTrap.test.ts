import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { useFocusTrap } from '@hooks';

const container = document.createElement('div');
const first = document.createElement('button');
const last = document.createElement('button');

container.append(first, last);

let tabEvent: KeyboardEvent;

beforeEach(() => {
  document.body.append(container);
});

afterEach(() => {
  container.remove();
});

describe('useFocusTrap', () => {
  describe('GIVEN an active trap around two focusable elements', () => {
    beforeEach(() => {
      renderHook(() => useFocusTrap({ current: container }, true));
    });

    describe('WHEN Tab is pressed on the last element', () => {
      beforeEach(() => {
        last.focus();
        tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
        document.dispatchEvent(tabEvent);
      });

      test('THEN the focus wraps to the first element', () => {
        expect(document.activeElement).toBe(first);
        expect(tabEvent.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN Shift+Tab is pressed on the first element', () => {
      beforeEach(() => {
        first.focus();
        tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true });
        document.dispatchEvent(tabEvent);
      });

      test('THEN the focus wraps to the last element', () => {
        expect(document.activeElement).toBe(last);
        expect(tabEvent.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN Tab is pressed away from the boundaries', () => {
      beforeEach(() => {
        first.focus();
        tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
        document.dispatchEvent(tabEvent);
      });

      test('THEN the focus is left to the browser', () => {
        expect(document.activeElement).toBe(first);
        expect(tabEvent.defaultPrevented).toBe(false);
      });
    });

    describe('WHEN Shift+Tab is pressed on the last element', () => {
      beforeEach(() => {
        last.focus();
        tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true });
        document.dispatchEvent(tabEvent);
      });

      test('THEN the focus does not wrap', () => {
        expect(document.activeElement).toBe(last);
        expect(tabEvent.defaultPrevented).toBe(false);
      });
    });
  });

  describe('GIVEN an active trap without focusable elements', () => {
    beforeEach(() => {
      renderHook(() => useFocusTrap({ current: document.createElement('div') }, true));
    });

    describe('WHEN Tab is pressed', () => {
      beforeEach(() => {
        tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
        document.dispatchEvent(tabEvent);
      });

      test('THEN the focus is left to the browser', () => {
        expect(tabEvent.defaultPrevented).toBe(false);
      });
    });
  });

  describe('GIVEN an inactive trap', () => {
    beforeEach(() => {
      renderHook(() => useFocusTrap({ current: container }, false));
    });

    describe('WHEN Tab is pressed on the last element', () => {
      beforeEach(() => {
        last.focus();
        tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
        document.dispatchEvent(tabEvent);
      });

      test('THEN the focus does not wrap', () => {
        expect(document.activeElement).toBe(last);
        expect(tabEvent.defaultPrevented).toBe(false);
      });
    });
  });

  describe('GIVEN an unmounted trap', () => {
    beforeEach(() => {
      renderHook(() => useFocusTrap({ current: container }, true)).unmount();
    });

    describe('WHEN Tab is pressed on the last element', () => {
      beforeEach(() => {
        last.focus();
        tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
        document.dispatchEvent(tabEvent);
      });

      test('THEN the focus does not wrap', () => {
        expect(document.activeElement).toBe(last);
        expect(tabEvent.defaultPrevented).toBe(false);
      });
    });
  });
});
