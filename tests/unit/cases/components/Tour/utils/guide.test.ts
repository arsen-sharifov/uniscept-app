import { describe, expect, test } from 'vitest';

import { resolveGuideStatus } from '@/components/Tour/utils';

describe('resolveGuideStatus', () => {
  describe('GIVEN a guide row', () => {
    describe('WHEN its status is resolved', () => {
      test('THEN completion wins over the lock and the lock wins over ready', () => {
        expect(resolveGuideStatus(true, true)).toBe('done');
        expect(resolveGuideStatus(false, true)).toBe('locked');
        expect(resolveGuideStatus(false, false)).toBe('ready');
      });
    });
  });
});
