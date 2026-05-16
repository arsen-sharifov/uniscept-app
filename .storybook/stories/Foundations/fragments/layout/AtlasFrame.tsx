import type { ReactNode } from 'react';

interface IAtlasFrameProps {
  tag: string;
  title: string;
  intro: string;
  sections?: { id: string; label: string }[];
  utilities?: ReactNode;
  children: ReactNode;
}

export const AtlasFrame = ({ tag, title, intro, sections, utilities, children }: IAtlasFrameProps) => (
  <div className="min-h-screen bg-[color:var(--app-bg)] text-[color:var(--text)]">
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--app-bg)]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-2 px-10 py-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[9.5px] font-semibold tracking-[0.36em] text-[color:var(--text-subtle)] uppercase">
            Uniscept · Atlas
          </span>
          <span className="text-[color:var(--text-faint)]">/</span>
          <span className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--text-muted)] uppercase">
            {tag}
          </span>
        </div>
        {sections && sections.length > 0 && (
          <nav className="ml-auto flex flex-wrap items-center gap-1">
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-md px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-[color:var(--text-subtle)] uppercase transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>

    <div className="mx-auto max-w-[1280px] px-10 pt-12 pb-24">
      <section className="grid grid-cols-1 gap-y-6 pb-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-x-12">
        <div className="space-y-4">
          <h1 className="max-w-[720px] font-serif text-[clamp(34px,5vw,52px)] leading-[1] tracking-[-0.02em] text-[color:var(--text-strong)] italic">
            {title}
          </h1>
          <p className="max-w-[640px] text-[14px] leading-relaxed text-[color:var(--text-muted)]">{intro}</p>
        </div>
        {utilities && <div className="flex justify-start lg:justify-end">{utilities}</div>}
      </section>

      <main className="space-y-16">{children}</main>
    </div>
  </div>
);
