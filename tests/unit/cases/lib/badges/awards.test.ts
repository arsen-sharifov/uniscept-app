import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { event } from '@mocks/events';
import { addUserBadge } from '@mocks/userApi';
import { awardBadge, hydrateBadges, useBadgeStore } from '@/lib/badges';

vi.mock('@api/client', () => import('@mocks/userApi'));
vi.mock('@/lib/events', () => import('@mocks/events'));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  useBadgeStore.getState().forget();
  vi.useRealTimers();
});

describe('awards', () => {
  describe('GIVEN stored badges with an unknown id', () => {
    describe('WHEN they are hydrated', () => {
      beforeEach(() => {
        hydrateBadges(['voice', 'retired']);
      });

      test('THEN only the known badges are kept', () => {
        expect(useBadgeStore.getState().earned).toEqual(['voice']);
      });
    });
  });

  describe('GIVEN an account without stored badges', () => {
    describe('WHEN it is hydrated', () => {
      beforeEach(() => {
        hydrateBadges(undefined);
      });

      test('THEN it starts with the default badge', () => {
        expect(useBadgeStore.getState().earned).toEqual(['founder']);
      });
    });
  });

  describe('GIVEN hydrated badges', () => {
    beforeEach(() => {
      addUserBadge.mockResolvedValue(undefined);
      hydrateBadges(['founder']);
    });

    describe('WHEN a new badge is awarded', () => {
      beforeEach(async () => {
        awardBadge('voice');
        await vi.advanceTimersByTimeAsync(0);
      });

      test('THEN it is earned, announced and saved', () => {
        expect(useBadgeStore.getState()).toMatchObject({
          earned: ['founder', 'voice'],
          lastAward: { id: 'voice', announce: true },
        });
        expect(addUserBadge).toHaveBeenCalledExactlyOnceWith('voice');
      });
    });

    describe('WHEN a badge is awarded quietly', () => {
      beforeEach(() => {
        awardBadge('initiate', { quiet: true });
      });

      test('THEN it is earned without an announcement', () => {
        expect(useBadgeStore.getState().lastAward).toEqual({ id: 'initiate', announce: false });
      });
    });

    describe('WHEN an earned badge is awarded again', () => {
      beforeEach(() => {
        awardBadge('founder');
      });

      test('THEN nothing changes or gets saved', () => {
        expect(useBadgeStore.getState()).toMatchObject({ earned: ['founder'], lastAward: null });
        expect(addUserBadge).not.toHaveBeenCalled();
      });
    });

    describe('WHEN two badges are awarded while the first save is still running', () => {
      let releaseFirstSave: () => void;

      beforeEach(async () => {
        const firstSave = Promise.withResolvers<undefined>();
        releaseFirstSave = () => firstSave.resolve(undefined);
        addUserBadge.mockReturnValueOnce(firstSave.promise);
        awardBadge('voice');
        awardBadge('critic');
        await vi.advanceTimersByTimeAsync(0);
      });

      afterEach(async () => {
        releaseFirstSave();
        await vi.advanceTimersByTimeAsync(0);
      });

      test('THEN only the first save has started', () => {
        expect(addUserBadge.mock.calls).toEqual([['voice']]);
      });
    });

    describe('WHEN two badges are awarded and the first save then finishes', () => {
      beforeEach(async () => {
        const firstSave = Promise.withResolvers<undefined>();
        addUserBadge.mockReturnValueOnce(firstSave.promise);
        awardBadge('voice');
        awardBadge('critic');
        await vi.advanceTimersByTimeAsync(0);
        firstSave.resolve(undefined);
        await vi.advanceTimersByTimeAsync(0);
      });

      test('THEN the second save follows it', () => {
        expect(addUserBadge.mock.calls).toEqual([['voice'], ['critic']]);
      });
    });

    describe('WHEN a save fails', () => {
      const saveError = new Error('metadata locked');

      beforeEach(async () => {
        addUserBadge.mockRejectedValueOnce(saveError);
        awardBadge('voice');
        awardBadge('critic');
        await vi.advanceTimersByTimeAsync(0);
      });

      test('THEN the failure is logged without a toast and later saves still run', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(saveError, { toast: false, context: 'badges.award' });
        expect(addUserBadge.mock.calls).toEqual([['voice'], ['critic']]);
      });
    });
  });

  describe('GIVEN badges that are not hydrated yet', () => {
    beforeEach(() => {
      addUserBadge.mockResolvedValue(undefined);
    });

    describe('WHEN a badge is awarded', () => {
      beforeEach(async () => {
        awardBadge('collaborator');
        await vi.advanceTimersByTimeAsync(0);
      });

      test('THEN it is saved without being announced', () => {
        expect(addUserBadge).toHaveBeenCalledExactlyOnceWith('collaborator');
        expect(useBadgeStore.getState()).toMatchObject({ earned: null, lastAward: null });
      });
    });
  });
});
