import { beforeEach, describe, expect, test } from 'vitest';

import { GROUPABLE_ITEMS } from '@mocks/collections';
import { groupBy } from '@/lib/utils';

let groups: Map<string, typeof GROUPABLE_ITEMS>;

describe('groupBy', () => {
  describe('GIVEN items sharing some keys', () => {
    describe('WHEN they are grouped by that key', () => {
      beforeEach(() => {
        groups = groupBy(GROUPABLE_ITEMS, (item) => item.node);
      });

      test('THEN each key holds its items in their original order', () => {
        expect([...groups.keys()]).toEqual(['n1', 'n2']);
        expect(groups.get('n1')?.map((item) => item.id)).toEqual(['a', 'c']);
        expect(groups.get('n2')?.map((item) => item.id)).toEqual(['b']);
      });
    });
  });

  describe('GIVEN no items', () => {
    describe('WHEN they are grouped', () => {
      test('THEN the result is empty', () => {
        expect(groupBy([], (item: { key: string }) => item.key).size).toBe(0);
      });
    });
  });
});
