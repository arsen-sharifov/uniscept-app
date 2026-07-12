import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useEscapeKey } from '@hooks';

const onEscape = vi.fn();

describe('useEscapeKey', () => {
  describe('GIVEN an enabled escape listener', () => {
    beforeEach(() => {
      renderHook(() => useEscapeKey(onEscape));
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      test('THEN the callback fires', () => {
        expect(onEscape).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN another key is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      test('THEN the callback stays silent', () => {
        expect(onEscape).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a disabled escape listener', () => {
    beforeEach(() => {
      renderHook(() => useEscapeKey(onEscape, false));
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      test('THEN the callback stays silent', () => {
        expect(onEscape).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an unmounted hook', () => {
    beforeEach(() => {
      renderHook(() => useEscapeKey(onEscape)).unmount();
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      test('THEN the callback stays silent', () => {
        expect(onEscape).not.toHaveBeenCalled();
      });
    });
  });
});
