import type { ReactNode } from 'react';

import type { TEdgeTone, TEffectiveStatus, TNodeStatus } from './canvas';
import type { TTranslations } from './i18n';

export type TLandingTranslations = TTranslations['landing'];

export type THeroClaimId = 'q' | 'p1' | 'p2' | 'p3' | 'p5' | 'c1' | 'c2';

export type THeroClaimKind = 'question' | 'statement';

export type THeroTone = 'question' | 'answer' | 'valid' | 'refuted' | 'affected';

export type THeroMiniTone = THeroTone | 'reference' | 'open';

export type THeroEdgeTone = TEdgeTone | 'reference';

export type THeroPhase = 'healthy' | 'refuted' | 'repaired';

export type THeroExhibitId = 'chat' | 'meetings' | 'docs';

export type THeroBuilderThreadId = 'founders' | 'researchers' | 'engineers';

export type TProductFeatureId = 'structured' | 'validation' | 'references' | 'collaboration';

export type THowItWorksStepId = 'ask' | 'argue' | 'decide';

export type TLandingSectionGround = 'field' | 'deep' | 'close';

export type TLandingSurface = 'card' | 'panel' | 'sheet';

export interface IHeroClaim {
  id: THeroClaimId;
  code: string;
  kind: THeroClaimKind;
  status: TNodeStatus;
  isAnswer?: boolean;
  x: number;
  y: number;
  width: number;
  anchor?: 'left' | 'right';
  desktopOnly?: boolean;
  align?: 'start' | 'end';
}

export interface IHeroEdge {
  id: string;
  source: string;
  target: string;
}

export interface IHeroEdgePath extends IHeroEdge {
  d: string;
}

export interface IHeroLogLine {
  id: 'opened' | 'refuted' | 'tainted' | 'rerouted' | 'restored';
  time: string;
  phases: THeroPhase[];
}

export interface IHeroCascade {
  phase: THeroPhase;
  claims: IHeroClaim[];
  edges: IHeroEdge[];
  statuses: Map<string, TEffectiveStatus>;
  edgeTones: Map<string, TEdgeTone>;
  depths: Map<string, number>;
  refutedIds: ReadonlySet<string>;
}

export interface IHeroBuilderNodeTones {
  a: THeroMiniTone;
  b: THeroMiniTone;
}

export interface IHeroBuilderThread {
  id: THeroBuilderThreadId;
  code: string;
  nodeTones: IHeroBuilderNodeTones;
  edges: IHeroEdge[];
  edgeTones: ReadonlyMap<string, THeroEdgeTone>;
}

export interface IProductFeature {
  id: TProductFeatureId;
  span: string;
}

export interface IHowItWorksStep {
  id: THowItWorksStepId;
  vignette: ReactNode;
}

export interface IAuroraStart {
  kind: 'start';
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  paper: number;
  still: boolean;
  elapsed: number;
  sentAt: number;
  frameStepCapMs: number;
  renderScale: number;
}

export interface IAuroraUpdate {
  kind: 'update';
  width: number;
  height: number;
  paper: number;
}

export interface IAuroraRun {
  kind: 'run';
  running: boolean;
}

export type TAuroraMessage = IAuroraStart | IAuroraUpdate | IAuroraRun;

export interface IAuroraRenderer {
  resize: (cssWidth: number, cssHeight: number) => void;
  draw: (elapsedSeconds: number, paper: number) => void;
}

export interface IAuroraFrameLoop {
  start: () => void;
  stop: () => void;
  elapsed: () => number;
}

export type TAuroraWorkerSignal = 'ready' | 'unavailable';

export interface IAuroraWorkerHost {
  postMessage: (message: TAuroraWorkerSignal) => void;
}

export interface IAuroraField {
  mount: (slot: HTMLElement) => void;
  unmount: () => void;
  run: (running: boolean) => void;
}
