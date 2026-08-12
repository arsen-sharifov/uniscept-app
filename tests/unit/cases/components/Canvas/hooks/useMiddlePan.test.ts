import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { useMiddlePan } from '@/components/Canvas/hooks';
import { useCanvasStore } from '@/lib/stores';

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
});

describe('useMiddlePan', () => {
  describe('GIVEN a mounted middle-pan listener', () => {
    beforeEach(() => {
      renderHook(() => useMiddlePan());
    });

    describe('WHEN the middle button is pressed', () => {
      let press: MouseEvent;

      beforeEach(() => {
        press = new MouseEvent('mousedown', { button: 1, cancelable: true });
        window.dispatchEvent(press);
      });

      test('THEN the pan engages and the default is prevented', () => {
        expect(useCanvasStore.getState().middlePan).toBe(true);
        expect(press.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN the left button is pressed', () => {
      let press: MouseEvent;

      beforeEach(() => {
        press = new MouseEvent('mousedown', { button: 0, cancelable: true });
        window.dispatchEvent(press);
      });

      test('THEN nothing engages', () => {
        expect(useCanvasStore.getState().middlePan).toBe(false);
        expect(press.defaultPrevented).toBe(false);
      });
    });

    describe('WHEN a middle-button aux click fires', () => {
      let click: MouseEvent;

      beforeEach(() => {
        click = new MouseEvent('auxclick', { button: 1, cancelable: true });
        window.dispatchEvent(click);
      });

      test('THEN the default aux action is prevented', () => {
        expect(click.defaultPrevented).toBe(true);
      });
    });
  });

  describe('GIVEN an engaged middle pan', () => {
    beforeEach(() => {
      renderHook(() => useMiddlePan());
      window.dispatchEvent(new MouseEvent('mousedown', { button: 1, cancelable: true }));
    });

    describe('WHEN the middle button is released', () => {
      beforeEach(() => {
        window.dispatchEvent(new MouseEvent('mouseup', { button: 1, cancelable: true }));
      });

      test('THEN the pan disengages', () => {
        expect(useCanvasStore.getState().middlePan).toBe(false);
      });
    });

    describe('WHEN the window loses focus', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('blur'));
      });

      test('THEN the pan disengages', () => {
        expect(useCanvasStore.getState().middlePan).toBe(false);
      });
    });
  });

  describe('GIVEN an unmounted middle-pan listener', () => {
    beforeEach(() => {
      renderHook(() => useMiddlePan()).unmount();
    });

    describe('WHEN the middle button is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new MouseEvent('mousedown', { button: 1, cancelable: true }));
      });

      test('THEN the pan stays off', () => {
        expect(useCanvasStore.getState().middlePan).toBe(false);
      });
    });
  });
});
