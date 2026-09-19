'use client';

import { useTranslations } from '@/i18n';
import { BASE_GUIDE_ID, useOnboardingStore } from '@/lib/onboarding';

import { NodiHeading } from './NodiHeading';
import { TourButton } from './TourButton';
import { TourDialog } from './TourDialog';

export const TourOffer = () => {
  const t = useTranslations();
  const onboarding = t.platform.onboarding;
  const open = useOnboardingStore((state) => state.offerOpen);
  const answerOffer = useOnboardingStore((state) => state.answerOffer);
  const startGuide = useOnboardingStore((state) => state.startGuide);

  return (
    <TourDialog open={open} onClose={answerOffer} width="max-w-md">
      <NodiHeading title={onboarding.offerTitle} pose="point" nodiClassName="h-20 w-20" />

      <p className="mt-4 font-grotesk text-[13px] leading-relaxed text-pretty text-[color:var(--text-muted)]">
        {onboarding.nodiIntro}
      </p>

      <p className="mt-2 font-grotesk text-[13px] leading-relaxed text-pretty text-[color:var(--text-muted)]">
        {onboarding.offerBody}
      </p>

      <p className="mt-2 font-mono-ui text-[10.5px] tracking-[0.04em] text-[color:var(--text-label)]">
        {onboarding.offerLater}
      </p>

      <div className="mt-5 flex justify-end gap-2">
        <TourButton variant="secondary" size="md" onClick={answerOffer}>
          {onboarding.offerDecline}
        </TourButton>
        <TourButton variant="primary" size="md" onClick={() => startGuide(BASE_GUIDE_ID)}>
          {onboarding.offerAccept}
        </TourButton>
      </div>
    </TourDialog>
  );
};
