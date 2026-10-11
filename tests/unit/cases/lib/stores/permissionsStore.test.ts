import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { EDIT_ACCESS, FULL_ACCESS, READONLY_ACCESS } from '@mocks/roles';
import { usePermissionsStore } from '@/lib/stores';

afterEach(() => {
  usePermissionsStore.getState().clearAccess();
});

describe('permissionsStore', () => {
  describe('GIVEN the initial store', () => {
    describe('WHEN access is granted', () => {
      beforeEach(() => {
        usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
      });

      test('THEN the workspace, user and permissions are stored as resolved', () => {
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: 'user-1',
          resolved: true,
          ...EDIT_ACCESS,
        });
      });
    });

    describe('WHEN full access is granted', () => {
      beforeEach(() => {
        usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      });

      test('THEN every permission flag lands on its own field', () => {
        expect(usePermissionsStore.getState()).toMatchObject({ workspaceId: 'ws-1', userId: 'user-1', ...FULL_ACCESS });
      });
    });

    describe('WHEN access is granted with null permissions', () => {
      beforeEach(() => {
        usePermissionsStore.getState().setAccess('ws-1', 'user-1', null);
      });

      test('THEN the access resolves with every permission denied', () => {
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: 'user-1',
          resolved: true,
          ...READONLY_ACCESS,
        });
      });
    });
  });

  describe('GIVEN a store with full access granted', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
    });

    describe('WHEN access is cleared', () => {
      beforeEach(() => {
        usePermissionsStore.getState().clearAccess();
      });

      test('THEN every field returns to its initial denied shape', () => {
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: null,
          userId: null,
          resolved: false,
          ...READONLY_ACCESS,
        });
      });
    });

    describe('WHEN access is cleared for a workspace that is about to load', () => {
      beforeEach(() => {
        usePermissionsStore.getState().clearAccess('ws-2');
      });

      test('THEN the pending workspace is kept with nothing resolved or granted', () => {
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-2',
          userId: null,
          resolved: false,
          ...READONLY_ACCESS,
        });
      });
    });
  });
});
