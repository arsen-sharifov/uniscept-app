'use client';

import type { ReactNode } from 'react';

import { isSafeLink, LINK_REL, LINK_TARGET } from '@/lib/richText';
import { stopPropagation } from '@/lib/utils';

interface IRichTextLinkProps {
  href: string;
  children: ReactNode;
}

export const RichTextLink = ({ href, children }: IRichTextLinkProps) => {
  if (!isSafeLink(href)) return children;

  return (
    <a
      href={href}
      target={LINK_TARGET}
      rel={LINK_REL}
      draggable={false}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onDoubleClick={stopPropagation}
      className="nodrag nopan"
    >
      {children}
    </a>
  );
};
