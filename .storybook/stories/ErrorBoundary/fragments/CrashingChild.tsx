interface ICrashingChildProps {
  explode: boolean;
}

export const CrashingChild = ({ explode }: ICrashingChildProps) => {
  if (explode) {
    throw new Error('A child threw during render');
  }

  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[13px] text-[color:var(--text-muted)]">
      Subtree is rendering fine.
    </div>
  );
};
