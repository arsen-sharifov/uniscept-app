import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createCommentOp } from '@mocks/canvas';
import { TRANSLATIONS, translate } from '@mocks/i18n';
import { addUserBadge, getUser } from '@mocks/userApi';
import { useBadgeAwards } from '@/app/platform/hooks';
import { awardBadge, useBadgeStore } from '@/lib/badges';
import { emitCanvasOperation } from '@/lib/canvas';
import { event } from '@/lib/events';

vi.mock('@api/client', () => import('@mocks/userApi'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

let unmountAwards: () => void;

afterEach(() => useBadgeStore.getState().forget());

describe('useBadgeAwards', () => {
  describe('GIVEN the platform mounted for an account with stored badges', () => {
    beforeEach(async () => {
      getUser.mockResolvedValue({ data: { user: { id: 'user-1', user_metadata: { badges: ['founder', 'voice'] } } } });
      addUserBadge.mockResolvedValue(undefined);
      await act(async () => {
        unmountAwards = renderHook(() => useBadgeAwards()).unmount;
      });
    });

    describe('WHEN it renders', () => {
      test('THEN the stored badges are loaded', () => {
        expect(useBadgeStore.getState().earned).toEqual(['founder', 'voice']);
      });
    });

    describe('WHEN a new badge is awarded', () => {
      beforeEach(() => {
        act(() => awardBadge('critic'));
      });

      test('THEN a toast names the badge and how it was earned', () => {
        expect(event.success).toHaveBeenCalledExactlyOnceWith(
          TRANSLATIONS.platform.settings.profile.badges.criticUnlock,
          {
            title: translate('platform.settings.profile.badgeEarned', {
              name: TRANSLATIONS.platform.settings.profile.badges.badgeCritic,
            }),
          },
        );
      });
    });

    describe('WHEN a badge is awarded quietly', () => {
      beforeEach(() => {
        act(() => awardBadge('initiate', { quiet: true }));
      });

      test('THEN no toast is shown', () => {
        expect(useBadgeStore.getState().earned).toContain('initiate');
        expect(event.success).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a comment is posted on the canvas', () => {
      beforeEach(() => {
        act(() => emitCanvasOperation(createCommentOp('c1')));
      });

      test('THEN nothing is announced for a badge already earned', () => {
        expect(event.success).not.toHaveBeenCalled();
        expect(addUserBadge).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the platform unmounts', () => {
      beforeEach(() => {
        unmountAwards();
        emitCanvasOperation(createCommentOp('c1'));
      });

      test('THEN the badges are forgotten and the canvas is no longer watched', () => {
        expect(useBadgeStore.getState().earned).toBeNull();
        expect(addUserBadge).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN the platform mounted for an account without badges', () => {
    beforeEach(async () => {
      getUser.mockResolvedValue({ data: { user: { id: 'user-1', user_metadata: {} } } });
      addUserBadge.mockResolvedValue(undefined);
      await act(async () => {
        renderHook(() => useBadgeAwards());
      });
    });

    describe('WHEN a comment is posted on the canvas', () => {
      beforeEach(async () => {
        await act(async () => {
          emitCanvasOperation(createCommentOp('c1'));
        });
      });

      test('THEN Voice is earned, announced and saved', () => {
        expect(useBadgeStore.getState().earned).toEqual(['founder', 'voice']);
        expect(event.success).toHaveBeenCalledExactlyOnceWith(
          TRANSLATIONS.platform.settings.profile.badges.voiceUnlock,
          {
            title: translate('platform.settings.profile.badgeEarned', {
              name: TRANSLATIONS.platform.settings.profile.badges.badgeVoice,
            }),
          },
        );
        expect(addUserBadge).toHaveBeenCalledExactlyOnceWith('voice');
      });
    });
  });

  describe('GIVEN the account cannot be loaded', () => {
    beforeEach(() => {
      getUser.mockRejectedValue(new Error('auth down'));
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(async () => {
        await act(async () => {
          renderHook(() => useBadgeAwards());
        });
      });

      test('THEN the failure is logged without a toast and nothing is announced', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          toast: false,
          context: 'badges.load',
        });
        expect(useBadgeStore.getState().earned).toBeNull();
      });
    });
  });
});
