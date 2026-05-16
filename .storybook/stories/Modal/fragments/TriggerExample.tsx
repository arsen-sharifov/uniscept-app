interface ITriggerExampleProps {
  onClick: () => void;
  label: string;
}

export const TriggerExample = ({ onClick, label }: ITriggerExampleProps) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-[13px] font-medium text-[color:var(--on-accent)] shadow-[0_8px_18px_-10px_var(--accent-glow)] transition-transform hover:-translate-y-0.5"
  >
    {label}
  </button>
);
