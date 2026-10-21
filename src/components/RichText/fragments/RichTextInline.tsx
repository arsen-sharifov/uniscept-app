import type { ReactNode } from 'react';

import type { TRichTextInline } from '@interfaces';

import { RichTextMark } from './RichTextMark';

interface IRichTextInlineProps {
  inline: TRichTextInline;
}

export const RichTextInline = ({ inline }: IRichTextInlineProps) => {
  if (inline.type === 'hardBreak') return <br />;

  return (inline.marks ?? []).reduceRight<ReactNode>(
    (children, mark) => <RichTextMark mark={mark}>{children}</RichTextMark>,
    inline.text,
  );
};
