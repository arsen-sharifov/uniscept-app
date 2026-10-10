import { act, fireEvent, render, screen, within, type RenderResult } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IWorkspaceItem } from '@interfaces';
import {
  getCurrentUserId,
  getFolders,
  getMyInvitations,
  getMyWorkspacePermissions,
  getMyWorkspaces,
  getOnboarding,
  getPreferences,
  getThreads,
  getUser,
  getWorkspace,
  getWorkspaceMembers,
  getWorkspaceRoles,
} from '@api/client';
import { stubAnimationFrame, stubResizeObserver } from '@mocks/browser';
import { TRANSLATIONS } from '@mocks/i18n';
import { routeParams } from '@mocks/navigation';
import { FULL_ACCESS, OWNER_ROLE, workspaceMember } from '@mocks/roles';
import { threadInput, workspaceItem } from '@mocks/sidebar';
import { primeSupabase } from '@mocks/supabase';
import { USER_WITH_METADATA_RESPONSE } from '@mocks/userApi';
import WorkspaceLayout from '@/app/platform/layout';
import { useOnboardingStore } from '@/lib/onboarding';
import { usePermissionsStore } from '@/lib/stores';

vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@api/client', async () => ({
  ...(await import('@mocks/authApi')),
  ...(await import('@mocks/canvasApi')),
  ...(await import('@mocks/onboardingApi')),
  ...(await import('@mocks/userApi')),
  ...(await import('@mocks/workspaceApi')),
}));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));
vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

const layoutElement = (
  <NextIntlClientProvider locale="en" timeZone="UTC">
    <WorkspaceLayout>
      <p>Thread canvas</p>
    </WorkspaceLayout>
  </NextIntlClientProvider>
);

let view: RenderResult;

beforeEach(() => {
  stubAnimationFrame();
  stubResizeObserver();
  primeSupabase([]);
  vi.mocked(getUser).mockResolvedValue(USER_WITH_METADATA_RESPONSE);
  vi.mocked(getPreferences).mockResolvedValue(null);
  vi.mocked(getCurrentUserId).mockReturnValue(Promise.withResolvers<string>().promise);
  vi.mocked(getOnboarding).mockReturnValue(Promise.withResolvers<never>().promise);
  vi.mocked(getMyWorkspacePermissions).mockResolvedValue(FULL_ACCESS);
  vi.mocked(getMyInvitations).mockResolvedValue([]);
  vi.mocked(getMyWorkspaces).mockResolvedValue([workspaceItem('ws-1')]);
  vi.mocked(getFolders).mockResolvedValue([]);
  vi.mocked(getThreads).mockResolvedValue([]);
  vi.mocked(getWorkspace).mockResolvedValue({
    id: 'ws-1',
    name: 'Workspace ws-1',
    ownerId: 'user-1',
    createdAt: '2026-03-15T12:00:00Z',
  });
  vi.mocked(getWorkspaceRoles).mockResolvedValue([OWNER_ROLE]);
  vi.mocked(getWorkspaceMembers).mockResolvedValue([
    workspaceMember('user-1', 'role-owner', { roleKey: 'owner', isOwner: true }),
  ]);
});

afterEach(() => {
  delete routeParams.workspaceId;
  delete routeParams.threadId;
  usePermissionsStore.getState().clearAccess();
  useOnboardingStore.getState().forget();
  vi.unstubAllGlobals();
});

describe('WorkspaceLayout', () => {
  describe('GIVEN a member whose only workspace holds no thread yet', () => {
    beforeEach(async () => {
      await act(async () => {
        view = render(layoutElement);
      });
    });

    describe('WHEN it renders', () => {
      test('THEN the page and the empty canvas show under the workspace name', () => {
        expect(screen.getByText('Thread canvas')).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.onboarding.emptyPlatformTitle)).toBeInTheDocument();
        expect(screen.getByRole('main')).toHaveTextContent('Workspace ws-1');
      });

      test('THEN the document is marked as having the toolbar', () => {
        expect(document.documentElement).toHaveAttribute('data-has-toolbar');
      });
    });

    describe('WHEN the layout unmounts', () => {
      beforeEach(() => {
        view.unmount();
      });

      test('THEN the toolbar mark is removed again', () => {
        expect(document.documentElement).not.toHaveAttribute('data-has-toolbar');
      });
    });

    describe('WHEN the settings are opened from the user menu', () => {
      beforeEach(async () => {
        fireEvent.click(screen.getByText(TRANSLATIONS.common.userAvatar));
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.title }));
        });
      });

      test('THEN the settings dialog opens on the profile', () => {
        expect(
          screen.getByRole('dialog', { name: TRANSLATIONS.platform.settings.sections.profile }),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN the opened settings are closed', () => {
      beforeEach(async () => {
        fireEvent.click(screen.getByText(TRANSLATIONS.common.userAvatar));
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.title }));
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.close }));
      });

      test('THEN the settings dialog goes away', () => {
        expect(
          screen.queryByRole('dialog', { name: TRANSLATIONS.platform.settings.sections.profile }),
        ).not.toBeInTheDocument();
      });
    });

    describe('WHEN the settings of the workspace are opened from the switcher', () => {
      beforeEach(async () => {
        fireEvent.click(screen.getByRole('button', { expanded: false, name: /Workspace ws-1/ }));
        await act(async () => {
          fireEvent.click(screen.getByTitle(TRANSLATIONS.platform.sidebar.workspaceSettings));
        });
      });

      test('THEN the workspace settings open for that workspace', () => {
        expect(
          within(
            screen.getByRole('dialog', { name: TRANSLATIONS.platform.workspaceSettings.sections.general }),
          ).getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.general.nameLabel }),
        ).toHaveValue('Workspace ws-1');
      });
    });

    describe('WHEN the opened workspace settings are closed', () => {
      beforeEach(async () => {
        fireEvent.click(screen.getByRole('button', { expanded: false, name: /Workspace ws-1/ }));
        await act(async () => {
          fireEvent.click(screen.getByTitle(TRANSLATIONS.platform.sidebar.workspaceSettings));
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.close }));
      });

      test('THEN the workspace settings go away', () => {
        expect(
          screen.queryByRole('dialog', { name: TRANSLATIONS.platform.workspaceSettings.sections.general }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a workspace list that is still loading', () => {
    beforeEach(async () => {
      vi.mocked(getMyWorkspaces).mockReturnValue(Promise.withResolvers<IWorkspaceItem[]>().promise);
      await act(async () => {
        render(layoutElement);
      });
    });

    describe('WHEN it renders', () => {
      test('THEN the page waits under the canvas skeleton instead of the empty canvas', () => {
        expect(screen.getByText('Thread canvas').parentElement!.querySelector('.skeleton')).toBeInTheDocument();
        expect(screen.queryByText(TRANSLATIONS.platform.onboarding.emptyPlatformTitle)).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a route on an open thread', () => {
    beforeEach(async () => {
      Object.assign(routeParams, { workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(getThreads).mockResolvedValue([threadInput('t1', 0)]);
      await act(async () => {
        render(layoutElement);
      });
    });

    describe('WHEN it renders', () => {
      test('THEN the sheet names the thread and neither the empty canvas nor the skeleton covers the page', () => {
        expect(within(screen.getByRole('main')).getByText('Thread t1')).toBeInTheDocument();
        expect(screen.queryByText(TRANSLATIONS.platform.onboarding.emptyPlatformTitle)).not.toBeInTheDocument();
        expect(screen.getByText('Thread canvas').parentElement!.querySelector('.skeleton')).not.toBeInTheDocument();
      });
    });
  });
});
