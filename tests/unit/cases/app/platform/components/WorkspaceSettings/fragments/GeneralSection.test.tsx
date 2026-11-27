import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { GeneralSection } from '@/app/platform/components/WorkspaceSettings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onRename = vi.fn();
const onLeave = vi.fn();

const nameField = () =>
  screen.getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.general.nameLabel });

const leaveButton = () => screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.general.leave });

describe('GeneralSection', () => {
  describe('GIVEN a manager who typed a new workspace name', () => {
    beforeEach(() => {
      render(
        <GeneralSection
          workspaceId="ws-1"
          initialName="Product Lab"
          createdAt={null}
          memberCount={2}
          currentRoleName={null}
          isOwner={false}
          canManageWorkspace
          onRename={onRename}
          onLeave={onLeave}
        />,
      );
      fireEvent.change(nameField(), { target: { value: '  Research  ' } });
    });

    describe('WHEN Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(nameField(), { key: 'Enter' });
      });

      test('THEN the trimmed name is saved', () => {
        expect(onRename).toHaveBeenCalledExactlyOnceWith('ws-1', 'Research');
      });
    });

    describe('WHEN another key is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(nameField(), { key: 'a' });
      });

      test('THEN nothing is saved', () => {
        expect(onRename).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the save button is clicked while the rename is still running', () => {
      beforeEach(async () => {
        onRename.mockReturnValue(Promise.withResolvers<void>().promise);
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.general.save }));
        });
      });

      test('THEN the button reports the save and blocks a second one', () => {
        expect(onRename).toHaveBeenCalledOnce();
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.general.saving }),
        ).toBeDisabled();
      });
    });
  });

  describe('GIVEN a manager who has not changed the workspace name', () => {
    beforeEach(() => {
      render(
        <GeneralSection
          workspaceId="ws-1"
          initialName="Product Lab"
          createdAt={null}
          memberCount={2}
          currentRoleName={null}
          isOwner={false}
          canManageWorkspace
          onRename={onRename}
          onLeave={onLeave}
        />,
      );
    });

    describe('WHEN Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(nameField(), { key: 'Enter' });
      });

      test('THEN nothing is saved and the save button stays off', () => {
        expect(onRename).not.toHaveBeenCalled();
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.general.save }),
        ).toBeDisabled();
      });
    });
  });

  describe('GIVEN a member who cannot manage the workspace', () => {
    beforeEach(() => {
      render(
        <GeneralSection
          workspaceId="ws-1"
          initialName="Product Lab"
          createdAt="2026-03-15T12:00:00Z"
          memberCount={3}
          currentRoleName="Reviewer"
          isOwner={false}
          canManageWorkspace={false}
          onRename={onRename}
          onLeave={onLeave}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the details are read-only with the role and the creation date', () => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText('Product Lab')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Reviewer')).toBeInTheDocument();
        expect(screen.getByText('Mar 15, 2026')).toBeInTheDocument();
      });

      test('THEN leaving is offered with what stays behind', () => {
        expect(leaveButton()).toHaveAttribute('aria-disabled', 'false');
        expect(leaveButton()).toHaveAccessibleDescription(TRANSLATIONS.platform.workspaceSettings.general.leaveHint);
      });
    });

    describe('WHEN the leave button is clicked and the call settles', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(leaveButton());
        });
      });

      test('THEN the workspace is left without a confirmation step', () => {
        expect(onLeave).toHaveBeenCalledExactlyOnceWith('ws-1');
      });

      test('THEN the button is ready again', () => {
        expect(leaveButton()).toHaveAttribute('aria-disabled', 'false');
      });
    });

    describe('WHEN the leave button is clicked twice while leaving is still running', () => {
      beforeEach(async () => {
        onLeave.mockReturnValue(Promise.withResolvers<void>().promise);
        leaveButton().focus();
        await act(async () => {
          fireEvent.click(leaveButton());
        });
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.general.leaving }),
          );
        });
      });

      test('THEN the button reports leaving, keeps the focus and ignores the second click', () => {
        expect(onLeave).toHaveBeenCalledOnce();
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.general.leaving }),
        ).toHaveAttribute('aria-disabled', 'true');
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.general.leaving }),
        ).toHaveFocus();
      });
    });
  });

  describe('GIVEN the owner of the workspace', () => {
    beforeEach(() => {
      render(
        <GeneralSection
          workspaceId="ws-1"
          initialName="Product Lab"
          createdAt={null}
          memberCount={2}
          currentRoleName="Owner"
          isOwner
          canManageWorkspace
          onRename={onRename}
          onLeave={onLeave}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN leaving stays locked behind the ownership transfer', () => {
        expect(leaveButton()).toHaveAttribute('aria-disabled', 'true');
        expect(leaveButton()).toHaveAccessibleDescription(
          TRANSLATIONS.platform.workspaceSettings.general.leaveOwnerHint,
        );
      });
    });

    describe('WHEN the locked leave button is clicked', () => {
      beforeEach(() => {
        fireEvent.click(leaveButton());
      });

      test('THEN the workspace is not left', () => {
        expect(onLeave).not.toHaveBeenCalled();
      });
    });
  });
});
