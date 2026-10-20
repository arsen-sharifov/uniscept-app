import type { ReactNode } from 'react';

import type { TRichTextMark } from '@interfaces';

import { RichTextLink } from './RichTextLink';

interface IRichTextMarkProps {
  mark: TRichTextMark;
  children: ReactNode;
}

export const RichTextMark = ({ mark, children }: IRichTextMarkProps) => {
  switch (mark.type) {
    case 'bold':
      return <strong>{children}</strong>;
    case 'italic':
      return <em>{children}</em>;
    case 'underline':
      return <u>{children}</u>;
    case 'strike':
      return <s>{children}</s>;
    case 'textColor':
      return <span data-text-color={mark.attrs.color}>{children}</span>;
    case 'link':
      return <RichTextLink href={mark.attrs.href}>{children}</RichTextLink>;
  }
};
