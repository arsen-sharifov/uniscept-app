import { Bell, LogOut, Settings, User } from 'lucide-react';
import type { ReactNode } from 'react';

interface IMenuExampleProps {
  onSelect?: (label: string) => void;
}

interface IMenuEntry {
  icon: ReactNode;
  label: string;
  hint?: string;
  onSelect: () => void;
}

export const MenuExample = ({ onSelect }: IMenuExampleProps = {}) => {
  const entries: IMenuEntry[] = [
    {
      icon: <User className="h-3.5 w-3.5" strokeWidth={2} />,
      label: 'Profile',
      hint: '⌘ ;',
      onSelect: () => onSelect?.('Profile'),
    },
    {
      icon: <Settings className="h-3.5 w-3.5" strokeWidth={2} />,
      label: 'Settings',
      hint: '⌘ ,',
      onSelect: () => onSelect?.('Settings'),
    },
    {
      icon: <Bell className="h-3.5 w-3.5" strokeWidth={2} />,
      label: 'Notifications',
      onSelect: () => onSelect?.('Notifications'),
    },
    {
      icon: <LogOut className="h-3.5 w-3.5 text-[color:var(--status-error)]" strokeWidth={2} />,
      label: 'Sign out',
      onSelect: () => onSelect?.('Sign out'),
    },
  ];

  return (
    <ul className="w-56 py-1 text-[13px]">
      {entries.map((entry, index) => (
        <li key={entry.label} className="px-1">
          <button
            type="button"
            onClick={entry.onSelect}
            className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-[color:var(--text)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
          >
            <span className="flex items-center gap-2 truncate">
              <span className="text-[color:var(--text-muted)]">{entry.icon}</span>
              <span className="truncate">{entry.label}</span>
            </span>
            {entry.hint && (
              <kbd className="font-mono text-[10px] tracking-[0.06em] text-[color:var(--text-faint)]">{entry.hint}</kbd>
            )}
          </button>
          {index === 2 && <div className="my-1 h-px bg-[color:var(--border)]" />}
        </li>
      ))}
    </ul>
  );
};
