import { Section } from '@/components/ui';
import { useTranslations } from '@/lib/hooks';
import { BoltIcon, CodeBracketIcon, LightbulbIcon } from '@/components/icons';

export const BuildersSection = () => {
  const t = useTranslations();

  return (
    <Section>
      <div className="absolute top-1/2 left-[10%] h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div data-reveal className="scroll-reveal mb-20 text-center">
          <h2 className="mb-6 text-5xl font-black tracking-tight text-black sm:text-6xl">
            {t.landing.builders.title}
          </h2>
          <p className="text-xl text-black/60">{t.landing.builders.subtitle}</p>
        </div>

        <div data-reveal className="scroll-reveal grid gap-6 md:grid-cols-3">
          <div className="card-3d group relative overflow-hidden rounded-2xl bg-gradient-to-br from-black to-gray-900 p-9 shadow-2xl transition-all duration-300 ease-in-out hover:scale-[1.02]">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-4">
                <BoltIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-black text-white">
                {t.landing.builders.founders.title}
              </h3>
              <p className="mb-6 text-base leading-relaxed text-white/90">
                {t.landing.builders.founders.description}
              </p>
              <div className="space-y-2.5">
                {t.landing.builders.founders.useCases.map((useCase: string) => (
                  <div
                    key={useCase}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-sm font-medium">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-white to-purple-50/50 p-9 shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 inline-flex rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-4">
                <LightbulbIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-black text-black">
                {t.landing.builders.researchers.title}
              </h3>
              <p className="mb-6 text-base leading-relaxed text-black/70">
                {t.landing.builders.researchers.description}
              </p>
              <div className="space-y-2.5">
                {t.landing.builders.researchers.useCases.map(
                  (useCase: string) => (
                    <div
                      key={useCase}
                      className="flex items-center gap-3 text-black/60"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <span className="text-sm font-medium">{useCase}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-white to-blue-50/50 p-9 shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 inline-flex rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4">
                <CodeBracketIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-black text-black">
                {t.landing.builders.engineers.title}
              </h3>
              <p className="mb-6 text-base leading-relaxed text-black/70">
                {t.landing.builders.engineers.description}
              </p>
              <div className="space-y-2.5">
                {t.landing.builders.engineers.useCases.map(
                  (useCase: string) => (
                    <div
                      key={useCase}
                      className="flex items-center gap-3 text-black/60"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">{useCase}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
