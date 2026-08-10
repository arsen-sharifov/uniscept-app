import { describe, expect, test } from 'vitest';

import { formatPlanPrice, mergePlansWithTranslations } from '@/lib/pricing';
import en from '@/locales/en.json';

describe('mergePlansWithTranslations', () => {
  describe('GIVEN the English dictionary', () => {
    describe('WHEN the plans are merged', () => {
      test('THEN all four plans carry their pricing and translated content', () => {
        expect(mergePlansWithTranslations(en)).toEqual([
          expect.objectContaining({ id: 'demo', price: 'free', name: expect.any(String), features: expect.any(Array) }),
          expect.objectContaining({ id: 'lite', price: 2, name: expect.any(String), features: expect.any(Array) }),
          expect.objectContaining({ id: 'standard', price: 5, highlighted: true, name: expect.any(String) }),
          expect.objectContaining({ id: 'pro', price: 20, name: expect.any(String), features: expect.any(Array) }),
        ]);
      });

      test('THEN every plan lists at least one feature', () => {
        expect(mergePlansWithTranslations(en).every((plan) => plan.features.length > 0)).toBe(true);
      });

      test('THEN only the demo plan carries a description', () => {
        const plans = mergePlansWithTranslations(en);

        expect(plans.find((plan) => plan.id === 'demo')?.description).toBe(en.landing.pricing.plans.demo.description);
        expect(plans.filter((plan) => plan.id !== 'demo').every((plan) => plan.description === undefined)).toBe(true);
      });

      test('THEN only the standard plan is highlighted', () => {
        const plans = mergePlansWithTranslations(en);

        expect(plans.find((plan) => plan.id === 'standard')?.highlighted).toBe(true);
        expect(plans.filter((plan) => plan.id !== 'standard').every((plan) => !plan.highlighted)).toBe(true);
      });
    });
  });
});

describe('formatPlanPrice', () => {
  describe('GIVEN the free price', () => {
    describe('WHEN it is formatted', () => {
      test('THEN the localized free label is used', () => {
        expect(formatPlanPrice('free', 'Free')).toBe('Free');
      });
    });
  });

  describe('GIVEN a numeric price', () => {
    describe('WHEN it is formatted', () => {
      test('THEN it renders as dollars', () => {
        expect(formatPlanPrice(5, 'Free')).toBe('$5');
      });
    });
  });
});
