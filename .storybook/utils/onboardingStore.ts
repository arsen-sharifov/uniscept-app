import type { IMockOnboardingState } from '@story-interfaces';
import { useOnboardingStore } from '@/lib/onboarding';

export const mockOnboardingStore = (overrides: IMockOnboardingState = {}): void => {
  useOnboardingStore.setState({ loaded: true, offerAnswered: true, ...overrides });
};

export const resetOnboardingStore = (): void => {
  useOnboardingStore.getState().forget();
};
