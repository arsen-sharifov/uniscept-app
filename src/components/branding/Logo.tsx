import { clsx } from 'clsx';

type LogoProps = {
  className?: string;
};

export const Logo = ({ className }: LogoProps) => {
  return (
    <span
      className={clsx(
        'gradient-text-animated font-black tracking-tight select-none',
        className
      )}
    >
      Uniscept
    </span>
  );
};
