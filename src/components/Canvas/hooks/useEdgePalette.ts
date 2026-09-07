'use client';

import { useMemo } from 'react';

import type { IEdgePaletteEntry, TEdgeTone } from '@interfaces';

import { useThemeToken } from './useThemeToken';

const NEUTRAL_FALLBACK = 'rgba(13, 19, 16, 0.34)';
const VALID_FALLBACK = 'rgb(21, 128, 61)';
const INVALID_FALLBACK = 'rgb(220, 38, 38)';
const TAINTED_FALLBACK = 'rgb(180, 83, 9)';

export const useEdgePalette = (): Record<TEdgeTone, IEdgePaletteEntry> => {
  const neutral = useThemeToken('--text-subtle', NEUTRAL_FALLBACK);
  const valid = useThemeToken('--status-success', VALID_FALLBACK);
  const invalid = useThemeToken('--status-error', INVALID_FALLBACK);
  const tainted = useThemeToken('--status-warning', TAINTED_FALLBACK);

  return useMemo(
    () => ({
      default: { stroke: neutral, marker: neutral },
      valid: { stroke: valid, marker: valid },
      invalid: { stroke: invalid, marker: invalid },
      tainted: { stroke: tainted, marker: tainted },
    }),
    [neutral, valid, invalid, tainted],
  );
};
