import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useMounted } from '@hooks';

describe('useMounted', () => {
  describe('GIVEN a client environment', () => {
    describe('WHEN the hook renders', () => {
      test('THEN it reports mounted', () => {
        const { result } = renderHook(() => useMounted());

        expect(result.current).toBe(true);
      });
    });
  });
});
