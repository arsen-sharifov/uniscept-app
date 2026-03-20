import type { IPricingPlan } from '../interfaces';

export const PRICING_PLANS: IPricingPlan[] = [
  {
    id: 'demo',
    name: 'Demo',
    price: 'free',
    description: 'Session-based',
    features: [
      'Try the canvas',
      'No account needed',
      'Explore features',
      'Session storage',
    ],
    href: '/platform',
    disabled: true,
  },
  {
    id: 'lite',
    name: 'Lite',
    price: 2,
    period: 'month',
    features: [
      'Unlimited canvases',
      'Single user',
      'Cloud storage',
      'Export options',
    ],
    href: '/signup',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 5,
    period: 'month',
    features: [
      'Everything in Lite',
      'Up to 5 members',
      'Team collaboration',
      'Real-time sync',
    ],
    href: '/signup',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    period: 'month',
    features: [
      'Everything in Standard',
      'Unlimited members',
      'Advanced permissions',
      'Priority support',
      'API access',
    ],
    href: '/signup',
  },
];
