export interface IPricingPlan {
  id: string;
  name: string;
  price: number | 'free';
  period?: string;
  description?: string;
  features: string[];
  href: string;
  highlighted?: boolean;
}
