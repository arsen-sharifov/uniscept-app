'use client';

import type { User } from '@supabase/supabase-js';
import { clsx } from 'clsx';
import { Check, Lock, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { useTranslations } from '@hooks';
import { formatPlanPrice, mergePlansWithTranslations } from '@/lib/pricing';

import { AVAILABLE_PLAN_IDS } from '../consts';

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
    <div className="space-y-8">
      <section>
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {planLabels.title}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {planLabels.caption}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">{planLabels.blurb}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = (currentPlanId === 'beta' && plan.id === 'demo') || plan.id === currentPlanId;
            const isLocked = !AVAILABLE_PLAN_IDS.includes(plan.id);
            const periodLabel = plan.period ? periods[plan.period] : null;

            return (
              <article
                key={plan.id}
                data-locked={isLocked || undefined}
                className={clsx(
                  'group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-[border-color,transform,box-shadow] duration-300 ease-out',
                  isCurrent && 'border-[color:var(--border-active)] shadow-[0_18px_38px_-22px_var(--accent-glow)]',
                  isLocked && !isCurrent && 'cursor-not-allowed border-[color:var(--border)] opacity-65',
                  !isLocked &&
                    !isCurrent &&
                    'border-[color:var(--border)] hover:-translate-y-0.5 hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]',
                )}
              >
                {isCurrent && (
                  <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] px-2 py-0.5 text-[9.5px] font-semibold tracking-[0.14em] text-[color:var(--on-accent)] uppercase shadow-[0_4px_12px_-6px_var(--accent-glow)]">
                    <Sparkles className="h-2.5 w-2.5" strokeWidth={2.4} />
                    {planLabels.current}
                  </span>
                )}
                {isLocked && !isCurrent && (
                  <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-[color:var(--surface-elevated)] px-2 py-0.5 text-[9.5px] font-semibold tracking-[0.14em] text-[color:var(--text-subtle)] uppercase shadow-[inset_0_0_0_1px_var(--border-strong)]">
                    <Lock className="h-2.5 w-2.5" strokeWidth={2.4} />
                    {planLabels.lockedBadge}
                  </span>
                )}

                <div
                  aria-hidden
                  className="relative flex h-16 w-full items-center bg-[color:var(--surface-overlay)] px-4"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-55"
                    style={{
                      background: isCurrent
                        ? 'radial-gradient(140% 90% at 50% 0%, color-mix(in srgb, var(--accent-soft) 60%, transparent) 0%, transparent 70%)'
                        : 'radial-gradient(140% 90% at 50% 0%, color-mix(in srgb, var(--surface-overlay) 60%, transparent) 0%, transparent 70%)',
                    }}
                  />
                  <span className="relative flex items-baseline gap-1">
                    <span
                      className={clsx(
                        'font-serif text-[24px] leading-none tracking-tight italic',
                        isLocked && !isCurrent ? 'text-[color:var(--text-muted)]' : 'text-[color:var(--text-strong)]',
                      )}
                    >
                      {formatPlanPrice(plan.price, planLabels.free)}
                    </span>
                    {periodLabel && (
                      <span className="text-[10.5px] tracking-[0.14em] text-[color:var(--text-muted)] uppercase">
                        /{periodLabel}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 bg-[color:var(--surface-elevated)] px-3.5 pt-2.5 pb-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={clsx(
                        'truncate font-serif text-[16px] leading-none tracking-tight italic',
                        isLocked && !isCurrent ? 'text-[color:var(--text-muted)]' : 'text-[color:var(--text-strong)]',
                      )}
                    >
                      {plan.name}
                    </span>
                    <span className="text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--text-subtle)] uppercase">
                      {plan.id}
                    </span>
                  </div>

                  {plan.description && (
                    <p className="text-[11.5px] leading-snug text-[color:var(--text-muted)]">{plan.description}</p>
                  )}

                  <ul className="mt-1 flex-1 space-y-1.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={clsx(
                          'flex items-start gap-1.5 text-[11.5px] leading-snug',
                          isLocked && !isCurrent ? 'text-[color:var(--text-subtle)]' : 'text-[color:var(--text-muted)]',
                        )}
                      >
                        <Check
                          className={clsx(
                            'mt-0.5 h-3 w-3 shrink-0',
                            isLocked && !isCurrent ? 'text-[color:var(--text-faint)]' : 'text-[color:var(--accent)]',
                          )}
                          strokeWidth={2.4}
                          aria-hidden
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <span
                  aria-hidden
                  className={clsx(
                    'pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300',
                    isCurrent
                      ? 'bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent opacity-90'
                      : 'opacity-0',
                  )}
                />
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-6">
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {planLabels.billingTitle}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {planLabels.billingCaption}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {planLabels.paidPlansNote}
        </p>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-3">
          <p className="text-[12.5px] leading-snug text-[color:var(--accent-strong)]">
            <Sparkles className="mr-1 inline h-3 w-3" strokeWidth={2.4} aria-hidden />
            {planLabels.earlyBirdNote}
          </p>
        </div>
      </section>
    </div>
  );
};
