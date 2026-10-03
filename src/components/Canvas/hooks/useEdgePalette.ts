'use client';

import { useMemo } from 'react';

import type { TEdgeTone } from '@interfaces';

import { useThemeToken } from './useThemeToken';

const NEUTRAL_FALLBACK = 'rgba(13, 19, 16, 0.34)';
const VALID_FALLBACK = 'rgb(21, 128, 61)';
const INVALID_FALLBACK = 'rgb(220, 38, 38)';
const ANSWER_FALLBACK = 'rgb(124, 58, 237)';
const TAINTED_FALLBACK = 'rgb(180, 83, 9)';

export const useEdgePalette = (): Record<TEdgeTone, string> => {
  const neutral = useThemeToken('--text-subtle', NEUTRAL_FALLBACK);
  const valid = useThemeToken('--status-success', VALID_FALLBACK);
  const answer = useThemeToken('--decision', ANSWER_FALLBACK);
  const invalid = useThemeToken('--status-error', INVALID_FALLBACK);
  const tainted = useThemeToken('--status-warning', TAINTED_FALLBACK);

  return useMemo(
    () => ({ default: neutral, valid, answer, invalid, tainted }),
    [neutral, valid, answer, invalid, tainted],
  );
};
