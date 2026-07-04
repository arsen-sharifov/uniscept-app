import { TOAST_TRIGGERS } from '../consts';

export const TriggerRow = () => (
  <div className="flex flex-wrap gap-2">
    {TOAST_TRIGGERS.map(({ label, fire }) => (
      <button
        key={label}
        type="button"
        className="inline-flex items-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3.5 py-2 text-[13px] font-medium text-[color:var(--text-strong)] transition-transform hover:-translate-y-0.5"
        onClick={fire}
      >
        {label}
      </button>
    ))}
  </div>
);
