import { ChevronDown } from 'lucide-react';

export const SampleTrigger = () => (
  <button className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-sm font-medium text-black/70 shadow-sm transition-colors hover:bg-black/5">
    Open menu
    <ChevronDown className="h-3.5 w-3.5 text-black/40" />
  </button>
);

export const SampleMenu = () => (
  <ul className="w-56 py-1.5 text-sm">
    {['Profile', 'Settings', 'Activity log', 'Sign out'].map((label) => (
      <li
        key={label}
        className="cursor-pointer px-3 py-1.5 text-black/70 transition-colors hover:bg-black/5 hover:text-black"
      >
        {label}
      </li>
    ))}
  </ul>
);
