export type TPricingPlanId = 'demo' | 'lite' | 'standard' | 'pro';

export type TPricingPlanPeriod = 'month' | 'year';

export interface IPricingPlanMeta {
  id: TPricingPlanId;
  price: number | 'free';
  period?: TPricingPlanPeriod;
  href: string;
  highlighted?: boolean;
  disabled?: boolean;
}

export interface IPricingPlan extends IPricingPlanMeta {
  name: string;
  description?: string;
  features: string[];
}
