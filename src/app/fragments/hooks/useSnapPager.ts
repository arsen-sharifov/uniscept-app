'use client';

import { type RefObject, useEffect } from 'react';

import type { ILandingScreenRange } from '@interfaces';

import {
  LANDING_SCREEN_SELECTOR,
  SNAP_EDGE_TOLERANCE_PX,
  SNAP_END_PADDING_PX,
  SNAP_GESTURE_LOCK_MS,
  SNAP_MIN_DELTA_PX,
  SNAP_SMOOTH_STEP_PX,
  SNAP_START_PADDING_PX,
  SNAP_WHEEL_QUIET_MS,
} from '../consts';
import { useReducedMotion } from './useReducedMotion';

export const useSnapPager = (containerRef: RefObject<HTMLElement | null>) => {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const screens = [...container.querySelectorAll<HTMLElement>(LANDING_SCREEN_SELECTOR)];
    if (screens.length === 0) return;

    const listeners = new AbortController();
    const glideBehavior = reducedMotion ? 'instant' : 'smooth';

    let gesture: AbortController | null = null;
    let fallback: number | null = null;
    let quiet: number | null = null;
    let pendingTop: number | null = null;

    const settle = () => {
      pendingTop = null;

      if (fallback !== null) window.clearTimeout(fallback);
      fallback = null;
      gesture?.abort();
      gesture = null;
    };

    const holdUntilQuiet = () => {
      if (quiet !== null) window.clearTimeout(quiet);
      quiet = window.setTimeout(() => {
        quiet = null;
      }, SNAP_WHEEL_QUIET_MS);
    };

    const glideTo = (target: number) => {
      holdUntilQuiet();
      container.scrollTo({ top: target, behavior: glideBehavior });

      gesture = new AbortController();
      container.addEventListener('scrollend', settle, { once: true, signal: gesture.signal });
      fallback = window.setTimeout(settle, SNAP_GESTURE_LOCK_MS);
    };

    const scrollWithin = (target: number, step: number) => {
      pendingTop = target;
      container.scrollTo({ top: target, behavior: Math.abs(step) < SNAP_SMOOTH_STEP_PX ? 'instant' : glideBehavior });
    };

    const measureRanges = (): ILandingScreenRange[] => {
      const headerOffset = Number.parseFloat(getComputedStyle(container).scrollPaddingTop) || 0;

      return screens.map((screen) => {
        const start = Math.max(screen.offsetTop - headerOffset, 0);

        return { start, end: Math.max(screen.offsetTop + screen.offsetHeight - container.clientHeight, start) };
      });
    };

    const leaveScreen = (
      range: ILandingScreenRange,
      neighbor: ILandingScreenRange | undefined,
      top: number,
      direction: number,
    ) => {
      if (direction < 0 && top > range.end + SNAP_EDGE_TOLERANCE_PX) {
        glideTo(range.end);

        return;
      }

      const edge = direction > 0 ? range.end : range.start;
      const unseen = (edge - top) * direction;
      const padding = direction > 0 ? SNAP_END_PADDING_PX : SNAP_START_PADDING_PX;
      if (unseen > padding) {
        holdUntilQuiet();
        scrollWithin(edge, edge - top);

        return;
      }

      if (neighbor) {
        glideTo(direction > 0 ? neighbor.start : neighbor.end);

        return;
      }

      if (Math.abs(edge - top) > SNAP_EDGE_TOLERANCE_PX) glideTo(edge);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      event.preventDefault();

      if (gesture || quiet !== null) {
        holdUntilQuiet();

        return;
      }

      const ranges = measureRanges();
      const top = pendingTop ?? container.scrollTop;
      const current = ranges.findLastIndex((range) => range.start <= top + SNAP_EDGE_TOLERANCE_PX);
      const range = ranges[current];
      if (!range) return;

      const nextTop = top + event.deltaY;
      if (nextTop >= range.start - SNAP_EDGE_TOLERANCE_PX && nextTop <= range.end + SNAP_EDGE_TOLERANCE_PX) {
        scrollWithin(Math.min(Math.max(nextTop, range.start), range.end), event.deltaY);

        return;
      }

      if (Math.abs(event.deltaY) < SNAP_MIN_DELTA_PX) return;

      const direction = Math.sign(event.deltaY);
      leaveScreen(range, ranges[current + direction], top, direction);
    };

    container.addEventListener('wheel', handleWheel, { passive: false, signal: listeners.signal });
    container.addEventListener(
      'scrollend',
      () => {
        pendingTop = null;
      },
      { signal: listeners.signal },
    );

    return () => {
      settle();
      if (quiet !== null) window.clearTimeout(quiet);
      listeners.abort();
    };
  }, [containerRef, reducedMotion]);
};
