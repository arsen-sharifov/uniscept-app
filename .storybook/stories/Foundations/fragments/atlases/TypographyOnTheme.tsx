import { clsx } from 'clsx';
import type { TTheme } from '@constants';
import { AtlasFrame, Section, ThemedSurface } from '..';
import { THEME_LIST, TYPE_SCALE } from '../../consts';
import { findActiveTheme } from '../../utils';

interface ITypographyOnThemeProps {
  activeTheme: TTheme;
}

export const TypographyOnTheme = ({ activeTheme }: ITypographyOnThemeProps) => {
  const samples = TYPE_SCALE.filter((row) =>
    ['display/serif', 'h1/serif', 'body/sans', 'eyebrow/sans-mono'].includes(row.token)
  );

  return (
    <AtlasFrame
      tag="Themes · Typography"
      title="Type, theme-bound."
      intro="The same four type voices rendered against every theme — verify that the rhythm holds whether the surface is parchment, ink, or graphite."
    >
      <Section
        id="grid"
        index="§ 01"
        title="Voices in context"
        description={`Currently anchored to ${findActiveTheme(activeTheme).name}.`}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {THEME_LIST.map((theme) => (
            <ThemedSurface key={theme.id} themeId={theme.id} className="space-y-4 p-6">
              <header className="flex items-baseline justify-between">
                <h3 className="font-serif text-[20px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
                  {theme.name}
                </h3>
                <span className="font-mono text-[9px] tracking-[0.22em] text-[color:var(--text-subtle)] uppercase">
                  {theme.mode}
                </span>
              </header>
              {samples.map((sample) => (
                <div key={sample.token} className="space-y-1">
                  <span className="block font-mono text-[8.5px] font-semibold tracking-[0.24em] text-[color:var(--text-faint)] uppercase">
                    {sample.token}
                  </span>
                  <p
                    className={clsx(
                      sample.classes,
                      sample.uppercase ? 'text-[color:var(--text-subtle)]' : 'text-[color:var(--text-strong)]'
                    )}
                  >
                    {sample.sample}
                  </p>
                </div>
              ))}
            </ThemedSurface>
          ))}
        </div>
      </Section>
    </AtlasFrame>
  );
};
