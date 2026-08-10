import { beforeEach, describe, expect, test } from 'vitest';

import { domRect } from '@mocks/browser';
import {
  choosePlacement,
  computeTooltipPosition,
  fitsInViewport,
  getOppositePlacement,
} from '@/components/Tooltip/utils';

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
});

describe('getOppositePlacement', () => {
  describe('GIVEN each placement', () => {
    describe('WHEN the opposite is resolved', () => {
      test('THEN the axes flip', () => {
        expect(getOppositePlacement('top')).toBe('bottom');
        expect(getOppositePlacement('bottom')).toBe('top');
        expect(getOppositePlacement('left')).toBe('right');
        expect(getOppositePlacement('right')).toBe('left');
      });
    });
  });
});

describe('fitsInViewport', () => {
  describe('GIVEN a trigger with room above', () => {
    describe('WHEN the top placement is checked', () => {
      test('THEN it fits', () => {
        const trigger = domRect({ top: 100, bottom: 120, left: 400, right: 500, width: 100, height: 20 });

        expect(fitsInViewport('top', trigger, { width: 80, height: 50 })).toBe(true);
      });
    });
  });

  describe('GIVEN a trigger crammed against the top edge', () => {
    describe('WHEN the top placement is checked', () => {
      test('THEN it does not fit', () => {
        const trigger = domRect({ top: 50, bottom: 70, left: 400, right: 500, width: 100, height: 20 });

        expect(fitsInViewport('top', trigger, { width: 80, height: 50 })).toBe(false);
      });
    });
  });

  describe('GIVEN a trigger with room below', () => {
    describe('WHEN the bottom placement is checked', () => {
      test('THEN it fits', () => {
        const trigger = domRect({ top: 580, bottom: 600, left: 400, right: 500, width: 100, height: 20 });

        expect(fitsInViewport('bottom', trigger, { width: 80, height: 50 })).toBe(true);
      });
    });
  });

  describe('GIVEN a trigger crammed against the bottom edge', () => {
    describe('WHEN the bottom placement is checked', () => {
      test('THEN it does not fit', () => {
        const trigger = domRect({ top: 690, bottom: 710, left: 400, right: 500, width: 100, height: 20 });

        expect(fitsInViewport('bottom', trigger, { width: 80, height: 50 })).toBe(false);
      });
    });
  });

  describe('GIVEN a trigger with room on the left', () => {
    describe('WHEN the left placement is checked', () => {
      test('THEN it fits', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 200, right: 300, width: 100, height: 20 });

        expect(fitsInViewport('left', trigger, { width: 80, height: 50 })).toBe(true);
      });
    });
  });

  describe('GIVEN a trigger crammed against the left edge', () => {
    describe('WHEN the left placement is checked', () => {
      test('THEN it does not fit', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 90, right: 190, width: 100, height: 20 });

        expect(fitsInViewport('left', trigger, { width: 80, height: 50 })).toBe(false);
      });
    });
  });

  describe('GIVEN a trigger with room on the right', () => {
    describe('WHEN the right placement is checked', () => {
      test('THEN it fits', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 800, right: 900, width: 100, height: 20 });

        expect(fitsInViewport('right', trigger, { width: 80, height: 50 })).toBe(true);
      });
    });
  });

  describe('GIVEN a trigger crammed against the right edge', () => {
    describe('WHEN the right placement is checked', () => {
      test('THEN it does not fit', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 840, right: 940, width: 100, height: 20 });

        expect(fitsInViewport('right', trigger, { width: 80, height: 50 })).toBe(false);
      });
    });
  });
});

describe('choosePlacement', () => {
  describe('GIVEN a trigger with room on every side', () => {
    describe('WHEN the preferred placement is resolved', () => {
      test('THEN it is returned without falling back', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 400, right: 500, width: 100, height: 20 });

        expect(choosePlacement('bottom', trigger, { width: 80, height: 40 })).toBe('bottom');
      });
    });
  });

  describe('GIVEN a trigger where neither vertical placement fits', () => {
    describe('WHEN the preferred top placement is resolved', () => {
      test('THEN it falls through to a perpendicular candidate', () => {
        const trigger = domRect({ top: 4, bottom: 24, left: 10, right: 110, width: 100, height: 20 });

        expect(choosePlacement('top', trigger, { width: 80, height: 1000 })).toBe('right');
      });
    });
  });

  describe('GIVEN a trigger against the right edge', () => {
    describe('WHEN the preferred right placement is resolved', () => {
      test('THEN it falls back to the opposite side', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 900, right: 1000, width: 100, height: 20 });

        expect(choosePlacement('right', trigger, { width: 80, height: 40 })).toBe('left');
      });
    });
  });

  describe('GIVEN a tooltip larger than the viewport', () => {
    describe('WHEN the placement is resolved', () => {
      test('THEN the preferred placement is kept', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 400, right: 500, width: 100, height: 20 });

        expect(choosePlacement('right', trigger, { width: 2000, height: 2000 })).toBe('right');
      });
    });
  });
});

describe('computeTooltipPosition', () => {
  describe('GIVEN a centered trigger with a bottom placement', () => {
    describe('WHEN the position is computed', () => {
      test('THEN the tooltip centers under the trigger with the arrow on the trigger center', () => {
        const trigger = domRect({ top: 100, bottom: 120, left: 462, right: 562, width: 100, height: 20 });

        expect(computeTooltipPosition('bottom', trigger, { width: 200, height: 50 })).toEqual({
          top: 128,
          left: 412,
          placement: 'bottom',
          arrowLeft: 100,
          arrowTop: -18,
        });
      });
    });
  });

  describe('GIVEN a centered trigger with a top placement', () => {
    describe('WHEN the position is computed', () => {
      test('THEN the tooltip centers above the trigger with the arrow on the trigger center', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 462, right: 562, width: 100, height: 20 });

        expect(computeTooltipPosition('top', trigger, { width: 200, height: 50 })).toEqual({
          top: 242,
          left: 412,
          placement: 'top',
          arrowLeft: 100,
          arrowTop: 68,
        });
      });
    });
  });

  describe('GIVEN a centered trigger with a right placement', () => {
    describe('WHEN the position is computed', () => {
      test('THEN the tooltip sits beside the trigger with the arrow on the trigger middle', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 462, right: 562, width: 100, height: 20 });

        expect(computeTooltipPosition('right', trigger, { width: 200, height: 50 })).toEqual({
          top: 285,
          left: 570,
          placement: 'right',
          arrowLeft: -58,
          arrowTop: 25,
        });
      });
    });
  });

  describe('GIVEN a trigger near the right edge with a bottom placement', () => {
    describe('WHEN the position is computed', () => {
      test('THEN the tooltip clamps to the far viewport margin', () => {
        const trigger = domRect({ top: 100, bottom: 120, left: 960, right: 1060, width: 100, height: 20 });

        expect(computeTooltipPosition('bottom', trigger, { width: 200, height: 50 })).toEqual({
          top: 128,
          left: 816,
          placement: 'bottom',
          arrowLeft: 194,
          arrowTop: -18,
        });
      });
    });
  });

  describe('GIVEN a trigger hugging the left edge with a left placement', () => {
    describe('WHEN the position is computed', () => {
      test('THEN the tooltip clamps to the viewport margin and the arrow follows the trigger', () => {
        const trigger = domRect({ top: 300, bottom: 320, left: 10, right: 60, width: 50, height: 20 });

        expect(computeTooltipPosition('left', trigger, { width: 120, height: 40 })).toEqual({
          top: 290,
          left: 8,
          placement: 'left',
          arrowLeft: 27,
          arrowTop: 20,
        });
      });
    });
  });
});
