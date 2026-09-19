import type { TMascotCharacter, TMascotPose } from '@interfaces';

import { TourStepCard } from '@/components';
import { findGuide } from '@/lib/onboarding';

import { WINDOW_STEPS } from '../consts';

interface IBesideWindowProps {
  pose: TMascotPose;
  character: TMascotCharacter;
}

const noop = () => {};

export const BesideWindow = ({ pose, character }: IBesideWindowProps) => {
  const { guideId, copyKey } = WINDOW_STEPS[character];
  const steps = findGuide(guideId)?.steps ?? [];
  const index = steps.findIndex((step) => step.copyKey === copyKey);
  const step = steps[index];
  if (!step) return null;

  return (
    <TourStepCard
      step={{ ...step, placement: 'center', pose }}
      index={index}
      total={steps.length}
      onQuit={noop}
      onNext={step.speaker ? noop : undefined}
    />
  );
};
