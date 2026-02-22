import { useState } from 'react';

type ListProps = {
  trigger: (open: boolean, toggle: () => void) => React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export const List = ({ trigger, children, defaultOpen = false }: ListProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <div>
      {trigger(open, toggle)}
      {open && children}
    </div>
  );
};
