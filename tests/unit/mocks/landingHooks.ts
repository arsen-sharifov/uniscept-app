import { vi } from 'vitest';

import type { IHeroEdge } from '@interfaces';

export const useWorldArrival = vi.fn();

export const useVignettePhase = vi.fn();

export const useEdgePaths = vi.fn((_stage: unknown, edges: IHeroEdge[]) =>
  edges.map((edge) => ({ ...edge, d: 'M 0 0 L 100 0' })),
);
