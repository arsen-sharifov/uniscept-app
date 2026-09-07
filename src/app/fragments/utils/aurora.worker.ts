import type { IAuroraFrameLoop, IAuroraRenderer, IAuroraWorkerHost, TAuroraMessage } from '@interfaces';

import { createAuroraRenderer } from './auroraRenderer';
import { createFrameLoop } from './frameLoop';

let renderer: IAuroraRenderer | null = null;
let clock: IAuroraFrameLoop | null = null;
let paper = 0;

const host = self as unknown as IAuroraWorkerHost;

self.onmessage = ({ data }: MessageEvent<TAuroraMessage>) => {
  if (data.kind === 'start') {
    renderer = createAuroraRenderer(data.canvas, data.renderScale);
    if (!renderer) {
      host.postMessage('unavailable');

      return;
    }

    paper = data.paper;
    clock = createFrameLoop(
      (elapsedSeconds) => renderer?.draw(elapsedSeconds, paper),
      data.frameStepCapMs,
      data.still ? data.elapsed : data.elapsed + Math.max(0, Date.now() - data.sentAt) / 1000,
    );
    renderer.resize(data.width, data.height);
    renderer.draw(clock.elapsed(), paper);
    host.postMessage('ready');
    if (!data.still) clock.start();

    return;
  }

  if (!renderer || !clock) return;

  if (data.kind === 'run') {
    if (!data.running) {
      clock.stop();

      return;
    }

    clock.start();

    return;
  }

  paper = data.paper;
  renderer.resize(data.width, data.height);
  renderer.draw(clock.elapsed(), paper);
};
