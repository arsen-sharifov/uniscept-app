import type { ReactNode } from 'react';

interface ISectionHeadingProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export const SectionHeading = ({ title, subtitle, children }: ISectionHeadingProps) => (
  <>
    <h2 className="font-grotesk text-[clamp(2.4rem,4vw,3.4rem)] leading-[1.06] font-medium tracking-[-0.015em] text-[color:var(--hero-title)]">
      <span aria-hidden className="mr-3 text-[0.7em] text-[color:var(--hero-accent-text)]">
        {'❯'}
      </span>
      {title}
    </h2>
    <p className="mt-4 font-grotesk text-lg text-[color:var(--hero-ground-muted)] lg:text-xl">{subtitle}</p>
    {children}
  </>
);
