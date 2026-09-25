import type { TGuideId } from '@interfaces';

export interface IMockOnboardingState {
  offerOpen?: boolean;
  pickerOpen?: boolean;
  celebrating?: boolean;
  completedGuides?: TGuideId[];
}
