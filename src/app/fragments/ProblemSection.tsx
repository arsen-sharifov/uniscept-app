import clsx from 'clsx';
import { Section } from '@/components/ui';
import { PROBLEM_CARDS } from '@/lib/constants/content';
import { useTranslations } from '@/lib/hooks';

export const ProblemSection = () => {
  const t = useTranslations();
  const [chaos, mindmaps, docs, cost] = PROBLEM_CARDS;

  return (
    <Section id="problem">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="scroll-reveal mb-20 text-center">
          <h2 className="mb-6 text-5xl font-black tracking-tight text-black sm:text-6xl">
            {t.landing.problem.title}
          </h2>
          <p className="text-xl text-black/60">{t.landing.problem.subtitle}</p>
        </div>

        <div
          data-reveal
          className="scroll-reveal grid gap-5 md:grid-cols-6 md:grid-rows-3"
        >
          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-white to-gray-50/50 p-8 shadow-xl transition-all duration-300 ease-in-out hover:border-emerald-500/30 hover:shadow-2xl md:col-span-4 md:row-span-2">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-3xl transition-all duration-500 ease-in-out group-hover:scale-150" />
            <div className="relative">
              <div className="mb-5 text-5xl">{chaos.emoji}</div>
              <h3 className="mb-3 text-3xl font-black text-black">
                {chaos.title}
              </h3>
              <p className="max-w-xl text-lg leading-relaxed text-black/60">
                {chaos.description}
              </p>
              <div className="mt-6 flex gap-2">
                {chaos.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={clsx(
                      'rounded-full px-3 py-1.5 text-xs font-semibold',
                      tag.color === 'red' && 'bg-red-100 text-red-700',
                      tag.color === 'orange' && 'bg-orange-100 text-orange-700',
                      tag.color === 'yellow' && 'bg-yellow-100 text-yellow-700'
                    )}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-white to-purple-50/30 p-7 shadow-xl transition-all duration-300 ease-in-out hover:border-purple-500/30 hover:shadow-2xl md:col-span-2 md:row-span-2">
            <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl transition-all duration-500 ease-in-out group-hover:scale-150" />
            <div className="relative">
              <div className="mb-5 text-4xl">{mindmaps.emoji}</div>
              <h3 className="mb-3 text-2xl font-black text-black">
                {mindmaps.title}
              </h3>
              <p className="text-base leading-relaxed text-black/60">
                {mindmaps.description}
              </p>
              {mindmaps.tags.length > 0 && (
                <div className="mt-5">
                  <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700">
                    {mindmaps.tags[0]!.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-white to-blue-50/30 p-7 shadow-xl transition-all duration-300 ease-in-out hover:border-blue-500/30 hover:shadow-2xl md:col-span-3">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl transition-all duration-500 ease-in-out group-hover:scale-150" />
            <div className="relative">
              <div className="mb-3 text-3xl">{docs.emoji}</div>
              <h3 className="mb-2 text-xl font-black text-black">
                {docs.title}
              </h3>
              <p className="text-sm leading-relaxed text-black/60">
                {docs.description}
              </p>
            </div>
          </div>

          <div className="card-3d group relative overflow-hidden rounded-2xl bg-gradient-to-br from-black to-gray-900 p-7 shadow-2xl transition-all duration-300 ease-in-out hover:scale-[1.02] md:col-span-3">
            <div className="absolute top-0 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-2xl" />
            <div className="relative">
              <div className="mb-3 text-3xl">{cost.emoji}</div>
              <h3 className="mb-2 text-xl font-black text-white">
                {cost.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/90">
                {cost.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
