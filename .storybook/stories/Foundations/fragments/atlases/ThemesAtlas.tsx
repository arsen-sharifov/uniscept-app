import type { TTheme } from '@constants';
import { AtlasFrame, ColorChip, Section, ThemeSpecimen, ThemedSurface } from '..';
import { COLOR_GROUPS, CONTRAST_PAIRS, THEME_LIST, THEMES_SECTIONS } from '../../consts';
import { orderedSpecimens } from '../../utils';
import { ContrastTile } from './ContrastTile';
import { ReferenceCard } from './ReferenceCard';

interface IThemesAtlasProps {
  activeTheme: TTheme;
}

export const ThemesAtlas = ({ activeTheme }: IThemesAtlasProps) => {
  const { hero, rest } = orderedSpecimens(activeTheme);

  return (
    <AtlasFrame
      tag="Themes"
      title="Six themes. One semantic vocabulary."
      intro="Every theme rebinds the same set of tokens — accent stays accent, danger stays danger. Switch the toolbar Theme to retune everything below. The hero card mirrors your active choice; the strip beside it lets you compare the rest."
      sections={THEMES_SECTIONS}
      utilities={
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[9.5px] tracking-[0.22em] text-[color:var(--text-subtle)] uppercase">
            active
          </span>
          <span className="font-serif text-[22px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
            {hero.name}
          </span>
        </div>
      }
    >
      <Section
        id="specimen"
        index="§ 01"
        title="Specimen"
        description="The active theme rendered at full size; the others as comparison tiles."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
          <ThemeSpecimen theme={hero} size="hero" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {rest.map((t) => (
              <ThemeSpecimen key={t.id} theme={t} size="tile" />
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="tokens"
        index="§ 02"
        title="Tokens"
        description="Every CSS variable resolved against the active theme."
        trailing={
          <span className="font-mono text-[9.5px] tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {COLOR_GROUPS.reduce((acc, g) => acc + g.tokens.length, 0)} variables
          </span>
        }
      >
        <div className="space-y-8">
          {COLOR_GROUPS.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-[18px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
                  {group.title}
                </h3>
                <span className="font-mono text-[9.5px] tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
                  {group.tokens.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.tokens.map((token) => (
                  <ColorChip key={token.variable} variable={token.variable} label={token.label} role={token.role} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="contrast"
        index="§ 03"
        title="Contrast"
        description="Five real pairings, one per theme, side-by-side."
      >
        <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]">
          <div
            className="grid items-center gap-x-4 border-b border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-2.5"
            style={{ gridTemplateColumns: '130px repeat(5, minmax(0, 1fr))' }}
          >
            <span className="font-mono text-[9.5px] font-semibold tracking-[0.22em] text-[color:var(--text-subtle)] uppercase">
              Theme
            </span>
            {CONTRAST_PAIRS.map((p) => (
              <span
                key={p.caption}
                className="truncate font-mono text-[9.5px] font-semibold tracking-[0.22em] text-[color:var(--text-subtle)] uppercase"
              >
                {p.caption}
              </span>
            ))}
          </div>
          {THEME_LIST.map((theme) => (
            <ThemedSurface
              key={theme.id}
              themeId={theme.id}
              className="rounded-none border-0 border-b border-[color:var(--border)] last:border-b-0"
            >
              <div
                className="grid items-center gap-x-4 px-4 py-3"
                style={{ gridTemplateColumns: '130px repeat(5, minmax(0, 1fr))' }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-serif text-[15px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
                    {theme.name}
                  </span>
                  <span className="font-mono text-[8.5px] tracking-[0.2em] text-[color:var(--text-subtle)] uppercase">
                    {theme.mode}
                  </span>
                </div>
                {CONTRAST_PAIRS.map((p) => (
                  <ContrastTile key={p.caption} {...p} />
                ))}
              </div>
            </ThemedSurface>
          ))}
        </div>
      </Section>

      <Section
        id="application"
        index="§ 04"
        title="Application"
        description="Practical pointers for using themes in code."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <ReferenceCard
            kicker="Apply"
            title="Wrap with data-theme"
            code='<div data-theme="eclipse">…</div>'
            note="Anywhere — section, modal, single component. Themes are scoped, not global-only."
          />
          <ReferenceCard
            kicker="Token"
            title="Use semantic, not hex"
            code="bg-[color:var(--surface-elevated)]"
            note="Never reach past a token. If a hue isn't in the palette, the design is asking the wrong question."
          />
          <ReferenceCard
            kicker="Adaptive"
            title="Auto follows the system"
            code='<html data-theme="auto">'
            note="Reads prefers-color-scheme and mirrors Eclipse on dark, Daybreak on light. Never a custom palette."
          />
          <ReferenceCard
            kicker="Status"
            title="Three semantic tones"
            code="--status-success / --status-warning / --status-error"
            note="Bound per theme. Use the *-bg / *-border / *-soft companions for surfaces."
          />
        </div>
      </Section>
    </AtlasFrame>
  );
};
