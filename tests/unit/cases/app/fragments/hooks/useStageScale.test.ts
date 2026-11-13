import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { setElementLayout, stubResizeObserver } from '@mocks/browser';
import { HERO_STAGE_DESIGN_WIDTH_PX } from '@/app/fragments/consts';
import { useStageScale } from '@/app/fragments/hooks';

let frame: HTMLDivElement;
let resizes: ReturnType<typeof stubResizeObserver>;
let scale: { current: number };
let unmount: () => void;

beforeEach(() => {
  resizes = stubResizeObserver();
  frame = document.createElement('div');
  const frameRef = { current: frame };
  const rendered = renderHook(() => useStageScale(frameRef));
  scale = rendered.result;
  unmount = rendered.unmount;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useStageScale', () => {
  describe('GIVEN a frame narrower than the stage design', () => {
    beforeEach(() => {
      setElementLayout(frame, { clientWidth: HERO_STAGE_DESIGN_WIDTH_PX * 0.75 });
    });

    describe('WHEN the frame is measured', () => {
      beforeEach(() => {
        act(() => resizes.resize());
      });

      test('THEN the stage shrinks to the width of the frame', () => {
        expect(scale.current).toBe(0.75);
      });
    });
  });

  describe('GIVEN a frame wider than the stage design', () => {
    beforeEach(() => {
      setElementLayout(frame, { clientWidth: HERO_STAGE_DESIGN_WIDTH_PX * 1.5 });
    });

    describe('WHEN the frame is measured', () => {
      beforeEach(() => {
        act(() => resizes.resize());
      });

      test('THEN the stage keeps its design size', () => {
        expect(scale.current).toBe(1);
      });
    });
  });

  describe('GIVEN a frame that is not laid out', () => {
    beforeEach(() => {
      setElementLayout(frame, { clientWidth: 0 });
    });

    describe('WHEN the frame is measured', () => {
      beforeEach(() => {
        act(() => resizes.resize());
      });

      test('THEN the stage keeps its design size instead of collapsing', () => {
        expect(scale.current).toBe(1);
      });
    });
  });

  describe('GIVEN an observed frame', () => {
    describe('WHEN the stage unmounts', () => {
      beforeEach(() => {
        unmount();
      });

      test('THEN the frame is no longer observed', () => {
        expect(resizes.observe).toHaveBeenCalledWith(frame);
        expect(resizes.disconnect).toHaveBeenCalledOnce();
      });
    });
  });
});
