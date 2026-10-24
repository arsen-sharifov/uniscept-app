'use client';

import { useSyncExternalStore } from 'react';

import { CLOCK_TICK_MS } from '../consts';

const listeners = new Set<() => void>();
let now = Date.now();
let timer: number | null = null;

const tick = () => {
  now = Date.now();
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  timer ??= window.setInterval(tick, CLOCK_TICK_MS);

  return () => {
    listeners.delete(listener);
    if (listeners.size > 0 || timer === null) return;

    window.clearInterval(timer);
    timer = null;
  };
};

const getSnapshot = () => {
  if (timer === null && Math.abs(Date.now() - now) >= CLOCK_TICK_MS) now = Date.now();

  return now;
};

export const useMinuteClock = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
