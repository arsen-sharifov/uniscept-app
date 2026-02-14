import { Section } from '@/components/ui';
import { useTranslations } from '@/lib/hooks';
import {
  CheckCircleIcon,
  LinkIcon,
  MapIcon,
  UsersIcon,
} from '@/components/icons';

export const ProductSection = () => {
  const t = useTranslations();

  return (
    <Section id="product">
      <div className="absolute top-1/3 right-[10%] h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div data-reveal className="scroll-reveal mb-20 max-w-3xl">
          <h2 className="mb-8 text-6xl leading-[1.1] font-black tracking-tight text-black">
            {t.landing.product.title}
          </h2>
          <p className="text-2xl leading-relaxed text-black/60">
            {t.landing.product.subtitle1}
          </p>
          <p className="mt-4 text-2xl leading-relaxed font-bold text-black">
            {t.landing.product.subtitle2}
          </p>
        </div>

        <div data-reveal className="scroll-reveal grid gap-5 md:grid-cols-3">
          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-8 shadow-xl transition-all duration-300 ease-in-out hover:border-emerald-500/20 hover:shadow-2xl md:col-span-2">
            <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-3">
              <MapIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-3 text-2xl font-black text-black">
              {t.landing.product.features.structured.title}
            </h3>
            <p className="mb-5 text-base leading-relaxed text-black/60">
              {t.landing.product.features.structured.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {t.landing.product.features.structured.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-white to-emerald-50/30 p-7 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-2xl transition-all duration-500 ease-in-out group-hover:scale-150" />
            <div className="relative">
              <div className="mb-5 inline-flex rounded-xl bg-emerald-500/10 p-2.5">
                <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-xl font-black text-black">
                {t.landing.product.features.validation.title}
              </h3>
              <p className="text-sm leading-relaxed text-black/60">
                {t.landing.product.features.validation.description}
              </p>
            </div>
          </div>

          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-white to-purple-50/30 p-7 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl">
            <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl transition-all duration-500 ease-in-out group-hover:scale-150" />
            <div className="relative">
              <div className="mb-5 inline-flex rounded-xl bg-purple-500/10 p-2.5">
                <LinkIcon className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-black text-black">
                {t.landing.product.features.references.title}
              </h3>
              <p className="text-sm leading-relaxed text-black/60">
                {t.landing.product.features.references.description}
              </p>
            </div>
          </div>

          <div className="card-3d group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-white to-blue-50/30 p-7 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl md:col-span-2">
            <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-2xl transition-all duration-500 ease-in-out group-hover:scale-150" />
            <div className="relative">
              <div className="mb-5 inline-flex rounded-xl bg-blue-500/10 p-2.5">
                <UsersIcon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-black text-black">
                {t.landing.product.features.collaboration.title}
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-black/60">
                {t.landing.product.features.collaboration.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
