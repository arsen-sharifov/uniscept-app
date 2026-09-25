import { describe, expect, test, vi } from 'vitest';

import { getOnboarding, upsertOnboarding } from '@api/client';
import { primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

describe('getOnboarding', () => {
  describe('GIVEN a stored row with a stale guide id', () => {
    describe('WHEN onboarding is fetched', () => {
      test('THEN unknown guides are dropped', async () => {
        primeSupabase([{ data: { offer_answered: true, completed_guides: ['base', 'retired', 'canvas'] } }]);

        await expect(getOnboarding()).resolves.toEqual({
          offerAnswered: true,
          completedGuides: ['base', 'canvas'],
        });
      });
    });
  });

  describe('GIVEN no stored row', () => {
    describe('WHEN onboarding is fetched', () => {
      test('THEN nothing is returned', async () => {
        primeSupabase([{ data: null }]);

        await expect(getOnboarding()).resolves.toBeNull();
      });
    });
  });

  describe('GIVEN a failing query', () => {
    describe('WHEN onboarding is fetched', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(getOnboarding()).rejects.toThrow('db down');
      });
    });
  });
});

describe('upsertOnboarding', () => {
  describe('GIVEN a signed-in user', () => {
    describe('WHEN progress is saved', () => {
      test('THEN the payload maps to columns with the user id', async () => {
        const { queries } = primeSupabase([{ data: null }]);

        await upsertOnboarding({ offerAnswered: true, completedGuides: ['base'] });

        expect(queries[0]!.upsert).toHaveBeenCalledExactlyOnceWith({
          user_id: 'user-1',
          offer_answered: true,
          completed_guides: ['base'],
        });
      });
    });
  });

  describe('GIVEN a failing upsert', () => {
    describe('WHEN progress is saved', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('write blocked') }]);

        await expect(upsertOnboarding({ offerAnswered: true, completedGuides: [] })).rejects.toThrow('write blocked');
      });
    });
  });

  describe('GIVEN no signed-in user', () => {
    describe('WHEN progress is saved', () => {
      test('THEN it fails rather than writing for nobody', async () => {
        const { queries } = primeSupabase([{ data: null }], { user: null });

        await expect(upsertOnboarding({ offerAnswered: true, completedGuides: [] })).rejects.toThrow(
          'Authenticated user required',
        );
        expect(queries[0]?.upsert).not.toHaveBeenCalled();
      });
    });
  });
});
