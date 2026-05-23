import { clsx } from 'clsx';

import type { TTheme } from '@constants';
import type { TPatternVariant } from '@story-interfaces';

import {
  PATTERN_CAPTIONS,
  PATTERN_VARIANTS,
  PATTERNS_SECTIONS,
  RADIUS_SCALE,
  RADIUS_TABLE_COLUMNS,
  SHADOW_TABLE_COLUMNS,
  SHADOW_TOKENS,
  SPACING_TABLE_COLUMNS,
  SPACING_TOKENS,
  THEME_LIST,
} from '../../consts';
import { findActiveTheme } from '../../utils';
import { AtlasFrame, Cell, Section, Table, TableRow, ThemedSurface } from '../layout';
import { PatternMiniStage, PatternStage } from '../patterns';
import { Copyable } from '../widgets';

interface IPatternsAtlasProps {
  pattern: TPatternVariant;
  activeTheme: TTheme;
}

export const PatternsAtlas = ({ pattern, activeTheme }: IPatternsAtlasProps) => {
  const activeName = findActiveTheme(activeTheme).name;
  const patternMeta = PATTERN_CAPTIONS[pattern];

  return (
    <AtlasFrame
      tag="Patterns & Effects"
      title="Texture, depth, breath."
      intro="The canvas Background renders through real React Flow — what you see is what the platform draws. Underneath sit the three effect tables that shape every surface: radius, shadow, spacing."
      sections={PATTERNS_SECTIONS}
      utilities={
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[9.5px] tracking-[0.22em] text-[color:var(--text-subtle)] uppercase">
            stage
          </span>
          <span className="font-serif text-[20px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
            {patternMeta.label} · {activeName}
          </span>
        </div>
      }
    >
      <Section
        id="stage"
        index="§ 01"
        title="Stage"
        description="Active pattern × active theme, rendered through the real Background component."
      >
        <div className="space-y-3">
          <PatternStage pattern={pattern} />
          <p className="max-w-[640px] text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
            {patternMeta.description}
          </p>
        </div>
      </Section>

      <Section
        id="variants"
        index="§ 02"
        title="Variants"
        description="The four canvas patterns under the active theme — switch `pattern` in Controls to choose."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PATTERN_VARIANTS.map((variant) => {
            const meta = PATTERN_CAPTIONS[variant];
            const isActive = variant === pattern;

            return (
              <div
                key={variant}
                className={clsx(
                  'overflow-hidden rounded-xl border bg-[color:var(--surface-elevated)] transition-colors',
                  isActive ? 'border-[color:var(--accent)]' : 'border-[color:var(--border)]',
                )}
              >
                <PatternMiniStage pattern={variant} />
                <div className="flex items-baseline justify-between gap-2 px-3 py-2.5">
                  <div>
                    <h4 className="font-serif text-[15px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
                      {meta.label}
                    </h4>
                    <code className="mt-0.5 block font-mono text-[9.5px] tracking-[0.06em] text-[color:var(--text-muted)]">
                      {variant}
                    </code>
                  </div>
                  {isActive && (
                    <span className="font-mono text-[8.5px] font-semibold tracking-[0.22em] text-[color:var(--accent-text)] uppercase">
                      active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        id="across"
        index="§ 03"
        title="Across themes"
        description="The active pattern rendered against every theme. Useful for verifying grid contrast end-to-end."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_LIST.map((theme) => (
            <ThemedSurface key={theme.id} themeId={theme.id} className="overflow-hidden">
              <PatternMiniStage pattern={pattern} />
              <div className="flex items-baseline justify-between gap-2 px-3 py-2.5">
                <span className="font-serif text-[15px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
                  {theme.name}
                </span>
                <span className="font-mono text-[8.5px] tracking-[0.22em] text-[color:var(--text-subtle)] uppercase">
                  {theme.mode}
                </span>
              </div>
            </ThemedSurface>
          ))}
        </div>
      </Section>

      <Section
        id="radius"
        index="§ 04"
        title="Radius"
        description="Most surfaces sit on lg / xl. full is for circular elements."
      >
        <Table columns={RADIUS_TABLE_COLUMNS}>
          {RADIUS_SCALE.map((radius) => (
            <TableRow key={radius.label}>
              <Cell>
                <div
                  className={clsx(
                    'h-10 w-16 border border-[color:var(--border-strong)] bg-[color:var(--accent-soft)]',
                    radius.className,
                  )}
                />
              </Cell>
              <Cell>
                <span className="font-serif text-[15px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
                  {radius.label}
                </span>
              </Cell>
              <Cell>
                <Copyable value={radius.className} />
              </Cell>
              <Cell>
                <span className="font-mono text-[10.5px] tracking-[0.06em] text-[color:var(--text-muted)]">
                  {radius.pixels}
                </span>
              </Cell>
              <Cell>
                <span className="line-clamp-2 text-[11.5px] leading-snug text-[color:var(--text-muted)]">
                  {radius.usage}
                </span>
              </Cell>
            </TableRow>
          ))}
        </Table>
      </Section>

      <Section id="shadow" index="§ 05" title="Shadow" description="Three depth layers, theme-bound.">
        <Table columns={SHADOW_TABLE_COLUMNS}>
          {SHADOW_TOKENS.map((shadow) => (
            <TableRow key={shadow.variable}>
              <Cell>
                <div
                  className="h-10 w-16 rounded-lg bg-[color:var(--surface)] ring-1 ring-[color:var(--border-strong)]"
                  style={{ boxShadow: `var(${shadow.variable})` }}
                />
              </Cell>
              <Cell>
                <span className="font-serif text-[14px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
                  {shadow.label}
                </span>
              </Cell>
              <Cell>
                <Copyable value={shadow.variable} />
              </Cell>
              <Cell>
                <span className="line-clamp-2 text-[11.5px] leading-snug text-[color:var(--text-muted)]">
                  {shadow.usage}
                </span>
              </Cell>
            </TableRow>
          ))}
        </Table>
      </Section>

      <Section id="spacing" index="§ 06" title="Spacing" description="Tailwind 4 default scale, annotated with usage.">
        <Table columns={SPACING_TABLE_COLUMNS}>
          {SPACING_TOKENS.map((space) => (
            <TableRow key={space.label}>
              <Cell>
                <span className="font-serif text-[16px] leading-none tracking-[-0.01em] text-[color:var(--text-strong)] italic">
                  {space.label}
                </span>
              </Cell>
              <Cell>
                <Copyable value={space.className} />
              </Cell>
              <Cell>
                <span className="font-mono text-[10.5px] tracking-[0.06em] text-[color:var(--text-muted)]">
                  {space.rem}
                </span>
              </Cell>
              <Cell>
                <span className="font-mono text-[10.5px] tracking-[0.06em] text-[color:var(--text-subtle)]">
                  {space.pixels}
                </span>
              </Cell>
              <Cell>
                <span className="block bg-[color:var(--accent)]/65" style={{ width: space.pixels, height: '8px' }} />
              </Cell>
              <Cell>
                <span className="line-clamp-2 text-[11.5px] leading-snug text-[color:var(--text-muted)]">
                  {space.usage}
                </span>
              </Cell>
            </TableRow>
          ))}
        </Table>
      </Section>
    </AtlasFrame>
  );
};
