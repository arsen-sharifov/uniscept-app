'use client';

import { useMemo } from 'react';

import type { IEdgePaletteEntry, TEdgeTone } from '@interfaces';

import { useThemeToken } from './useThemeToken';

const NEUTRAL_FALLBACK = 'rgba(100, 116, 139, 0.7)';
const VALID_FALLBACK = 'rgb(16, 185, 129)';
const INVALID_FALLBACK = 'rgb(239, 68, 68)';
const TAINTED_FALLBACK = 'rgb(245, 158, 11)';

export const useEdgePalette = (): Record<TEdgeTone, IEdgePaletteEntry> => {
  const borderStrong = useThemeToken('--border-strong', NEUTRAL_FALLBACK);
  const valid = useThemeToken('--status-success', VALID_FALLBACK);
  const invalid = useThemeToken('--status-error', INVALID_FALLBACK);
  const tainted = useThemeToken('--status-warning', TAINTED_FALLBACK);

  return useMemo(
    () => ({
      default: { stroke: borderStrong, marker: borderStrong },
      valid: { stroke: valid, marker: valid },
      invalid: { stroke: invalid, marker: invalid },
      tainted: { stroke: tainted, marker: tainted },
    }),
    [borderStrong, valid, invalid, tainted],
  );
};
