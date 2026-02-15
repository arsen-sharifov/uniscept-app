import type { PricingPlan } from '../interfaces';

export const PRICING_PLANS: PricingPlan[] = [
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
    href: '/get-started?plan=demo',
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
    href: '/get-started?plan=lite',
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
    href: '/get-started?plan=standard',
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
    href: '/get-started?plan=pro',
  },
];
