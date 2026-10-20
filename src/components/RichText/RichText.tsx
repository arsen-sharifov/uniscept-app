import { clsx } from 'clsx';
import type { Ref } from 'react';

import type { IRichTextDocument } from '@interfaces';

import { RichTextBlock } from './fragments';
import { withContentKeys } from './utils';

interface IRichTextProps {
  text: string;
  document?: IRichTextDocument;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export const RichText = ({ text, document, className, ref }: IRichTextProps) => (
  <div ref={ref} data-rich-text className={clsx('rich-text', className)}>
    {document
      ? withContentKeys(document.content).map(({ key, item }) => <RichTextBlock key={key} block={item} />)
      : text}
  </div>
);
