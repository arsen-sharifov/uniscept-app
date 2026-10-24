import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { domRect, setElementLayout, stubAnimationFrame } from '@mocks/browser';
import { SMART_TOOLTIP_DELAY_MS, TOOLTIP_TRIGGER_RECT } from '@mocks/tooltip';
import { SmartTooltip } from '@/components/Tooltip';

let frames: ReturnType<typeof stubAnimationFrame>;

const trigger = () => screen.getByText('Thread');

beforeEach(() => {
  vi.useFakeTimers();
  frames = stubAnimationFrame();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SmartTooltip', () => {
  describe('GIVEN a trigger under the pointer', () => {
    beforeEach(() => {
      render(<SmartTooltip content="Rename thread">Thread</SmartTooltip>);
      vi.spyOn(trigger(), 'getBoundingClientRect').mockReturnValue(TOOLTIP_TRIGGER_RECT);
      fireEvent.mouseEnter(trigger());
    });

    describe('WHEN the delay elapses and the tooltip is measured', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
        act(() => frames.flush());
      });

      test('THEN it shows next to the trigger', () => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('Rename thread');
        expect(screen.getByRole('tooltip')).toHaveStyle({ opacity: '1' });
      });
    });

    describe('WHEN the pointer leaves before the delay elapses', () => {
      beforeEach(() => {
        fireEvent.mouseLeave(trigger());
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN it never shows', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer is pressed before the delay elapses', () => {
      beforeEach(() => {
        fireEvent.pointerDown(trigger());
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN it never shows', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a shown tooltip', () => {
    beforeEach(() => {
      render(<SmartTooltip content="Rename thread">Thread</SmartTooltip>);
      vi.spyOn(trigger(), 'getBoundingClientRect').mockReturnValue(TOOLTIP_TRIGGER_RECT);
      fireEvent.mouseEnter(trigger());
      act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      act(() => frames.flush());
    });

    describe('WHEN Escape is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      test('THEN it hides while the pointer stays on the trigger', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the page scrolls under it', () => {
      beforeEach(() => {
        fireEvent.scroll(window);
      });

      test('THEN it hides instead of drifting away from the trigger', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer is pressed on the trigger', () => {
      beforeEach(() => {
        fireEvent.pointerDown(trigger());
      });

      test('THEN it hides instead of riding along with a drag', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a tooltip that was shown once and then left', () => {
    beforeEach(() => {
      render(<SmartTooltip content="Rename thread">Thread</SmartTooltip>);
      vi.spyOn(trigger(), 'getBoundingClientRect').mockReturnValue(TOOLTIP_TRIGGER_RECT);
      fireEvent.mouseEnter(trigger());
      act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      act(() => frames.flush());
      fireEvent.mouseLeave(trigger());
      vi.mocked(trigger().getBoundingClientRect).mockReturnValue(
        domRect({ top: 600, bottom: 620, left: 100, right: 200, width: 100, height: 20 }),
      );
    });

    describe('WHEN it opens again after the trigger moved', () => {
      beforeEach(() => {
        fireEvent.mouseEnter(trigger());
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN it stays hidden until it has measured the new spot', () => {
        expect(screen.getByRole('tooltip')).toHaveStyle({ opacity: '0' });
      });
    });
  });

  describe('GIVEN a disabled tooltip', () => {
    beforeEach(() => {
      render(
        <SmartTooltip content="Rename thread" disabled>
          Thread
        </SmartTooltip>,
      );
    });

    describe('WHEN the pointer rests on the trigger past the delay', () => {
      beforeEach(() => {
        fireEvent.mouseEnter(trigger());
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN it never shows', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a tooltip meant only for truncated text', () => {
    beforeEach(() => {
      render(
        <SmartTooltip content="Rename thread" onlyIfTruncated>
          Thread
        </SmartTooltip>,
      );
    });

    describe('WHEN the text fits and the pointer rests past the delay', () => {
      beforeEach(() => {
        setElementLayout(trigger(), { scrollWidth: 100, clientWidth: 100 });
        fireEvent.mouseEnter(trigger());
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN it never shows', () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the text is cut off and the pointer rests past the delay', () => {
      beforeEach(() => {
        setElementLayout(trigger(), { scrollWidth: 160, clientWidth: 100 });
        fireEvent.mouseEnter(trigger());
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN it shows the full text', () => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('Rename thread');
      });
    });
  });
});
