import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { EDIT_ACCESS, FULL_ACCESS } from '@mocks/roles';
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

      test('THEN the workspace, user and permissions are stored', () => {
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: 'user-1',
          isOwner: false,
          canEditCanvas: true,
          canComment: true,
          canManageStructure: false,
          canManageMembers: false,
          canManageRoles: false,
          canManageWorkspace: false,
        });
      });
    });

    describe('WHEN full access is granted', () => {
      beforeEach(() => {
        usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      });

      test('THEN every permission flag lands on its own field', () => {
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: 'user-1',
          isOwner: true,
          canEditCanvas: true,
          canComment: true,
          canManageStructure: true,
          canManageMembers: true,
          canManageRoles: true,
          canManageWorkspace: true,
        });
      });
    });

    describe('WHEN access is granted with null permissions', () => {
      beforeEach(() => {
        usePermissionsStore.getState().setAccess('ws-1', 'user-1', null);
      });

      test('THEN every permission falls back to denied', () => {
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: 'user-1',
          isOwner: false,
          canEditCanvas: false,
          canComment: false,
          canManageStructure: false,
          canManageMembers: false,
          canManageRoles: false,
          canManageWorkspace: false,
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
          isOwner: false,
          canEditCanvas: false,
          canComment: false,
          canManageStructure: false,
          canManageMembers: false,
          canManageRoles: false,
          canManageWorkspace: false,
        });
      });
    });
  });
});
