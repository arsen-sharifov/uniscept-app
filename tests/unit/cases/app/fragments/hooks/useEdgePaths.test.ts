import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IHeroEdgePath } from '@interfaces';

import { setElementLayout, stubFontsReady, stubResizeObserver } from '@mocks/browser';
import { HERO_EDGES, HERO_QUESTION_RECT, HERO_PREMISE_RECT } from '@mocks/landing';
import { HERO_REMEASURE_DELAY_MS } from '@/app/fragments/consts';
import { useEdgePaths } from '@/app/fragments/hooks';
import { buildEdgePath } from '@/app/fragments/utils';

let stage: HTMLDivElement;
let stageRef: { current: HTMLDivElement };
let question: HTMLDivElement;
let premise: HTMLDivElement;
let fonts: ReturnType<typeof stubFontsReady>;
let resizes: ReturnType<typeof stubResizeObserver>;
let paths: { current: IHeroEdgePath[] };

const heroNode = (id: string) => {
  const element = document.createElement('div');
  element.dataset.heroNode = id;
  stage.append(element);

  return element;
};

const place = (element: HTMLElement, rect: typeof HERO_QUESTION_RECT) =>
  setElementLayout(element, {
    offsetLeft: rect.x,
    offsetTop: rect.y,
    offsetWidth: rect.width,
    offsetHeight: rect.height,
    offsetParent: stage,
  });

beforeEach(() => {
  vi.useFakeTimers();
  fonts = stubFontsReady();
  resizes = stubResizeObserver();
  stage = document.createElement('div');
  stageRef = { current: stage };
  question = heroNode('q');
  premise = heroNode('p1');
  place(question, HERO_QUESTION_RECT);
});

afterEach(() => {
  fonts.restore();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useEdgePaths', () => {
  describe('GIVEN a stage where both ends of an edge are laid out', () => {
    beforeEach(() => {
      place(premise, HERO_PREMISE_RECT);
      paths = renderHook(() => useEdgePaths(stageRef, HERO_EDGES)).result;
    });

    describe('WHEN it mounts', () => {
      test('THEN that edge gets a path and the edge to a missing node is skipped', () => {
        expect(paths.current).toEqual([buildEdgePath(HERO_EDGES[0]!, HERO_QUESTION_RECT, HERO_PREMISE_RECT)]);
      });

      test('THEN the stage and every node are watched for size changes', () => {
        expect(resizes.observe.mock.calls.map(([element]) => element)).toEqual([stage, question, premise]);
      });
    });

    describe('WHEN a node moves and the stage reports a resize', () => {
      beforeEach(() => {
        place(premise, { ...HERO_PREMISE_RECT, x: 320 });
        act(() => resizes.resize());
      });

      test('THEN the path follows the node', () => {
        expect(paths.current).toEqual([
          buildEdgePath(HERO_EDGES[0]!, HERO_QUESTION_RECT, { ...HERO_PREMISE_RECT, x: 320 }),
        ]);
      });
    });

    describe('WHEN it unmounts', () => {
      beforeEach(() => {
        cleanup();
      });

      test('THEN it stops watching and drops the pending remeasure', () => {
        expect(resizes.disconnect).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });

  describe('GIVEN a node that is not laid out on mount', () => {
    beforeEach(() => {
      paths = renderHook(() => useEdgePaths(stageRef, HERO_EDGES)).result;
    });

    describe('WHEN it gets its layout and the remeasure delay passes', () => {
      beforeEach(() => {
        place(premise, HERO_PREMISE_RECT);
        act(() => vi.advanceTimersByTime(HERO_REMEASURE_DELAY_MS));
      });

      test('THEN its edge appears', () => {
        expect(paths.current).toEqual([buildEdgePath(HERO_EDGES[0]!, HERO_QUESTION_RECT, HERO_PREMISE_RECT)]);
      });
    });

    describe('WHEN it gets its layout once the fonts load', () => {
      beforeEach(async () => {
        place(premise, HERO_PREMISE_RECT);
        fonts.load();
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN its edge appears without waiting for the remeasure delay', () => {
        expect(paths.current).toEqual([buildEdgePath(HERO_EDGES[0]!, HERO_QUESTION_RECT, HERO_PREMISE_RECT)]);
      });
    });
  });
});
