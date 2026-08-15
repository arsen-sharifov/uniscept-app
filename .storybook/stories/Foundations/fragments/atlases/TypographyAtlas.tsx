'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { TYPE_SCALE, TYPOGRAPHY_SECTIONS, TYPOGRAPHY_TABLE_COLUMNS } from '../../consts';
import { useFiltered } from '../../hooks';
import { DecorationCard, FamilyChip, VoiceCard } from '../cards';
import { AtlasFrame, Cell, Section, Table, TableRow } from '../layout';
import { Copyable, FilterInput } from '../widgets';

export const TypographyAtlas = () => {
  const [query, setQuery] = useState('');
  const filtered = useFiltered(TYPE_SCALE, query, (row) => `${row.token} ${row.usage} ${row.family}`);

  return (
    <AtlasFrame
      tag="Typography"
      title="Two voices: Onest grotesk, JetBrains Mono."
      intro="Onest (font-grotesk) carries everything a person writes or reads — titles, node labels, card names. JetBrains Mono (font-mono-ui) carries everything the system says — labels, meta, codes, status words. Paragraph blurbs are sized only and inherit the page sans."
      sections={TYPOGRAPHY_SECTIONS}
      utilities={<FilterInput value={query} onChange={setQuery} placeholder="token, usage, family…" />}
    >
      <Section id="voices" index="§ 01" title="Voices" description="Two declared families, plus the inherited base.">
        <div className="grid gap-3 sm:grid-cols-3">
          <VoiceCard
            family="grotesk"
            label="Human"
            sample="Aa Bb Cc"
            sampleClass="font-grotesk text-[32px] leading-[1] font-semibold tracking-tight"
            classes="font-grotesk"
            note="Onest for human content — headings, node labels, card titles, the wordmark."
          />
          <VoiceCard
            family="mono"
            label="System"
            sample="Aa Bb Cc"
            sampleClass="font-mono-ui text-[28px] leading-[1] font-bold"
            classes="font-mono-ui"
            note="JetBrains Mono for system speech — labels, meta, shortcuts, uppercase status words."
          />
          <VoiceCard
            family="base"
            label="Base"
            sample="Aa Bb Cc"
            sampleClass="text-[32px] leading-[1] font-medium tracking-tight"
            classes="(no family class)"
            note="Blurbs and descriptive paragraphs set size and leading only, inheriting the page sans."
          />
        </div>
      </Section>

      <Section
        id="scale"
        index="§ 02"
        title="Scale"
        description="Tokens descend from display to micro. Click classes to copy."
        trailing={
          <span className="font-mono-ui text-[9.5px] tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {filtered.length}/{TYPE_SCALE.length}
          </span>
        }
      >
        <Table columns={TYPOGRAPHY_TABLE_COLUMNS}>
          {filtered.map((row) => (
            <TableRow key={row.token}>
              <Cell>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate font-mono-ui text-[10.5px] tracking-[0.04em] text-[color:var(--text-strong)]">
                    {row.token}
                  </span>
                  <FamilyChip family={row.family} />
                </div>
              </Cell>
              <Cell>
                <p className={clsx(row.classes, 'truncate text-[color:var(--text-strong)]')}>{row.sample}</p>
              </Cell>
              <Cell>
                <span className="truncate font-mono-ui text-[10px] tracking-[0.06em] text-[color:var(--text-muted)]">
                  {row.size} · {row.leading} · {row.weight}
                </span>
              </Cell>
              <Cell>
                <Copyable value={row.classes} />
              </Cell>
              <Cell>
                <span className="line-clamp-2 text-[11.5px] leading-snug text-[color:var(--text-muted)]">
                  {row.usage}
                </span>
              </Cell>
            </TableRow>
          ))}
        </Table>
      </Section>

      <Section
        id="composition"
        index="§ 03"
        title="Composition"
        description="How the voices stack in real product layouts."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5">
            <span className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
              Appearance
            </span>
            <h3 className="mt-2 font-grotesk text-lg font-semibold text-[color:var(--text-strong)]">
              Workspace settings
            </h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
              Pick the surface your ideas live on. From quiet paper to a charted grid.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono-ui text-[10px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
                Four textures
              </span>
              <span className="h-px flex-1 bg-[color:var(--border)]" />
              <span className="font-mono-ui text-[8.5px] leading-none font-semibold tracking-[0.22em] text-[color:var(--text-faint)] uppercase">
                Default
              </span>
            </div>
          </article>

          <article className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5">
            <p className="font-grotesk text-[24px] leading-none font-semibold tracking-tight text-[color:var(--text-strong)]">
              Structured reasoning,
              <br />
              visible at a glance.
            </p>
            <p className="mt-3 font-grotesk text-[13px] leading-5 text-[color:var(--text)]">
              Open a canvas. Draw a question. Connect arguments. Mark valid paths.
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-[color:var(--text-muted)]">
              Human copy sits in Onest; the mono line above it is the system speaking, not the writer.
            </p>
          </article>
        </div>
      </Section>

      <Section
        id="decoration"
        index="§ 04"
        title="Decoration"
        description="Micro-typography pieces that show up across the product."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <DecorationCard label="Keyboard">
            <div className="flex items-center gap-2">
              <kbd className="rounded-md border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-1.5 py-0.5 font-mono-ui text-[11px] text-[color:var(--text-strong)] shadow-[var(--shadow-pip)]">
                N
              </kbd>
              <span className="text-[11.5px] text-[color:var(--text-muted)]">to add a node</span>
            </div>
          </DecorationCard>
          <DecorationCard label="Locale chip">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--accent)] font-mono-ui text-[10.5px] font-semibold tracking-[0.06em] text-[color:var(--on-accent)] shadow-[0_4px_10px_-4px_var(--accent-glow)]">
              UK
            </div>
          </DecorationCard>
          <DecorationCard label="Default badge">
            <p className="font-mono-ui text-[8.5px] font-semibold tracking-[0.22em] text-[color:var(--text-faint)] uppercase">
              Default
            </p>
          </DecorationCard>
        </div>
      </Section>
    </AtlasFrame>
  );
};
