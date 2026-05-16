import { Avatar } from '@/components';

export const PopoverTriggerExample = () => (
  <button
    type="button"
    className="rounded-full ring-2 ring-transparent transition-shadow hover:ring-[color:var(--border-strong)] focus-visible:ring-[color:var(--accent)] focus-visible:outline-none"
    aria-label="Open account menu"
  >
    <Avatar name="Jordan Vale" />
  </button>
);
