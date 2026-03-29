'use client';

import { type ReactNode, useState } from 'react';
import { clsx } from 'clsx';

interface IListProps {
  trigger: (open: boolean, toggle: () => void) => ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const List = ({
  trigger,
  children,
  defaultOpen = false,
}: IListProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <div>
      {trigger(open, toggle)}
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
