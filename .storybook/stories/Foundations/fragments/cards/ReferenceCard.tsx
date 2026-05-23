import { Copyable } from '../widgets';

interface IReferenceCardProps {
  kicker: string;
  title: string;
  code: string;
  note: string;
}

export const ReferenceCard = ({ kicker, title, code, note }: IReferenceCardProps) => (
  <article className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[9.5px] font-semibold tracking-[0.24em] text-[color:var(--text-subtle)] uppercase">
        {kicker}
      </span>
      <Copyable value={code} display="copy" />
    </div>
    <h4 className="mt-1.5 font-serif text-[17px] leading-tight tracking-[-0.01em] text-[color:var(--text-strong)] italic">
      {title}
    </h4>
    <code className="mt-2 block rounded-md bg-[color:var(--surface-overlay)] px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.04em] text-[color:var(--text)]">
      {code}
    </code>
    <p className="mt-2 text-[11.5px] leading-snug text-[color:var(--text-muted)]">{note}</p>
  </article>
);
