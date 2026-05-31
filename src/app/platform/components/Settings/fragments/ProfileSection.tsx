'use client';

import type { User } from '@supabase/supabase-js';
import { useTranslations as useScopedTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';

import type { IUserMetadata, IUserProfileUpdate, TBadgeId, TGlyphId } from '@interfaces';
import { BADGES, DEFAULT_BADGES, EMAIL_PATTERN, GLYPH_ICONS, GLYPH_IDS } from '@constants';
import { useAsyncAction, useTranslations } from '@hooks';
import { Avatar, Badge, BadgeConstellation, getInitials } from '@/components';
import { glyphLabelKey, isBadgeId, isGlyphId } from '@/lib/utils';

import { PickerCard } from './PickerCard';
import { SettingsInput } from '../SettingsInput';
import { SettingsPrimaryButton } from '../SettingsPrimaryButton';

export interface IProfileSectionProps {
  user: User | null;
  onUpdateProfile: (update: IUserProfileUpdate) => Promise<void>;
  onUpdateEmail: (email: string) => Promise<void>;
}

const NAME_MAX = 60;

export const ProfileSection = ({ user, onUpdateProfile, onUpdateEmail }: IProfileSectionProps) => {
  const t = useTranslations();
  const { profile } = t.platform.settings;
  const tProfile = useScopedTranslations('platform.settings.profile');

  const metadata = user?.user_metadata as IUserMetadata | undefined;
  const userName = metadata?.name ?? '';
  const userEmail = user?.email ?? '';
  const storedGlyph = metadata?.glyph;
  const userGlyph: TGlyphId | null = isGlyphId(storedGlyph) ? storedGlyph : null;
  const storedBadges = metadata?.badges;
  const earnedBadges = useMemo<readonly TBadgeId[]>(() => {
    const valid = Array.isArray(storedBadges) ? storedBadges.filter(isBadgeId) : [];

    return valid.length > 0 ? valid : DEFAULT_BADGES;
  }, [storedBadges]);

  const [name, setName] = useState(userName);
  const [glyph, setGlyph] = useState<TGlyphId | null>(userGlyph);
  const [email, setEmail] = useState(userEmail);
  const save = useAsyncAction();
  const emailChange = useAsyncAction();

  const trimmedName = name.trim();
  const nameChanged = name !== userName;
  const glyphChanged = glyph !== userGlyph;
  const profileChanged = nameChanged || glyphChanged;
  const emailChanged = email !== userEmail;
  const emailIsValid = EMAIL_PATTERN.test(email.trim());

  const earnedSet = useMemo(() => new Set(earnedBadges), [earnedBadges]);
  const earnedCount = earnedSet.size;

  const constellationPips = useMemo(
    () =>
      BADGES.map((definition) => ({
        id: definition.id,
        icon: definition.icon,
        label: profile.badges[definition.labelKey],
        earned: earnedSet.has(definition.id),
      })),
    [profile.badges, earnedSet],
  );

  const initialsPreview = getInitials(trimmedName || userEmail);

  const id = useId();
  const nameId = `${id}-name`;
  const emailId = `${id}-email`;

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5 py-2.5">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-20 h-40 w-40 rounded-full bg-[color:var(--accent-soft)] opacity-50 blur-3xl"
        />
        <div className="relative flex items-center gap-4">
          <Avatar
            name={trimmedName || userEmail}
            glyph={glyph}
            size="lg"
            showPresence
            className="shadow-[0_18px_38px_-22px_var(--accent-glow)]"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[18px] leading-tight tracking-tight text-[color:var(--text-strong)] italic">
              {trimmedName || profile.unnamed}
            </p>
            <p className="mt-0.5 truncate text-[12px] tracking-tight text-[color:var(--text-muted)]">{userEmail}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <BadgeConstellation pips={constellationPips} />
            <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-subtle)] uppercase">
              {earnedCount}/{BADGES.length}
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <header className="mb-1.5 flex items-baseline justify-between">
              <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
                {profile.displayName}
              </h3>
              <span className="text-[10.5px] tracking-[0.14em] text-[color:var(--text-faint)] uppercase">
                {trimmedName.length}/{NAME_MAX}
              </span>
            </header>
            <SettingsInput
              id={nameId}
              type="text"
              value={name}
              maxLength={NAME_MAX}
              placeholder={profile.namePlaceholder}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <header className="mb-1.5 flex items-baseline justify-between">
              <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
                {profile.email}
              </h3>
              {emailChange.success && (
                <span className="text-[10.5px] tracking-[0.14em] text-[color:var(--accent-strong)] uppercase">
                  {profile.saved}
                </span>
              )}
              {emailChanged && !emailIsValid && (
                <span className="text-[10.5px] tracking-[0.14em] text-[color:var(--status-error)] uppercase">
                  {profile.emailInvalid}
                </span>
              )}
            </header>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <SettingsInput
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <SettingsPrimaryButton
                onClick={() => emailChange.run(() => onUpdateEmail(email.trim()), profile.emailChangeFailed)}
                disabled={emailChange.loading || !emailChanged || !emailIsValid}
              >
                {emailChange.loading ? profile.changingEmail : profile.changeEmail}
              </SettingsPrimaryButton>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-3.5">
        <header className="mb-3 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {profile.glyphTitle}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {tProfile('glyphCount', { count: GLYPH_IDS.length + 1 })}
          </span>
        </header>

        <div role="radiogroup" aria-label={profile.glyphTitle} className="grid grid-cols-3 gap-3 sm:grid-cols-7">
          <PickerCard
            active={glyph === null}
            label={profile.initialsLabel}
            onSelect={() => setGlyph(null)}
            variant="initials"
          >
            <span className="font-mono text-[17px] font-semibold tracking-[0.06em] text-[color:var(--text-strong)]">
              {initialsPreview}
            </span>
          </PickerCard>

          {GLYPH_IDS.map((option) => {
            const GlyphIcon = GLYPH_ICONS[option];

            return (
              <PickerCard
                key={option}
                active={option === glyph}
                label={profile.glyphs[glyphLabelKey(option)]}
                onSelect={() => setGlyph(option)}
              >
                <GlyphIcon size={24} strokeWidth={1.75} className="shrink-0" aria-hidden />
              </PickerCard>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-3.5">
        <header className="mb-3 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {profile.badgesTitle}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {earnedCount}/{BADGES.length}
          </span>
        </header>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {BADGES.map((definition) => (
            <Badge
              key={definition.id}
              icon={definition.icon}
              label={profile.badges[definition.labelKey]}
              unlock={profile.badges[definition.unlockKey]}
              earned={earnedSet.has(definition.id)}
            />
          ))}
        </div>
      </section>

      <section className="flex items-center justify-end gap-3 border-t border-[color:var(--border)] pt-3.5">
        <div className="min-w-0 flex-1 truncate text-[11.5px] leading-snug">
          {save.success && <span className="text-[color:var(--accent-strong)]">{profile.saved}</span>}
          {save.error && <span className="text-[color:var(--status-error)]">{save.error}</span>}
          {emailChange.error && <span className="text-[color:var(--status-error)]">{emailChange.error}</span>}
        </div>
        <SettingsPrimaryButton
          onClick={() =>
            save.run(
              () =>
                onUpdateProfile({
                  ...(nameChanged && { name: trimmedName }),
                  ...(glyphChanged && { glyph }),
                }),
              profile.saveFailed,
            )
          }
          disabled={save.loading || !profileChanged || !trimmedName}
        >
          {save.loading ? profile.saving : profile.save}
        </SettingsPrimaryButton>
      </section>
    </div>
  );
};
