import { vi } from 'vitest';

export const domRect = (overrides: Partial<DOMRect>): DOMRect =>
  ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0, x: 0, y: 0, ...overrides }) as DOMRect;

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
