import { User } from 'lucide-react';

export const IconTriggerExample = () => (
  <button
    type="button"
    aria-label="User menu"
    className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-text)] ring-1 ring-[color:var(--border-strong)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--on-accent)]"
  >
    <User className="h-4 w-4" strokeWidth={2} />
  </button>
);
