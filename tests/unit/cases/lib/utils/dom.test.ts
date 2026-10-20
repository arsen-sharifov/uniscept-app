import type { SyntheticEvent } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { stopPropagation } from '@/lib/utils';

const onStop = vi.fn();

describe('stopPropagation', () => {
  describe('GIVEN an event bubbling up from a nested control', () => {
    describe('WHEN it is handled', () => {
      beforeEach(() => {
        stopPropagation({ stopPropagation: onStop } as unknown as SyntheticEvent);
      });

      test('THEN it stops at that element', () => {
        expect(onStop).toHaveBeenCalledOnce();
      });
    });
  });
});
