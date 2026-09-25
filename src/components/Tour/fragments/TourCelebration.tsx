'use client';

import { Badge } from '@/components/Badge';
import { Mascot } from '@/components/Mascot';
import { useTranslations } from '@/i18n';
import { useOnboardingStore } from '@/lib/onboarding';

import { TourButton } from './TourButton';
import { TourDialog } from './TourDialog';
import { ONBOARDING_BADGE } from '../consts';

export const TourCelebration = () => {
  const t = useTranslations();
  const onboarding = t.platform.onboarding;
  const badges = t.platform.settings.profile.badges;
  const open = useOnboardingStore((state) => state.celebrating);
  const closeCelebration = useOnboardingStore((state) => state.closeCelebration);

  return (
    <TourDialog open={open} onClose={closeCelebration} width="max-w-md">
      <div className="flex items-end gap-2">
        <Mascot pose="cheer" label={onboarding.nodiAlt} />
        <h2 className="mb-1.5 font-grotesk text-lg leading-tight font-semibold tracking-tight text-[color:var(--text-strong)]">
          {onboarding.celebrationTitle}
        </h2>
      </div>

      <p className="mt-3 font-grotesk text-[13px] leading-relaxed text-pretty text-[color:var(--text-muted)]">
        {onboarding.celebrationBody}
      </p>

      {ONBOARDING_BADGE && (
        <div className="mt-4 w-28">
          <Badge
            icon={ONBOARDING_BADGE.icon}
            label={badges[ONBOARDING_BADGE.labelKey]}
            unlock={badges[ONBOARDING_BADGE.unlockKey]}
            earned
          />
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <TourButton variant="primary" size="md" onClick={closeCelebration}>
          {onboarding.celebrationClose}
        </TourButton>
      </div>
    </TourDialog>
  );
};
