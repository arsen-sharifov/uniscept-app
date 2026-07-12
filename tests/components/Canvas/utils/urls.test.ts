import { describe, expect, test } from 'vitest';

import { buildReferenceUrl } from '@/components/Canvas/utils';

describe('buildReferenceUrl', () => {
  describe('GIVEN a workspace and a thread', () => {
    describe('WHEN the url is built', () => {
      test('THEN it targets the thread with the reference focus flag', () => {
        expect(buildReferenceUrl('ws-1', 'th-1')).toBe('/platform/ws-1/th-1?focus=ref');
      });
    });
  });

  describe('GIVEN a target node', () => {
    describe('WHEN the url is built', () => {
      test('THEN the node id is appended', () => {
        expect(buildReferenceUrl('ws-1', 'th-1', 'n1')).toBe('/platform/ws-1/th-1?focus=ref&node=n1');
      });
    });
  });

  describe('GIVEN ids with unsafe characters', () => {
    describe('WHEN the url is built', () => {
      test('THEN the path segments are encoded', () => {
        expect(buildReferenceUrl('ws 1', 'th/1')).toBe('/platform/ws%201/th%2F1?focus=ref');
      });
    });
  });

  describe('GIVEN a node id with unsafe characters', () => {
    describe('WHEN the url is built', () => {
      test('THEN the query parameter is form-encoded', () => {
        expect(buildReferenceUrl('ws-1', 'th-1', 'n 1')).toBe('/platform/ws-1/th-1?focus=ref&node=n+1');
      });
    });
  });

  describe('GIVEN a missing workspace or thread', () => {
    describe('WHEN the url is built', () => {
      test('THEN no url is produced', () => {
        expect(buildReferenceUrl('', 'th-1')).toBeNull();
        expect(buildReferenceUrl('ws-1', '')).toBeNull();
      });
    });
  });
});
