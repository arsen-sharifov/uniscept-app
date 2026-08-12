import type { MouseEvent as ReactMouseEvent } from 'react';
import { vi } from 'vitest';

export const domRect = (overrides: Partial<DOMRect>): DOMRect =>
  ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0, x: 0, y: 0, ...overrides }) as DOMRect;

export const pointerEvent = (clientX = 0, clientY = 0, shiftKey = false): ReactMouseEvent =>
  ({ clientX, clientY, shiftKey }) as never;

export const stubAnimationFrame = () => {
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frameId += 1;
    frames.set(frameId, callback);

    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });

  return {
    flush: () => {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(0));
    },
  };
};

export const stubIntersectionObserver = () => {
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();
  const callbacks: IntersectionObserverCallback[] = [];

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;

      constructor(callback: IntersectionObserverCallback) {
        callbacks.push(callback);
      }
    },
  );

  return {
    observe,
    unobserve,
    disconnect,
    intersect: (targets: Element[], isIntersecting = true) =>
      callbacks.forEach((callback) =>
        callback(
          targets.map((target) => ({ target, isIntersecting }) as IntersectionObserverEntry),
          {} as IntersectionObserver,
        ),
      ),
  };
};
