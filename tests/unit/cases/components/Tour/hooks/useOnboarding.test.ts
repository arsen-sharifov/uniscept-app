import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getCurrentUserId } from '@mocks/authApi';
import { event } from '@mocks/events';
import { ONBOARDING_USER_ID, SETTINGS_STEPS } from '@mocks/onboarding';
import { getOnboarding, upsertOnboarding } from '@mocks/onboardingApi';
import { addUserBadge } from '@mocks/userApi';
import { useOnboarding } from '@/components/Tour/hooks';
import { GUIDES, useOnboardingStore } from '@/lib/onboarding';

vi.mock('@api/client', async () => ({
  ...(await import('@mocks/authApi')),
  ...(await import('@mocks/onboardingApi')),
  ...(await import('@mocks/userApi')),
}));
vi.mock('@/lib/events', () => import('@mocks/events'));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  useOnboardingStore.getState().forget();
  vi.useRealTimers();
});

describe('useOnboarding', () => {
  describe('GIVEN an account that answered the offer earlier', () => {
    beforeEach(() => {
      getCurrentUserId.mockResolvedValue(ONBOARDING_USER_ID);
      getOnboarding.mockResolvedValue({ offerAnswered: true, completedGuides: ['base'] });
      upsertOnboarding.mockResolvedValue(undefined);
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(async () => {
        renderHook(() => useOnboarding());
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the stored progress is restored without being written back', () => {
        expect(useOnboardingStore.getState()).toMatchObject({
          userId: ONBOARDING_USER_ID,
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
        renderHook(() => useOnboarding());
        await act(() => vi.advanceTimersByTimeAsync(0));
        act(() => {
          useOnboardingStore.getState().startGuide('settings');
          Array.from({ length: SETTINGS_STEPS }).forEach(() => useOnboardingStore.getState().advance());
        });
        await act(() => vi.advanceTimersByTimeAsync(0));
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
      getCurrentUserId.mockResolvedValue(ONBOARDING_USER_ID);
      getOnboarding.mockResolvedValue(null);
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(async () => {
        renderHook(() => useOnboarding());
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the offer opens', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ offerAnswered: false, offerOpen: true });
      });
    });
  });

  describe('GIVEN progress that cannot be loaded', () => {
    beforeEach(() => {
      getCurrentUserId.mockResolvedValue(ONBOARDING_USER_ID);
      getOnboarding.mockRejectedValue(new Error('Onboarding unavailable'));
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(async () => {
        renderHook(() => useOnboarding());
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

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
        renderHook(() => useOnboarding());
        await act(() => vi.advanceTimersByTimeAsync(0));
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
      getCurrentUserId.mockResolvedValue(ONBOARDING_USER_ID);
      getOnboarding.mockResolvedValue(null);
    });

    describe('WHEN the next account reaches the platform', () => {
      beforeEach(async () => {
        renderHook(() => useOnboarding());
        await act(() => vi.advanceTimersByTimeAsync(0));
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
      getCurrentUserId.mockResolvedValue(ONBOARDING_USER_ID);
      getOnboarding.mockResolvedValue(null);
      upsertOnboarding.mockRejectedValue(new Error('Onboarding unavailable'));
    });

    describe('WHEN the offer is declined', () => {
      beforeEach(async () => {
        renderHook(() => useOnboarding());
        await act(() => vi.advanceTimersByTimeAsync(0));
        act(() => useOnboardingStore.getState().answerOffer());
        await act(() => vi.advanceTimersByTimeAsync(0));
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
      getCurrentUserId.mockResolvedValue(ONBOARDING_USER_ID);
      getOnboarding.mockResolvedValue({ offerAnswered: true, completedGuides: GUIDES.map((guide) => guide.id) });
      addUserBadge.mockResolvedValue(undefined);
    });

    describe('WHEN the platform mounts it', () => {
      beforeEach(async () => {
        renderHook(() => useOnboarding());
        await act(() => vi.advanceTimersByTimeAsync(0));
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the Initiate badge is awarded once', () => {
        expect(addUserBadge).toHaveBeenCalledExactlyOnceWith('initiate');
      });
    });
  });
});
