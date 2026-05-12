import { Avatar } from '@/components';

export const SidebarHeaderExample = () => (
  <div className="flex w-[260px] items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 py-2.5">
    <Avatar name="Alex Carver" />
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-[13px] font-semibold text-[color:var(--text-strong)]">Alex Carver</span>
      <span className="truncate text-[11px] text-[color:var(--text-muted)]">Standard · Personal workspace</span>
    </div>
  </div>
);
