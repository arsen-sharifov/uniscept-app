import type { IOnboardingProgress, IOnboardingRow } from '@interfaces';

import { createClient } from '@/lib/supabase';
import { isGuideId } from '@/lib/utils';

import { getCurrentUserId } from './utils';

const SELECT_COLUMNS = 'offer_answered, completed_guides';

export const getOnboarding = async (): Promise<IOnboardingProgress | null> => {
  const supabase = createClient();
  const { data, error } = await supabase.from('user_onboarding').select(SELECT_COLUMNS).maybeSingle<IOnboardingRow>();

  if (error) throw error;
  if (!data) return null;

  return {
    offerAnswered: data.offer_answered,
    completedGuides: data.completed_guides.filter(isGuideId),
  };
};

export const upsertOnboarding = async (progress: IOnboardingProgress): Promise<void> => {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase.from('user_onboarding').upsert({
    user_id: userId,
    offer_answered: progress.offerAnswered,
    completed_guides: progress.completedGuides,
  });

  if (error) throw error;
};
