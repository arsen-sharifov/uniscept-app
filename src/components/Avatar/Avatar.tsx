export interface IAvatarProps {
  name: string;
}

const getInitials = (name: string) =>
  (name || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const Avatar = ({ name }: IAvatarProps) => (
  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-lg font-bold text-white shadow-sm">
    {getInitials(name)}
  </div>
);
