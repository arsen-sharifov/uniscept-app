'use client';

import type { User } from '@supabase/supabase-js';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { useMemo } from 'react';

import { useTranslations } from '@hooks';
import { formatPlanPrice, mergePlansWithTranslations } from '@/lib/pricing';

export interface IPlanSectionProps {
  user: User | null;
}

export const PlanSection = ({ user }: IPlanSectionProps) => {
  const t = useTranslations();
  const plans = useMemo(() => mergePlansWithTranslations(t), [t]);
  const planLabels = t.platform.settings.plan;
  const periods = t.landing.pricing.periods;
  const currentPlanId = user?.user_metadata?.plan ?? 'beta';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {plans.map((plan) => {
          const isCurrent = (currentPlanId === 'beta' && plan.id === 'demo') || plan.id === currentPlanId;
          const periodLabel = plan.period ? periods[plan.period] : null;

          return (
            <div
              key={plan.id}
              className={clsx(
                'relative flex cursor-default flex-col rounded-xl border-2 p-4 transition-all',
                isCurrent
                  ? 'border-[color:var(--border-active)] bg-[color:var(--accent-soft)]'
                  : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-sm',
              )}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 left-3 rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] px-2 py-0.5 text-xs font-medium text-[color:var(--on-accent)]">
                  {planLabels.current}
                </span>
              )}

              <h3 className="text-base font-bold text-[color:var(--text-strong)]">{plan.name}</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-[color:var(--text-strong)]">
                  {formatPlanPrice(plan.price, planLabels.free)}
                </span>
                {periodLabel && <span className="text-xs text-[color:var(--text-muted)]">/{periodLabel}</span>}
              </div>
              {plan.description && <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">{plan.description}</p>}

              <ul className="mt-3 flex-1 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-xs text-[color:var(--text-muted)]">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--accent)]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-[color:var(--surface-overlay)] p-4">
        <p className="text-sm text-[color:var(--text-muted)]">{planLabels.paidPlansNote}</p>
        <p className="mt-1 text-sm text-[color:var(--accent-strong)]">{planLabels.earlyBirdNote}</p>
      </div>
    </div>
  );
};
