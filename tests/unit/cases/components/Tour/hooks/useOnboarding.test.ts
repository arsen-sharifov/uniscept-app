import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getCurrentUserId } from '@mocks/authApi';
import { event } from '@mocks/events';
import { getOnboarding, upsertOnboarding } from '@mocks/onboardingApi';
import { addUserBadge } from '@mocks/userApi';
import { useOnboarding } from '@/components/Tour/hooks';
import { GUIDES, findGuide, useOnboardingStore } from '@/lib/onboarding';

vi.mock('@api/client', async () => ({
  ...(await import('@mocks/authApi')),
  ...(await import('@mocks/onboardingApi')),
  ...(await import('@mocks/userApi')),
}));
vi.mock('@/lib/events', () => import('@mocks/events'));

const USER_ID = 'user-1';

const SETTINGS_STEPS = findGuide('settings')?.steps.length ?? 0;

const mountHydrated = async () => {
  renderHook(() => useOnboarding());
  await vi.waitUntil(() => useOnboardingStore.getState().loaded);
};

afterEach(() => useOnboardingStore.getState().forget());

describe('useOnboarding', () => {
  describe('GIVEN an account that answered the offer earlier', () => {
    beforeEach(() => {
      getCurrentUserId.mockResolvedValue(USER_ID);
      getOnboarding.mockResolvedValue({ offerAnswered: true, completedGuides: ['base'] });
      upsertOnboarding.mockResolvedValue(undefined);
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(mountHydrated);

      test('THEN the stored progress is restored without being written back', () => {
        expect(useOnboardingStore.getState()).toMatchObject({
          userId: USER_ID,
          offerAnswered: true,
          offerOpen: false,
          completedGuides: ['base'],
        });
        expect(upsertOnboarding).not.toHaveBeenCalled();
        expect(addUserBadge).not.toHaveBeenCalled();
      });
    });

    describe('WHEN another guide is finished', () => {
      beforeEach(async () => {
        await mountHydrated();
        act(() => {
          useOnboardingStore.getState().startGuide('settings');
          Array.from({ length: SETTINGS_STEPS }).forEach(() => useOnboardingStore.getState().advance());
        });
        await vi.waitUntil(() => upsertOnboarding.mock.calls.length > 0);
      });

      test('THEN the new progress is saved once', () => {
        expect(upsertOnboarding).toHaveBeenCalledExactlyOnceWith({
          offerAnswered: true,
          completedGuides: ['base', 'settings'],
        });
      });
    });
  });

  describe('GIVEN an account with no stored progress', () => {
    beforeEach(() => {
      getCurrentUserId.mockResolvedValue(USER_ID);
      getOnboarding.mockResolvedValue(null);
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(mountHydrated);

      test('THEN the offer opens', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ offerAnswered: false, offerOpen: true });
      });
    });
  });

  describe('GIVEN progress that cannot be loaded', () => {
    beforeEach(() => {
      getCurrentUserId.mockResolvedValue(USER_ID);
      getOnboarding.mockRejectedValue(new Error('Onboarding unavailable'));
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(mountHydrated);

      test('THEN the offer stays closed and the failure is logged without a toast', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ offerAnswered: true, offerOpen: false });
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          toast: false,
          context: 'onboarding.load',
        });
      });
    });

    describe('WHEN a guide is finished in that session anyway', () => {
      beforeEach(async () => {
        await mountHydrated();
        act(() => {
          useOnboardingStore.getState().startGuide('settings');
          Array.from({ length: SETTINGS_STEPS }).forEach(() => useOnboardingStore.getState().advance());
        });
      });

      test('THEN nothing is written over the progress that could not be read', () => {
        expect(useOnboardingStore.getState().completedGuides).toEqual(['settings']);
        expect(upsertOnboarding).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN the store still holds a previous account that finished every guide', () => {
    beforeEach(() => {
      useOnboardingStore.setState({
        loaded: true,
        userId: 'user-0',
        offerAnswered: true,
        completedGuides: GUIDES.map((guide) => guide.id),
      });
      getCurrentUserId.mockResolvedValue(USER_ID);
      getOnboarding.mockResolvedValue(null);
    });

    describe('WHEN the next account reaches the platform', () => {
      beforeEach(async () => {
        renderHook(() => useOnboarding());
        await vi.waitUntil(() => useOnboardingStore.getState().userId === USER_ID);
      });

      test('THEN the previous progress neither earns the new account a badge nor gets saved for it', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ completedGuides: [], offerOpen: true });
        expect(addUserBadge).not.toHaveBeenCalled();
        expect(upsertOnboarding).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN progress that cannot be saved', () => {
    beforeEach(() => {
      getCurrentUserId.mockResolvedValue(USER_ID);
      getOnboarding.mockResolvedValue(null);
      upsertOnboarding.mockRejectedValue(new Error('Onboarding unavailable'));
    });

    describe('WHEN the offer is declined', () => {
      beforeEach(async () => {
        await mountHydrated();
        act(() => useOnboardingStore.getState().answerOffer());
        await vi.waitUntil(() => vi.mocked(event.error).mock.calls.length > 0);
      });

      test('THEN the failure is logged without a toast', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          toast: false,
          context: 'onboarding.save',
        });
      });
    });
  });

  describe('GIVEN an account that finished every guide', () => {
    beforeEach(() => {
      getCurrentUserId.mockResolvedValue(USER_ID);
      getOnboarding.mockResolvedValue({ offerAnswered: true, completedGuides: GUIDES.map((guide) => guide.id) });
      addUserBadge.mockResolvedValue(undefined);
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(async () => {
        await mountHydrated();
        await vi.waitUntil(() => addUserBadge.mock.calls.length > 0);
      });

      test('THEN the Initiate badge is awarded once', () => {
        expect(addUserBadge).toHaveBeenCalledExactlyOnceWith('initiate');
      });
    });
  });
});
