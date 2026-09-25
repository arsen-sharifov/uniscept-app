import type { TGuideId, TMascotCharacter, TMascotPose, TTourStepKey } from '@interfaces';

export const MASCOT_POSE_IDS: readonly TMascotPose[] = ['idle', 'point', 'think', 'cheer'];

export const MASCOT_CHARACTER_IDS: readonly TMascotCharacter[] = ['nodi', 'ergo'];

export const MASCOT_POSE_HINTS: Record<TMascotPose, string> = {
  idle: 'both arms down',
  point: 'one arm reaching out',
  think: 'one arm raised, eyes lifted',
  cheer: 'both arms up, happy eyes',
};

export const WINDOW_STEPS: Record<TMascotCharacter, { guideId: TGuideId; copyKey: TTourStepKey }> = {
  nodi: { guideId: 'base', copyKey: 'baseThread' },
  ergo: { guideId: 'example', copyKey: 'exampleCapsule' },
};
