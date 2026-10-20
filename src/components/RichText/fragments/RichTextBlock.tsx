import type { TRichTextBlock } from '@interfaces';

import { withContentKeys } from '../utils';
import { RichTextParagraph } from './RichTextParagraph';

interface IRichTextBlockProps {
  block: TRichTextBlock;
}

export const RichTextBlock = ({ block }: IRichTextBlockProps) => {
  if (block.type === 'paragraph') return <RichTextParagraph paragraph={block} />;

  const items = withContentKeys(block.content).map(({ key, item }) => (
    <li key={key}>
      <RichTextParagraph paragraph={item.content[0]} />
    </li>
  ));

  return block.type === 'bulletList' ? <ul>{items}</ul> : <ol>{items}</ol>;
};
