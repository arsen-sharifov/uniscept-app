import type { User } from '@supabase/supabase-js';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { BADGES, MAX_NAME_LENGTH } from '@constants';
import { TRANSLATIONS } from '@mocks/i18n';
import { NAMED_ACCOUNT } from '@mocks/userApi';
import { ProfileSection } from '@/app/platform/components/Settings/fragments';
import { hydrateBadges, useBadgeStore } from '@/lib/badges';
import { event } from '@/lib/events';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const onUpdateProfile = vi.fn();
const onUpdateEmail = vi.fn();

const userWithBadges = (stored: string[]) => ({ id: 'user-1', user_metadata: { badges: stored } }) as unknown as User;

const lockedBadge = (label: string, unlock: string) => `${label} · ${unlock}`;

afterEach(() => useBadgeStore.getState().forget());

describe('ProfileSection', () => {
  describe('GIVEN the profile of a named account', () => {
    beforeEach(() => {
      render(<ProfileSection user={NAMED_ACCOUNT} onUpdateProfile={onUpdateProfile} onUpdateEmail={onUpdateEmail} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the display name field is labelled, prefilled and capped at the shared name length', () => {
        expect(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.displayName })).toHaveValue(
          'Ada',
        );
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.displayName }),
        ).toHaveAttribute('maxlength', String(MAX_NAME_LENGTH));
      });

      test('THEN the email field is labelled and prefilled', () => {
        expect(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.email })).toHaveAttribute(
          'type',
          'email',
        );
        expect(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.email })).toHaveValue(
          'ada@uniscept.dev',
        );
      });
    });

    describe('WHEN a display name and an email are typed', () => {
      beforeEach(() => {
        fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.displayName }), {
          target: { value: 'Ada Lovelace' },
        });
        fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.email }), {
          target: { value: 'ada@example.com' },
        });
      });

      test('THEN the profile card previews the typed name and the email field keeps the input', () => {
        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.email })).toHaveValue(
          'ada@example.com',
        );
      });
    });

    describe('WHEN the display name is cleared', () => {
      beforeEach(() => {
        fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.displayName }), {
          target: { value: '   ' },
        });
      });

      test('THEN the card falls back to the unnamed label and the profile cannot be saved', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.profile.unnamed)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.profile.save })).toBeDisabled();
      });
    });

    describe('WHEN an avatar icon is picked and the profile is saved', () => {
      beforeEach(async () => {
        onUpdateProfile.mockResolvedValue(undefined);
        fireEvent.click(
          screen.getByRole('radio', { name: TRANSLATIONS.platform.settings.profile.avatarIcons.avatarIconCat }),
        );
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.profile.save }));
        });
      });

      test('THEN only the changed icon is saved and the success shows', () => {
        expect(onUpdateProfile).toHaveBeenCalledExactlyOnceWith({ avatarIcon: 'cat' });
        expect(screen.getByText(TRANSLATIONS.platform.settings.profile.saved)).toBeInTheDocument();
      });
    });

    describe('WHEN a new valid email is submitted', () => {
      beforeEach(async () => {
        onUpdateEmail.mockResolvedValue(undefined);
        fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.email }), {
          target: { value: ' ada@example.com ' },
        });
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.profile.changeEmail }));
        });
      });

      test('THEN the trimmed email change is requested and its confirmation is announced', () => {
        expect(onUpdateEmail).toHaveBeenCalledExactlyOnceWith('ada@example.com');
        expect(event.info).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.settings.profile.emailChangeSent);
      });
    });

    describe('WHEN an invalid email is typed', () => {
      beforeEach(() => {
        fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.settings.profile.email }), {
          target: { value: 'not-an-email' },
        });
      });

      test('THEN the email is flagged and the change cannot be submitted', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.profile.emailInvalid)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.profile.changeEmail })).toBeDisabled();
      });
    });
  });

  describe('GIVEN an account with stored badges and no session badges yet', () => {
    beforeEach(() => {
      render(
        <ProfileSection
          user={userWithBadges(['founder', 'voice'])}
          onUpdateProfile={onUpdateProfile}
          onUpdateEmail={onUpdateEmail}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the stored badges show as earned out of the whole catalogue', () => {
        expect(
          screen.queryByRole('img', {
            name: lockedBadge(
              TRANSLATIONS.platform.settings.profile.badges.badgeVoice,
              TRANSLATIONS.platform.settings.profile.badges.voiceUnlock,
            ),
          }),
        ).toBeNull();
        expect(screen.getAllByText(`2/${BADGES.length}`)).not.toHaveLength(0);
      });
    });
  });

  describe('GIVEN a badge earned during the session after the account was loaded', () => {
    beforeEach(() => {
      hydrateBadges(['founder', 'voice', 'critic']);
      render(
        <ProfileSection
          user={userWithBadges(['founder', 'voice'])}
          onUpdateProfile={onUpdateProfile}
          onUpdateEmail={onUpdateEmail}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the session badges win over the loaded account', () => {
        expect(
          screen.queryByRole('img', {
            name: lockedBadge(
              TRANSLATIONS.platform.settings.profile.badges.badgeCritic,
              TRANSLATIONS.platform.settings.profile.badges.criticUnlock,
            ),
          }),
        ).toBeNull();
        expect(screen.getAllByText(`3/${BADGES.length}`)).not.toHaveLength(0);
      });
    });
  });
});
