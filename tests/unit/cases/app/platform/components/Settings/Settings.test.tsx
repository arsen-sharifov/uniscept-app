import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { PREFERENCES } from '@mocks/preferences';
import { getUser, updateUserMetadata, UNNAMED_ACCOUNT } from '@mocks/userApi';
import { Settings } from '@/app/platform/components/Settings';
import { useOnboardingStore } from '@/lib/onboarding';

vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@api/client', async () => ({
  ...(await import('@mocks/userApi')),
  ...(await import('@mocks/workspaceApi')),
}));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const onClose = vi.fn();
const updatePreference = vi.fn();

afterEach(() => {
  useOnboardingStore.getState().forget();
});

describe('Settings', () => {
  describe('GIVEN the settings modal for a loaded account', () => {
    beforeEach(async () => {
      getUser.mockResolvedValue({ data: { user: UNNAMED_ACCOUNT }, error: null });
      await act(async () => {
        render(<Settings onClose={onClose} preferences={PREFERENCES} updatePreference={updatePreference} />);
      });
    });

    describe('WHEN it opens', () => {
      test('THEN the dialog is named by the heading of the profile section', () => {
        expect(
          screen.getByRole('dialog', { name: TRANSLATIONS.platform.settings.sections.profile }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.displayName }),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN the appearance section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.sections.appearance }));
      });

      test('THEN the dialog name follows the heading', () => {
        expect(
          screen.getByRole('dialog', { name: TRANSLATIONS.platform.settings.sections.appearance }),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN the security section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.sections.security }));
      });

      test('THEN the password form shows', () => {
        expect(screen.getByLabelText(TRANSLATIONS.platform.settings.security.currentPassword)).toBeInTheDocument();
      });
    });

    describe('WHEN the notifications section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.sections.notifications }));
      });

      test('THEN the coming soon placeholder shows', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.comingSoon)).toBeInTheDocument();
      });
    });

    describe('WHEN the editor section is picked and a behavior is toggled', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.sections.editor }));
        fireEvent.click(
          screen.getByRole('switch', { name: new RegExp(TRANSLATIONS.platform.settings.editor.smartGuides) }),
        );
      });

      test('THEN the change reaches the preference updater', () => {
        expect(updatePreference).toHaveBeenCalledExactlyOnceWith('smartGuides', true);
      });
    });

    describe('WHEN the plan section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.sections.plan }));
      });

      test('THEN the current plan shows', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.plan.current)).toBeInTheDocument();
      });
    });

    describe('WHEN the close button is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.close }));
      });

      test('THEN the modal asks to close', () => {
        expect(onClose).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN the settings modal while the account is still loading', () => {
    beforeEach(() => {
      getUser.mockReturnValue(Promise.withResolvers<never>().promise);
      render(<Settings onClose={onClose} preferences={PREFERENCES} updatePreference={updatePreference} />);
    });

    describe('WHEN it opens on the profile section', () => {
      test('THEN the profile form waits behind the skeleton', () => {
        expect(
          screen.getByRole('dialog', { name: TRANSLATIONS.platform.settings.sections.profile }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.displayName }),
        ).not.toBeInTheDocument();
      });
    });

    describe('WHEN the plan section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.sections.plan }));
      });

      test('THEN the plans wait behind the skeleton', () => {
        expect(screen.queryByText(TRANSLATIONS.platform.settings.plan.current)).not.toBeInTheDocument();
      });
    });

    describe('WHEN the security section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.sections.security }));
      });

      test('THEN it shows without waiting for the account', () => {
        expect(screen.getByLabelText(TRANSLATIONS.platform.settings.security.currentPassword)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a running settings tour over a loaded account', () => {
    beforeEach(async () => {
      useOnboardingStore.setState({ run: { guideId: 'settings', stepIndex: 0 } });
      getUser.mockResolvedValue({ data: { user: UNNAMED_ACCOUNT }, error: null });
      updateUserMetadata.mockResolvedValue({ data: { user: UNNAMED_ACCOUNT }, error: null });
      await act(async () => {
        render(<Settings onClose={onClose} preferences={PREFERENCES} updatePreference={updatePreference} />);
      });
    });

    describe('WHEN a new display name is saved', () => {
      beforeEach(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.displayName }), {
          target: { value: 'Ada' },
        });
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.profile.save }));
        });
      });

      test('THEN the profile is saved and the tour learns about it', () => {
        expect(updateUserMetadata).toHaveBeenCalledExactlyOnceWith({ name: 'Ada' });
        expect(useOnboardingStore.getState().signals.has('profileSaved')).toBe(true);
      });
    });
  });
});
