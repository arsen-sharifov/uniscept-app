import { describe, expect, test } from 'vitest';

import { getSingleDeleteTitleKey } from '@/components/Sidebar/utils';

describe('getSingleDeleteTitleKey', () => {
  describe('GIVEN a workspace item', () => {
    describe('WHEN the delete title key is resolved', () => {
      test('THEN the workspace title key is returned', () => {
        expect(getSingleDeleteTitleKey('workspace')).toBe('deleteWorkspaceTitle');
      });
    });
  });

  describe('GIVEN a folder item', () => {
    describe('WHEN the delete title key is resolved', () => {
      test('THEN the folder title key is returned', () => {
        expect(getSingleDeleteTitleKey('folder')).toBe('deleteFolderTitle');
      });
    });
  });

  describe('GIVEN a thread item', () => {
    describe('WHEN the delete title key is resolved', () => {
      test('THEN the thread title key is returned', () => {
        expect(getSingleDeleteTitleKey('thread')).toBe('deleteThreadTitle');
      });
    });
  });
});
