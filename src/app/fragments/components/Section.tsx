import type { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export const Section = ({ id, children, className }: SectionProps) => {
  return (
    <section
      id={id}
      className={clsx(
        'relative overflow-hidden border-t border-black/5 px-6 py-24',
        className
      )}
    >
      {children}
    </section>
  );
};
