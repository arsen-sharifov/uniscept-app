import { Avatar } from '@/components';

export const CommentThreadExample = () => (
  <div className="flex w-[320px] items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3">
    <Avatar name="Maria Lin" />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[12px] font-semibold text-[color:var(--text-strong)]">Maria Lin</span>
        <span className="shrink-0 font-mono text-[10px] tracking-[0.04em] text-[color:var(--text-subtle)]">
          2 min ago
        </span>
      </div>
      <p className="text-[12px] leading-snug text-[color:var(--text)]">
        Should we split the governance branch into its own subsection? It is starting to overshadow the demo flow.
      </p>
    </div>
  </div>
);
