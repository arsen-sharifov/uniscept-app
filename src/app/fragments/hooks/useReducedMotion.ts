'use client';

import { REDUCED_MOTION_QUERY } from '../consts';
import { useMediaQuery } from './useMediaQuery';

export const useReducedMotion = (): boolean => useMediaQuery(REDUCED_MOTION_QUERY);
