import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { PAN_TOOL, UNDO_TOOL, ZOOM_IN_TOOL } from '@mocks/toolbar';
import { ToolButton } from '@/components/Toolbar/fragments';

const onClick = vi.fn();

const selectionMark = () => document.querySelector('span[aria-hidden]');

describe('ToolButton', () => {
  describe('GIVEN the active mode tool', () => {
    beforeEach(() => {
      render(<ToolButton tool={PAN_TOOL} active onClick={onClick} />);
    });

    describe('WHEN it renders', () => {
      test('THEN it is pressed and shows the accent selection mark', () => {
        expect(screen.getByRole('button', { name: 'Pan' })).toHaveAttribute('aria-pressed', 'true');
        expect(selectionMark()).toHaveClass('opacity-100', 'bg-[color:var(--accent)]');
      });
    });
  });

  describe('GIVEN an inactive mode tool', () => {
    beforeEach(() => {
      render(<ToolButton tool={PAN_TOOL} active={false} onClick={onClick} />);
    });

    describe('WHEN it is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Pan' }));
      });

      test('THEN it asks to switch to the tool without flashing', () => {
        expect(onClick).toHaveBeenCalledExactlyOnceWith('pan');
        expect(screen.getByRole('button', { name: 'Pan' })).not.toHaveClass('scale-[1.06]');
      });
    });
  });

  describe('GIVEN a tool bound to the plus key', () => {
    beforeEach(() => {
      render(<ToolButton tool={ZOOM_IN_TOOL} active={false} onClick={onClick} />);
    });

    describe('WHEN it renders', () => {
      test('THEN it announces the Plus key shortcut', () => {
        expect(screen.getByRole('button', { name: 'Zoom in' })).toHaveAttribute('aria-keyshortcuts', 'Plus');
      });
    });
  });

  describe('GIVEN an inactive toned mode tool', () => {
    beforeEach(() => {
      render(<ToolButton tool={{ ...PAN_TOOL, tone: 'success' }} active={false} onClick={onClick} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the selection mark takes the tone ink and stays hidden', () => {
        expect(selectionMark()).toHaveClass('opacity-0');
        expect(selectionMark()).not.toHaveClass('bg-[color:var(--accent)]');
        expect(selectionMark()).toHaveStyle({ backgroundColor: 'var(--status-success)' });
      });
    });
  });

  describe('GIVEN an action tool', () => {
    beforeEach(() => {
      render(<ToolButton tool={UNDO_TOOL} active={false} onClick={onClick} />);
    });

    describe('WHEN it is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
      });

      test('THEN it runs and flashes', () => {
        expect(onClick).toHaveBeenCalledExactlyOnceWith('undo');
        expect(screen.getByRole('button', { name: 'Undo' })).toHaveClass('scale-[1.06]');
      });
    });
  });

  describe('GIVEN a disabled action tool', () => {
    beforeEach(() => {
      render(<ToolButton tool={{ ...UNDO_TOOL, disabled: true }} active={false} onClick={onClick} />);
    });

    describe('WHEN it is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
      });

      test('THEN nothing runs and it does not flash', () => {
        expect(onClick).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Undo' })).not.toHaveClass('scale-[1.06]');
      });
    });
  });
});
