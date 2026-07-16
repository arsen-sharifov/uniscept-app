import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useClickOutside } from '@hooks';

const onOutside = vi.fn();

const container = document.createElement('div');
const inside = document.createElement('button');
const outside = document.createElement('button');

container.append(inside);

beforeEach(() => {
  document.body.append(container, outside);
});

afterEach(() => {
  container.remove();
  outside.remove();
});

describe('useClickOutside', () => {
  describe('GIVEN an enabled outside listener', () => {
    beforeEach(() => {
      renderHook(() => useClickOutside({ current: container }, onOutside));
    });

    describe('WHEN the press lands outside the container', () => {
      beforeEach(() => {
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      test('THEN the callback fires', () => {
        expect(onOutside).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN the press lands inside the container', () => {
      beforeEach(() => {
        inside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      test('THEN the callback stays silent', () => {
        expect(onOutside).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a disabled outside listener', () => {
    beforeEach(() => {
      renderHook(() => useClickOutside({ current: container }, onOutside, false));
    });

    describe('WHEN the press lands outside the container', () => {
      beforeEach(() => {
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      test('THEN the callback stays silent', () => {
        expect(onOutside).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a listener with a detached ref', () => {
    beforeEach(() => {
      renderHook(() => useClickOutside({ current: null }, onOutside));
    });

    describe('WHEN the press lands outside the container', () => {
      beforeEach(() => {
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      test('THEN the callback stays silent', () => {
        expect(onOutside).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an unmounted listener', () => {
    beforeEach(() => {
      renderHook(() => useClickOutside({ current: container }, onOutside)).unmount();
    });

    describe('WHEN the press lands outside the container', () => {
      beforeEach(() => {
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      test('THEN the callback stays silent', () => {
        expect(onOutside).not.toHaveBeenCalled();
      });
    });
  });
});
