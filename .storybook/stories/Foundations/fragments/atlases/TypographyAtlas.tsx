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
      title="Three voices: italic serif, system sans, monospace."
      intro="Display moments lean into a slanted serif (titles, card labels). Sans-serif carries reading load. Mono whispers metadata."
      sections={TYPOGRAPHY_SECTIONS}
      utilities={<FilterInput value={query} onChange={setQuery} placeholder="token, usage, family…" />}
    >
      <Section id="voices" index="§ 01" title="Voices" description="Three families, three distinct roles.">
        <div className="grid gap-3 sm:grid-cols-3">
          <VoiceCard
            family="serif"
            label="Display"
            sample="Aa Bb Cc"
            sampleClass="font-serif text-[32px] leading-[1] tracking-tight italic"
            classes="font-serif italic"
            note="Slanted serif for editorial labels — theme/pattern card titles, foundations heads."
          />
          <VoiceCard
            family="sans"
            label="Body"
            sample="Aa Bb Cc"
            sampleClass="text-[32px] leading-[1] font-medium tracking-tight"
            classes="(default)"
            note="System sans-serif for buttons, list rows, paragraphs. The default voice."
          />
          <VoiceCard
            family="mono"
            label="Mono"
            sample="Aa Bb Cc"
            sampleClass="font-mono text-[28px] leading-[1] font-semibold"
            classes="font-mono"
            note="Monospace for chips, eyebrows, codes. Wide tracking turns it into rhythm."
          />
        </div>
      </Section>

      <Section
        id="scale"
        index="§ 02"
        title="Scale"
        description="Tokens descend from display to micro. Click classes to copy."
        trailing={
          <span className="font-mono text-[9.5px] tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {filtered.length}/{TYPE_SCALE.length}
          </span>
        }
      >
        <Table columns={TYPOGRAPHY_TABLE_COLUMNS}>
          {filtered.map((row) => (
            <TableRow key={row.token}>
              <Cell>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate font-mono text-[10.5px] tracking-[0.04em] text-[color:var(--text-strong)]">
                    {row.token}
                  </span>
                  <FamilyChip family={row.family} />
                </div>
              </Cell>
              <Cell>
                <p className={clsx(row.classes, 'truncate text-[color:var(--text-strong)]')}>{row.sample}</p>
              </Cell>
              <Cell>
                <span className="truncate font-mono text-[10px] tracking-[0.06em] text-[color:var(--text-muted)]">
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
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
              Appearance
            </span>
            <h3 className="mt-2 text-[18px] font-bold tracking-tight text-[color:var(--text-strong)]">
              Workspace settings
            </h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
              Pick the surface your ideas live on. From quiet paper to a charted grid.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
                Four textures
              </span>
              <span className="h-px flex-1 bg-[color:var(--border)]" />
              <span className="font-mono text-[8.5px] font-semibold tracking-[0.22em] text-[color:var(--text-faint)] uppercase">
                Default
              </span>
            </div>
          </article>

          <article className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5">
            <p className="font-serif text-[24px] leading-[1.05] tracking-tight text-[color:var(--text-strong)] italic">
              Structured reasoning,
              <br />
              visible at a glance.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--text)]">
              Open a canvas. Draw a question. Connect arguments. Mark valid paths.
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-[color:var(--text-muted)]">
              Body text settles into a 13/1.6 rhythm. Mono callouts add structure without shouting.
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
              <kbd className="rounded-md border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-1.5 py-0.5 font-mono text-[11px] text-[color:var(--text-strong)] shadow-[var(--shadow-pip)]">
                N
              </kbd>
              <span className="text-[11.5px] text-[color:var(--text-muted)]">to add a node</span>
            </div>
          </DecorationCard>
          <DecorationCard label="Locale chip">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--accent)] font-mono text-[10.5px] font-semibold tracking-[0.06em] text-[color:var(--on-accent)] shadow-[0_4px_10px_-4px_var(--accent-glow)]">
              UK
            </div>
          </DecorationCard>
          <DecorationCard label="Default badge">
            <p className="font-mono text-[8.5px] font-semibold tracking-[0.22em] text-[color:var(--text-faint)] uppercase">
              Default
            </p>
          </DecorationCard>
        </div>
      </Section>
    </AtlasFrame>
  );
};
