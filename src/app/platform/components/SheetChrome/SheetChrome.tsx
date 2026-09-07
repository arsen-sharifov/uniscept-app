interface ISheetChromeProps {
  workspaceName?: string;
  threadName?: string;
}

export const SheetChrome = ({ workspaceName, threadName }: ISheetChromeProps) => (
  <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[color:var(--border)] px-4 font-mono-ui text-[10.5px] tracking-[0.04em] select-none">
    <span
      aria-hidden
      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
    />
    <span className="shrink-0 text-[color:var(--text-label)] lowercase">uniscept</span>
    {workspaceName && (
      <>
        <span aria-hidden className="shrink-0 text-[color:var(--text-faint)]">
          ·
        </span>
        <span className="shrink-0 text-[color:var(--text-label)]">{workspaceName}</span>
      </>
    )}
    {threadName && (
      <>
        <span aria-hidden className="shrink-0 text-[color:var(--text-faint)]">
          ·
        </span>
        <span className="truncate text-[color:var(--text)]">{threadName}</span>
      </>
    )}
  </div>
);
