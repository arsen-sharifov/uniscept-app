import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AUTHORSHIP_NOW, AUTHORSHIP_TIMES, CANVAS_AUTHORS, THREAD_ID } from '@mocks/canvas';
import { TRANSLATIONS, translate } from '@mocks/i18n';
import { SMART_TOOLTIP_DELAY_MS } from '@mocks/tooltip';
import { CLOCK_TICK_MS } from '@/components/Canvas/consts';
import { AuthorStamp } from '@/components/Canvas/fragments';
import { useCanvasStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

beforeEach(() => {
  vi.useFakeTimers({ now: new Date(AUTHORSHIP_NOW) });
  useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [], edges: [], authors: CANVAS_AUTHORS });
});

afterEach(() => {
  cleanup();
  useCanvasStore.getState().clearCanvas();
  vi.useRealTimers();
});

describe('AuthorStamp', () => {
  describe('GIVEN a node a member wrote five minutes ago', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="node" authorId="user-1" createdAt={AUTHORSHIP_TIMES.fiveMinutesAgo} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the initial, the short name and the relative time show without the edit label', () => {
        expect(screen.getByText('D')).toHaveAttribute('aria-hidden');
        expect(screen.getByText('Dana P.')).toHaveAttribute('aria-hidden');
        expect(screen.getByRole('time')).toHaveTextContent('5 min. ago');
        expect(screen.getByRole('time')).toHaveAttribute('datetime', AUTHORSHIP_TIMES.fiveMinutesAgo);
        expect(screen.queryByText(TRANSLATIONS.platform.canvas.authorship.edited)).not.toBeInTheDocument();
      });

      test('THEN screen readers hear the full name and the exact creation time', () => {
        expect(screen.getByText(CANVAS_AUTHORS['user-1'].name)).toHaveClass('sr-only');
        expect(screen.getByText('5 min. ago')).toHaveAttribute('aria-hidden', 'true');
        expect(
          screen.getByText(translate('platform.canvas.authorship.createdDetail', { time: 'Mar 10, 2026, 11:55 AM' })),
        ).toHaveClass('sr-only');
      });

      test('THEN the time stays out of the tab order of the canvas', () => {
        expect(screen.getByRole('time')).not.toHaveAttribute('tabindex');
      });

      test('THEN the row sits on the tinted strip and stays out of canvas exports', () => {
        expect(screen.getByText(CANVAS_AUTHORS['user-1'].name).closest('[data-export-omit]')).toHaveClass(
          'bg-[color:var(--accent-soft)]/60',
        );
      });
    });

    describe('WHEN the pointer rests on the short name', () => {
      beforeEach(() => {
        fireEvent.mouseEnter(screen.getByText('Dana P.'));
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN the full name shows in a tooltip', () => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(CANVAS_AUTHORS['user-1'].name);
      });
    });

    describe('WHEN the pointer rests on the time', () => {
      beforeEach(() => {
        fireEvent.mouseEnter(screen.getByText('5 min. ago'));
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN the exact creation time shows in a tooltip', () => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(
          translate('platform.canvas.authorship.createdDetail', { time: 'Mar 10, 2026, 11:55 AM' }),
        );
      });
    });
  });

  describe('GIVEN a comment written twenty seconds ago', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="comment" authorId="user-2" createdAt={AUTHORSHIP_TIMES.twentySecondsAgo} />);
    });

    describe('WHEN it renders', () => {
      test('THEN it reads as just now beside the icon and the short name of the member', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.authorship.justNow)).toBeInTheDocument();
        expect(screen.getByText('Ilya M.').closest('[data-export-omit]')?.querySelector('svg')).toBeInTheDocument();
        expect(screen.getByText(CANVAS_AUTHORS['user-2'].name)).toHaveClass('sr-only');
      });
    });

    describe('WHEN the time is reached with the keyboard', () => {
      beforeEach(() => {
        fireEvent.focus(screen.getByRole('time'));
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN it takes focus and the exact time shows in a tooltip', () => {
        expect(screen.getByRole('time')).toHaveAttribute('tabindex', '0');
        expect(screen.getByRole('tooltip')).toHaveTextContent(
          translate('platform.canvas.authorship.createdDetail', { time: 'Mar 10, 2026, 11:59 AM' }),
        );
      });
    });

    describe('WHEN a minute passes', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(CLOCK_TICK_MS));
      });

      test('THEN the time moves on without a reload', () => {
        expect(screen.getByText('1 min. ago')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a comment stamped a little ahead of the viewer clock', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="comment" authorId="user-1" createdAt={AUTHORSHIP_TIMES.inTwoMinutes} />);
    });

    describe('WHEN it renders', () => {
      test('THEN it reads as just now instead of a time in the future', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.authorship.justNow)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a node written an hour and a half ago', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="node" authorId="user-1" createdAt={AUTHORSHIP_TIMES.ninetyMinutesAgo} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the time reads in hours ago', () => {
        expect(screen.getByText('1 hr. ago')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a node written three days ago', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="node" authorId="user-1" createdAt={AUTHORSHIP_TIMES.threeDaysAgo} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the time reads in days ago', () => {
        expect(screen.getByText('3 days ago')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a node written exactly seven days ago', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="node" authorId="user-1" createdAt={AUTHORSHIP_TIMES.sevenDaysAgo} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the time past the first week reads as a short date', () => {
        expect(screen.getByText('Mar 3')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a node written last year', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="node" authorId="user-1" createdAt={AUTHORSHIP_TIMES.lastYear} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the date carries the year', () => {
        expect(screen.getByText('Mar 1, 2025')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a node its author edited a minute ago', () => {
    beforeEach(() => {
      render(
        <AuthorStamp
          placement="node"
          authorId="user-1"
          createdAt={AUTHORSHIP_TIMES.threeDaysAgo}
          editedAt={AUTHORSHIP_TIMES.oneMinuteAgo}
          editedBy="user-1"
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the time of the edit is followed by the edited label', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.authorship.edited)).toHaveAttribute('aria-hidden');
        expect(screen.getByRole('time')).toHaveTextContent('1 min. ago');
        expect(screen.getByRole('time')).toHaveAttribute('datetime', AUTHORSHIP_TIMES.oneMinuteAgo);
      });

      test('THEN screen readers hear when it was written and who edited it when', () => {
        expect(
          screen.getByText(
            [
              translate('platform.canvas.authorship.createdDetail', { time: 'Mar 7, 2026, 12:00 PM' }),
              translate('platform.canvas.authorship.editedDetail', {
                name: CANVAS_AUTHORS['user-1'].name,
                time: 'Mar 10, 2026, 11:59 AM',
              }),
            ].join('. '),
          ),
        ).toHaveClass('sr-only');
      });
    });

    describe('WHEN the pointer rests on the time', () => {
      beforeEach(() => {
        fireEvent.mouseEnter(screen.getByText('1 min. ago'));
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN the tooltip shows both the creation and the edit', () => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(
          translate('platform.canvas.authorship.createdDetail', { time: 'Mar 7, 2026, 12:00 PM' }),
        );
        expect(screen.getByRole('tooltip')).toHaveTextContent(
          translate('platform.canvas.authorship.editedDetail', {
            name: CANVAS_AUTHORS['user-1'].name,
            time: 'Mar 10, 2026, 11:59 AM',
          }),
        );
      });
    });
  });

  describe('GIVEN a comment edited after its author deleted the account', () => {
    beforeEach(() => {
      render(
        <AuthorStamp
          placement="comment"
          createdAt={AUTHORSHIP_TIMES.threeDaysAgo}
          editedAt={AUTHORSHIP_TIMES.oneMinuteAgo}
        />,
      );
    });

    describe('WHEN the time is reached with the keyboard', () => {
      beforeEach(() => {
        fireEvent.focus(screen.getByRole('time'));
        act(() => vi.advanceTimersByTime(SMART_TOOLTIP_DELAY_MS));
      });

      test('THEN the edit is attributed to the deleted account', () => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(
          translate('platform.canvas.authorship.editedDetail', {
            name: TRANSLATIONS.platform.canvas.authorship.deletedAccount,
            time: 'Mar 10, 2026, 11:59 AM',
          }),
        );
      });
    });
  });

  describe('GIVEN a node by someone who left the workspace', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="node" authorId="user-gone" createdAt={AUTHORSHIP_TIMES.fiveMinutesAgo} />);
    });

    describe('WHEN it renders', () => {
      test('THEN a placeholder replaces the name and the initial', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.authorship.formerMember)).toBeInTheDocument();
        expect(screen.queryByText('F')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a node whose author deleted the account', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="node" createdAt={AUTHORSHIP_TIMES.fiveMinutesAgo} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the deleted account placeholder shows', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.authorship.deletedAccount)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a node without a usable creation time', () => {
    beforeEach(() => {
      render(<AuthorStamp placement="node" authorId="user-1" createdAt="not a date" />);
    });

    describe('WHEN it renders', () => {
      test('THEN only the author shows', () => {
        expect(screen.getByText(CANVAS_AUTHORS['user-1'].name)).toBeInTheDocument();
        expect(screen.queryByRole('time')).not.toBeInTheDocument();
      });
    });
  });
});
