export interface IconProps {
  className?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number | 'free';
  period?: string;
  description?: string;
  features: string[];
  href: string;
  highlighted?: boolean;
}
