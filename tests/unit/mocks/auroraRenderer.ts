import { vi } from 'vitest';

import type { IAuroraStart } from '@interfaces';

export const createAuroraRenderer = vi.fn();
export const draw = vi.fn();

export const renderer = { draw, resize: vi.fn() };

export const AURORA_NOW = 1_000_000;

export const AURORA_START: IAuroraStart = {
  kind: 'start',
  canvas: {} as OffscreenCanvas,
  width: 800,
  height: 600,
  paper: 0,
  still: false,
  elapsed: 2,
  sentAt: AURORA_NOW - 500,
  frameStepCapMs: 50,
  renderScale: 0.5,
};
