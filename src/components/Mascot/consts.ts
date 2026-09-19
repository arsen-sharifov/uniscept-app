import type { IMascotPose, TMascotPose } from '@interfaces';

export const MASCOT_VIEW_BOX = '0 0 64 64';

export const NODI_BODY = { x: 11, y: 5, width: 42, height: 37, rx: 11 } as const;

export const NODI_BAND_HEIGHT = 5;

export const MASCOT_SHOULDER = { left: 14, right: 50, y: 26 } as const;

export const MASCOT_LIMB_WIDTH = 2.4;

export const MASCOT_HAND_RADIUS = 2.5;

export const MASCOT_EYE_RADIUS = 3.4;

export const ERGO_HEAD = { cx: 32, cy: 25, r: 17 } as const;

export const ERGO_ANTENNA = { tipY: 2.8, radius: 2.3 } as const;

export const MASCOT_EYES = {
  nodi: { rx: MASCOT_EYE_RADIUS, ry: MASCOT_EYE_RADIUS },
  ergo: { rx: 2.6, ry: 3.8 },
} as const;

export const MASCOT_EYE_Y = 23;

export const MASCOT_EYE_X = [26, 38] as const;

export const MASCOT_LEGS = [26, 38] as const;

export const MASCOT_LEG_TOP = 40;

export const MASCOT_LEG_BOTTOM = 56;

export const MASCOT_FOOT = { width: 7, height: 3.6, radius: 1.8 } as const;

const HANGING_LEFT = { path: 'M14 26 C 7.5 29 5.5 36 7 45', handX: 7, handY: 45 };

const HANGING_RIGHT = { path: 'M50 26 C 56.5 29 58.5 36 57 45', handX: 57, handY: 45 };

const RAISED_LEFT = { path: 'M14 26 C 7 23 5 15 8 9', handX: 8, handY: 9 };

const RAISED_RIGHT = { path: 'M50 26 C 57 23 59 15 56 9', handX: 56, handY: 9 };

export const MASCOT_POSES: Record<TMascotPose, IMascotPose> = {
  idle: {
    leftArm: HANGING_LEFT,
    rightArm: HANGING_RIGHT,
    sway: 'gentle',
    eyeOffsetY: 0,
    happyEyes: false,
  },
  point: {
    leftArm: HANGING_LEFT,
    rightArm: { path: 'M50 26 C 55.5 26 57.5 25 60.5 24.5', handX: 60.5, handY: 24.5 },
    sway: 'eager',
    eyeOffsetY: 0,
    happyEyes: false,
  },
  think: {
    leftArm: HANGING_LEFT,
    rightArm: RAISED_RIGHT,
    sway: 'gentle',
    eyeOffsetY: -1.5,
    happyEyes: false,
  },
  cheer: {
    leftArm: RAISED_LEFT,
    rightArm: RAISED_RIGHT,
    sway: 'eager',
    eyeOffsetY: 0,
    happyEyes: true,
  },
};
