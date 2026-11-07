import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';

interface IAuthLinkProps {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}

export const AuthLink = ({ href, onClick, children }: IAuthLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className="rounded-md font-medium text-[color:var(--hero-accent-text)] underline-offset-4 transition-colors duration-200 hover:underline focus-visible:ring-2 focus-visible:ring-[color:var(--hero-lime-glow)] focus-visible:outline-none"
  >
    {children}
  </Link>
);
