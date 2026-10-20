import type { MouseEvent as ReactMouseEvent } from 'react';
import { onTestFinished, vi } from 'vitest';

export const domRect = (overrides: Partial<DOMRect>): DOMRect =>
  ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0, x: 0, y: 0, ...overrides }) as DOMRect;

export const elementAt = (attributes: Record<string, string>, rect: Partial<DOMRect>, tag = 'div'): HTMLElement => {
  const element = document.createElement(tag);
  const { top = 0, left = 0, width = 0, height = 0 } = rect;
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
    domRect({ right: left + width, bottom: top + height, ...rect }),
  );

  return element;
};

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
    flush: (now = 0) => {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(now));
    },
    pending: () => frames.size,
  };
};

export const stubPerformanceNow = () => {
  let now = 0;

  vi.spyOn(performance, 'now').mockImplementation(() => now);

  return {
    advance: (durationMs: number) => {
      now += durationMs;
    },
  };
};

export const stubMediaQueries = () => {
  const queries = new Map<string, MediaQueryList>();

  const getQuery = (media: string): MediaQueryList => {
    const existing = queries.get(media);
    if (existing) return existing;

    const query = new EventTarget() as MediaQueryList;
    Object.defineProperties(query, {
      media: { value: media },
      matches: { configurable: true, value: false },
    });
    queries.set(media, query);

    return query;
  };

  vi.stubGlobal('matchMedia', getQuery);

  return {
    change: (media: string, matches: boolean) => {
      const query = getQuery(media);
      Object.defineProperty(query, 'matches', { configurable: true, value: matches });
      query.dispatchEvent(new Event('change'));
    },
  };
};

export const stubFontsReady = () => {
  let load = () => {};
  const ready = new Promise<void>((resolve) => {
    load = resolve;
  });

  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready } });

  return {
    load: () => load(),
    restore: () => Reflect.deleteProperty(document, 'fonts'),
  };
};

export const stubScrollIntoView = () => {
  const scrollIntoView = vi.fn();

  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  onTestFinished(() => {
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  return scrollIntoView;
};

export const stubResizeObserver = () => {
  const observe = vi.fn();
  const disconnect = vi.fn();
  const callbacks: ResizeObserverCallback[] = [];

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = observe;
      unobserve = vi.fn();
      disconnect = disconnect;

      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }
    },
  );

  return {
    observe,
    disconnect,
    resize: () => callbacks.forEach((callback) => callback([], {} as ResizeObserver)),
  };
};

export const stubIntersectionObserver = () => {
  const observers = new Map<IntersectionObserverCallback, Set<Element>>();

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      targets = new Set<Element>();
      observe = (target: Element) => this.targets.add(target);
      disconnect = () => this.targets.clear();

      constructor(callback: IntersectionObserverCallback) {
        observers.set(callback, this.targets);
      }
    },
  );

  const report = (isIntersecting: boolean, only?: Element) =>
    observers.forEach((targets, callback) => {
      const entries = [...targets]
        .filter((target) => !only || target === only)
        .map((target) => ({ target, isIntersecting }) as IntersectionObserverEntry);
      if (entries.length > 0) callback(entries, {} as IntersectionObserver);
    });

  return {
    intersect: (only?: Element) => report(true, only),
    leave: (only?: Element) => report(false, only),
  };
};

export const stubWorker = () => {
  const construct = vi.fn();
  const postMessage = vi.fn();
  const terminate = vi.fn();
  const workers: Worker[] = [];

  vi.stubGlobal(
    'Worker',
    class {
      postMessage = postMessage;
      terminate = terminate;
      onmessage: Worker['onmessage'] = null;
      onerror: Worker['onerror'] = null;

      constructor() {
        construct();
        workers.push(this as unknown as Worker);
      }
    },
  );

  return {
    construct,
    postMessage,
    terminate,
    message: (data: unknown) =>
      workers.forEach((worker) => worker.onmessage?.call(worker, new MessageEvent('message', { data }))),
    fail: () => workers.forEach((worker) => worker.onerror?.call(worker, new ErrorEvent('error'))),
  };
};

export const stubOffscreenCanvas = () => {
  const original = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'transferControlToOffscreen');
  const transfer = vi.fn(() => ({}) as OffscreenCanvas);

  Object.defineProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen', {
    configurable: true,
    value: transfer,
  });

  return {
    transfer,
    restore: () => {
      if (original) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen', original);

        return;
      }

      Reflect.deleteProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen');
    },
  };
};

export const setElementLayout = (
  element: HTMLElement,
  layout: Partial<
    Pick<
      HTMLElement,
      | 'offsetLeft'
      | 'offsetTop'
      | 'offsetWidth'
      | 'offsetHeight'
      | 'offsetParent'
      | 'clientHeight'
      | 'clientWidth'
      | 'scrollWidth'
    >
  >,
) => {
  Object.entries(layout).forEach(([property, value]) => {
    Object.defineProperty(element, property, { configurable: true, value });
  });
};

export const webGlSurface = (linked = true) => {
  const gl = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    LINK_STATUS: 3,
    ARRAY_BUFFER: 4,
    STATIC_DRAW: 5,
    FLOAT: 6,
    TRIANGLES: 7,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => linked),
    deleteShader: vi.fn(),
    useProgram: vi.fn(),
    bindBuffer: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    getUniformLocation: vi.fn((_program: unknown, name: string) => name),
    viewport: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    drawArrays: vi.fn(),
  };

  return { gl, canvas: { width: 0, height: 0, getContext: vi.fn(() => gl) } };
};

export const listenOnPage = (listeners: Record<string, EventListener>) => {
  const entries = Object.entries(listeners);
  entries.forEach(([type, listener]) => document.body.addEventListener(type, listener));
  onTestFinished(() => entries.forEach(([type, listener]) => document.body.removeEventListener(type, listener)));
};

export const stubProperty = (owner: object, property: PropertyKey, value: unknown) => {
  const original = Object.getOwnPropertyDescriptor(owner, property);

  Object.defineProperty(owner, property, { configurable: true, writable: true, value });
  onTestFinished(() => {
    if (original) {
      Object.defineProperty(owner, property, original);

      return;
    }

    Reflect.deleteProperty(owner, property);
  });
};

export const stubRangeRects = (rectOf: (range: Range) => DOMRect) => {
  stubProperty(Range.prototype, 'getBoundingClientRect', function (this: Range) {
    return rectOf(this);
  });
  stubProperty(Range.prototype, 'getClientRects', function (this: Range) {
    return [rectOf(this)];
  });
};
