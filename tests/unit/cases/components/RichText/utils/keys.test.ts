import { describe, expect, test } from 'vitest';

import { REPEATED_DOCUMENT } from '@mocks/richText';
import { withContentKeys } from '@/components/RichText/utils';

describe('withContentKeys', () => {
  describe('GIVEN blocks where two have the same content', () => {
    describe('WHEN keys are derived', () => {
      test('THEN every key is unique and the items keep their order', () => {
        const entries = withContentKeys(REPEATED_DOCUMENT.content);

        expect(new Set(entries.map((entry) => entry.key)).size).toBe(3);
        expect(entries.map((entry) => entry.item)).toEqual(REPEATED_DOCUMENT.content);
      });
    });
  });
});
