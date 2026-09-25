export type TMascotCharacter = 'nodi' | 'ergo';

export type TMascotPose = 'idle' | 'point' | 'think' | 'cheer';

export type TMascotSway = 'gentle' | 'eager';

export interface IMascotLimb {
  path: string;
  handX: number;
  handY: number;
}

export interface IMascotPose {
  leftArm: IMascotLimb;
  rightArm: IMascotLimb;
  sway: TMascotSway;
  eyeOffsetY: number;
  happyEyes: boolean;
}
