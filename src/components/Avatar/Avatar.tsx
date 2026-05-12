export interface IAvatarProps {
  name: string;
}

export const getInitials = (name: string, fallback = 'U') =>
  (name?.trim() || fallback?.trim() || 'U')
    .split(/\s+/)
    .map((w: string) => [...w][0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const Avatar = ({ name }: IAvatarProps) => (
  <span
    role="img"
    aria-label={name || 'User'}
    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] text-lg font-bold text-[color:var(--on-accent)] shadow-sm"
  >
    {getInitials(name)}
  </span>
);
