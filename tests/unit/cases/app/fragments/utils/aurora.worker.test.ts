import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TAuroraMessage } from '@interfaces';

import { createAuroraRenderer, draw, renderer, AURORA_NOW, AURORA_START } from '@mocks/auroraRenderer';
import { stubAnimationFrame } from '@mocks/browser';

vi.mock('@/app/fragments/utils/auroraRenderer', () => ({ createAuroraRenderer }));

const postMessage = vi.fn();

let frames: ReturnType<typeof stubAnimationFrame>;

const message = (data: TAuroraMessage) => new MessageEvent('message', { data });

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers({ now: AURORA_NOW });
  frames = stubAnimationFrame();
  vi.spyOn(self, 'postMessage').mockImplementation(postMessage);
  createAuroraRenderer.mockReturnValue(renderer);
  await import('@/app/fragments/utils/aurora.worker');
});

afterEach(() => {
  self.onmessage = null;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('aurora.worker', () => {
  describe('GIVEN a worker whose canvas has no graphics context', () => {
    beforeEach(() => {
      createAuroraRenderer.mockReturnValue(null);
    });

    describe('WHEN it is started', () => {
      beforeEach(() => {
        self.onmessage?.call(self, message(AURORA_START));
      });

      test('THEN it reports that it cannot draw and starts no loop', () => {
        expect(postMessage).toHaveBeenCalledExactlyOnceWith('unavailable');
        expect(frames.pending()).toBe(0);
      });
    });
  });

  describe('GIVEN a worker with graphics', () => {
    describe('WHEN it is started with animation', () => {
      beforeEach(() => {
        self.onmessage?.call(self, message(AURORA_START));
      });

      test('THEN it sizes the canvas, draws the first frame on the time the message spent in transit, and animates', () => {
        expect(createAuroraRenderer).toHaveBeenCalledExactlyOnceWith(AURORA_START.canvas, AURORA_START.renderScale);
        expect(renderer.resize).toHaveBeenCalledExactlyOnceWith(800, 600);
        expect(draw).toHaveBeenCalledExactlyOnceWith(2.5, 0);
        expect(postMessage).toHaveBeenCalledExactlyOnceWith('ready');
        expect(frames.pending()).toBe(1);
      });
    });

    describe('WHEN it is started still', () => {
      beforeEach(() => {
        self.onmessage?.call(self, message({ ...AURORA_START, still: true }));
      });

      test('THEN it draws the frame it was given and does not animate', () => {
        expect(draw).toHaveBeenCalledExactlyOnceWith(2, 0);
        expect(postMessage).toHaveBeenCalledExactlyOnceWith('ready');
        expect(frames.pending()).toBe(0);
      });
    });

    describe('WHEN it is told to run or update before it was started', () => {
      beforeEach(() => {
        self.onmessage?.call(self, message({ kind: 'run', running: true }));
        self.onmessage?.call(self, message({ kind: 'update', width: 400, height: 300, paper: 1 }));
      });

      test('THEN it ignores both', () => {
        expect(draw).not.toHaveBeenCalled();
        expect(frames.pending()).toBe(0);
      });
    });
  });

  describe('GIVEN a started worker', () => {
    beforeEach(() => {
      self.onmessage?.call(self, message(AURORA_START));
      draw.mockClear();
      vi.mocked(renderer.resize).mockClear();
    });

    describe('WHEN it is told to stop', () => {
      beforeEach(() => {
        self.onmessage?.call(self, message({ kind: 'run', running: false }));
      });

      test('THEN its loop stops', () => {
        expect(frames.pending()).toBe(0);
      });
    });

    describe('WHEN it is told to stop and then to run again', () => {
      beforeEach(() => {
        self.onmessage?.call(self, message({ kind: 'run', running: false }));
        self.onmessage?.call(self, message({ kind: 'run', running: true }));
      });

      test('THEN its loop resumes', () => {
        expect(frames.pending()).toBe(1);
      });
    });

    describe('WHEN the page switches to the light palette and resizes', () => {
      beforeEach(() => {
        self.onmessage?.call(self, message({ kind: 'update', width: 400, height: 300, paper: 1 }));
      });

      test('THEN it resizes and redraws in the new palette', () => {
        expect(renderer.resize).toHaveBeenCalledExactlyOnceWith(400, 300);
        expect(draw).toHaveBeenCalledExactlyOnceWith(2.5, 1);
      });
    });
  });
});
