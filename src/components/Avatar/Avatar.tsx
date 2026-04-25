export interface IAvatarProps {
  name: string;
}

export const getInitials = (name: string, fallback = 'U') =>
  (name?.trim() || fallback?.trim() || 'U')
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const Avatar = ({ name }: IAvatarProps) => (
  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-lg font-bold text-white shadow-sm">
    {getInitials(name)}
  </div>
);
