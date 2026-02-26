'use client';

import { type ReactNode, useState } from 'react';

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
      {open && children}
    </div>
  );
};
