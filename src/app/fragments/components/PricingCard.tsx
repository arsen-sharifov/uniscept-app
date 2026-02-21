import Link from 'next/link';
import clsx from 'clsx';
import type { PricingPlan } from '@/lib/interfaces';
import { useTranslations } from '@/lib/hooks';
import { CircleCheck } from 'lucide-react';

interface PricingCardProps {
  plan: PricingPlan;
}

export const PricingCard = ({ plan }: PricingCardProps) => {
  const t = useTranslations();
  const isDark = plan.highlighted;
  const isDemo = plan.id === 'demo';

  return (
    <div
      className={clsx(
        'relative flex flex-col overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300 ease-in-out hover:scale-[1.02]',
        isDark
          ? 'border-emerald-500/30 bg-gradient-to-br from-black via-gray-900 to-black shadow-2xl hover:border-emerald-500/50'
          : 'group border-black/10 bg-white shadow-lg hover:border-black/20 hover:shadow-xl'
      )}
    >
      {isDark && (
        <>
          <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-black tracking-wider text-white uppercase shadow-lg">
            Popular
          </div>
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
        </>
      )}

      <div className={clsx('mb-8', isDark && 'relative')}>
        <h3
          className={clsx(
            'mb-2 text-xl font-bold',
            isDark ? 'text-white' : 'text-black'
          )}
        >
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span
            className={clsx(
              'text-5xl font-black',
              isDark ? 'text-white' : 'text-black'
            )}
          >
            {plan.price === 'free' ? 'Free' : `$${plan.price}`}
          </span>
          {plan.period && (
            <span
              className={clsx(
                'text-lg',
                isDark ? 'text-white/60' : 'text-black/60'
              )}
            >
              /{plan.period}
            </span>
          )}
        </div>
        {plan.description && (
          <p
            className={clsx(
              'mt-2 text-sm',
              isDark ? 'text-white/60' : 'text-black/60'
            )}
          >
            {plan.description}
          </p>
        )}
      </div>

      <ul className={clsx('mb-8 flex-1 space-y-3', isDark && 'relative')}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
              <CircleCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
            </span>
            <span
              className={clsx(
                'text-sm',
                isDark ? 'text-white/90' : 'text-black/70'
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={clsx(
          'block w-full rounded-lg py-3.5 text-center text-sm font-bold transition-all duration-300 ease-in-out hover:scale-105',
          isDark
            ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 text-white shadow-xl hover:from-emerald-500 hover:to-cyan-400 hover:shadow-2xl'
            : isDemo
              ? 'border-2 border-black/20 bg-white text-black hover:border-black/40 hover:bg-black/5'
              : 'border-2 border-black bg-black text-white hover:bg-black/90'
        )}
      >
        {isDemo ? t.landing.pricing.tryDemo : t.landing.pricing.getStarted}
      </Link>
    </div>
  );
};
