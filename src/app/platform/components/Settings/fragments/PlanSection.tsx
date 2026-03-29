'use client';

import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { User } from '@supabase/supabase-js';
import { useTranslations } from '@hooks';
import { PRICING_PLANS } from '@/lib/constants/pricing';

export interface IPlanSectionProps {
  user: User | null;
}

export const PlanSection = ({ user }: IPlanSectionProps) => {
  const t = useTranslations();
  const { plan: planLabels } = t.platform.settings;
  const currentPlanId = user?.user_metadata?.plan ?? 'beta';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {PRICING_PLANS.map((plan) => {
          const isCurrent =
            (currentPlanId === 'beta' && plan.id === 'demo') ||
            plan.id === currentPlanId;

          return (
            <div
              key={plan.id}
              className={clsx(
                'relative flex cursor-default flex-col rounded-xl border-2 p-4 transition-all',
                isCurrent
                  ? 'border-emerald-500 bg-gradient-to-b from-emerald-500/5 to-cyan-500/5'
                  : 'border-black/5 hover:border-black/10 hover:shadow-sm'
              )}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 left-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-2 py-0.5 text-xs font-medium text-white">
                  {planLabels.current}
                </span>
              )}

              <h3 className="text-base font-bold text-black">{plan.name}</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-black">
                  {plan.price === 'free' ? planLabels.free : `$${plan.price}`}
                </span>
                {plan.period && (
                  <span className="text-xs text-black/40">/{plan.period}</span>
                )}
              </div>
              {plan.description && (
                <p className="mt-0.5 text-xs text-black/40">
                  {plan.description}
                </p>
              )}

              <ul className="mt-3 flex-1 space-y-1.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-1.5 text-xs text-black/50"
                  >
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-black/[0.02] p-4">
        <p className="text-sm text-black/50">{planLabels.paidPlansNote}</p>
        <p className="mt-1 text-sm text-emerald-600">
          {planLabels.earlyBirdNote}
        </p>
      </div>
    </div>
  );
};
