'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import type { IHowItWorksStep } from '@interfaces';

import { useTranslations } from '@/i18n';

import { CanvasVignette, MiniNode, Section, SectionHeading, TiltPanel } from './components';
import {
  ARGUE_VIGNETTE_EDGES,
  DECIDE_VIGNETTE_EDGES,
  DECIDE_VIGNETTE_TONES,
  HOW_IT_WORKS_STEP_DELAY_MS,
  LANDING_SURFACE_CLASSES,
} from './consts';

export const HowItWorksSection = () => {
  const t = useTranslations();

  const steps: IHowItWorksStep[] = [
    {
      id: 'ask',
      vignette: (
        <CanvasVignette className="h-48">
          <MiniNode
            tone="question"
            label={t.landing.howItWorks.vignettes.question}
            className="absolute top-1/2 left-1/2 w-44 -translate-x-1/2 -translate-y-1/2"
          />
        </CanvasVignette>
      ),
    },
    {
      id: 'argue',
      vignette: (
        <CanvasVignette edges={ARGUE_VIGNETTE_EDGES} className="h-48">
          <MiniNode
            nodeId="hv2-q"
            tone="question"
            label={t.landing.howItWorks.vignettes.question}
            className="absolute top-3 left-1/2 w-44 -translate-x-1/2"
          />
          <MiniNode
            nodeId="hv2-a"
            tone="open"
            label={t.landing.howItWorks.vignettes.pro}
            className="absolute bottom-3 left-2 w-[8.25rem] md:w-[9rem]"
          />
          <MiniNode
            nodeId="hv2-b"
            tone="open"
            label={t.landing.howItWorks.vignettes.con}
            className="absolute right-2 bottom-3 w-[8.25rem] md:w-[9rem]"
          />
        </CanvasVignette>
      ),
    },
    {
      id: 'decide',
      vignette: (
        <CanvasVignette edges={DECIDE_VIGNETTE_EDGES} tones={DECIDE_VIGNETTE_TONES} className="h-48">
          <MiniNode
            nodeId="hv3-a"
            tone="valid"
            label={t.landing.howItWorks.vignettes.pro}
            className="absolute top-2 left-2 w-[8.25rem] md:w-[9rem]"
          />
          <MiniNode
            nodeId="hv3-b"
            tone="refuted"
            label={t.landing.howItWorks.vignettes.con}
            className="absolute top-2 right-2 w-[8.25rem] md:w-[9rem]"
          />
          <MiniNode
            nodeId="hv3-c"
            tone="answer"
            label={t.landing.howItWorks.vignettes.answer}
            className="absolute bottom-2 left-1/2 w-44 -translate-x-1/2"
          />
        </CanvasVignette>
      ),
    },
  ];

  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <SectionHeading title={t.landing.howItWorks.title} subtitle={t.landing.howItWorks.subtitle} />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <TiltPanel key={step.id}>
              <article
                style={{ '--act-delay': `${index * HOW_IT_WORKS_STEP_DELAY_MS}ms` } as CSSProperties}
                className={clsx(LANDING_SURFACE_CLASSES.panel, 'how-panel h-full p-6')}
              >
                <span className="step-numeral font-mono-ui text-[2.5rem] leading-none font-bold text-[color:var(--hero-numeral)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="mt-4">{step.vignette}</div>
                <h3 className="mt-5 font-grotesk text-xl font-semibold tracking-tight text-[color:var(--hero-title)]">
                  {t.landing.howItWorks.steps[step.id].title}
                </h3>
                <p className="mt-2 font-grotesk text-[14px] leading-relaxed text-[color:var(--hero-ground-muted)]">
                  {t.landing.howItWorks.steps[step.id].description}
                </p>
              </article>
            </TiltPanel>
          ))}
        </div>
      </div>
    </Section>
  );
};
