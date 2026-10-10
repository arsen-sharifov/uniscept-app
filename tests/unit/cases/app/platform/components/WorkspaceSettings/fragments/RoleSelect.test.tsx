import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { SELECTABLE_ROLES } from '@mocks/roles';
import { RoleSelect } from '@/app/platform/components/WorkspaceSettings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onChange = vi.fn();

describe('RoleSelect', () => {
  describe('GIVEN an open role list', () => {
    beforeEach(() => {
      render(<RoleSelect value="role-admin" roles={SELECTABLE_ROLES} onChange={onChange} ariaLabel="Role" />);
      fireEvent.click(screen.getByRole('button', { name: 'Role: Admin' }));
    });

    describe('WHEN Tab is pressed while the list itself has focus', () => {
      beforeEach(() => {
        screen.getByRole('listbox').focus();
        fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Tab' });
      });

      test('THEN the list closes and focus moves to the trigger, for the browser to tab on from there', () => {
        expect(screen.queryByRole('listbox')).toBeNull();
        expect(screen.getByRole('button', { name: 'Role: Admin' })).toHaveFocus();
      });
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(screen.getByRole('option', { name: 'Editor' }), { key: 'Escape' });
      });

      test('THEN the list closes and focus returns to the trigger', () => {
        expect(screen.queryByRole('listbox')).toBeNull();
        expect(screen.getByRole('button', { name: 'Role: Admin' })).toHaveFocus();
      });
    });

    describe('WHEN Tab is pressed on an option', () => {
      beforeEach(() => {
        fireEvent.keyDown(screen.getByRole('option', { name: 'Editor' }), { key: 'Tab' });
      });

      test('THEN the list closes and focus moves to the trigger, for the browser to tab on from there', () => {
        expect(screen.queryByRole('listbox')).toBeNull();
        expect(screen.getByRole('button', { name: 'Role: Admin' })).toHaveFocus();
      });
    });
  });
});
