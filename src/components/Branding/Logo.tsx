import { clsx } from 'clsx';

interface ILogoProps {
  className?: string;
}

export const Logo = ({ className }: ILogoProps) => {
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
