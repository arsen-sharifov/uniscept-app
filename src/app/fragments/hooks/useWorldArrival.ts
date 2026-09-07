'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { ARRIVAL_CONTENT_CAP_MS } from '../consts';
import { auroraReady } from '../utils';

let fieldIn = false;
let contentIn = false;
let capTimer: number | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const clearCap = () => {
  if (capTimer === null) return;

  window.clearTimeout(capTimer);
  capTimer = null;
};

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);

  return () => listeners.delete(onChange);
};

const getFieldIn = () => fieldIn;

const getContentIn = () => contentIn;

const getServerSnapshot = () => false;

const settleField = () => {
  if (fieldIn) return;

  fieldIn = true;
  notify();
};

const settleContent = () => {
  if (contentIn) return;

  clearCap();
  contentIn = true;
  notify();
};

export const useWorldArrival = () => {
  const field = useSyncExternalStore(subscribe, getFieldIn, getServerSnapshot);
  const content = useSyncExternalStore(subscribe, getContentIn, getServerSnapshot);

  useEffect(() => {
    if (!fieldIn) auroraReady().then(() => requestAnimationFrame(settleField));
    if (contentIn) return;

    clearCap();
    capTimer = window.setTimeout(settleContent, Math.max(0, ARRIVAL_CONTENT_CAP_MS - performance.now()));
    Promise.all([document.fonts.ready, auroraReady()]).then(() => requestAnimationFrame(settleContent));

    return () => {
      if (!contentIn) clearCap();
    };
  }, []);

  return { field, content };
};
