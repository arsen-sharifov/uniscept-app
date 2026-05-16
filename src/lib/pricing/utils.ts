import type { IPricingPlan, TTranslations } from '@interfaces';
import { PRICING_PLANS } from './constants';

export const mergePlansWithTranslations = (t: TTranslations): readonly IPricingPlan[] => {
  const plansContent = t.landing.pricing.plans;

  return PRICING_PLANS.map((plan) => {
    const content = plansContent[plan.id];

    return {
      ...plan,
      name: content.name,
      description: 'description' in content ? content.description : undefined,
      features: content.features,
    };
  });
};

export const formatPlanPrice = (price: IPricingPlan['price'], freeLabel: string): string =>
  price === 'free' ? freeLabel : `$${price}`;
