import type { IRichTextParagraph } from '@interfaces';

import { withContentKeys } from '../utils';
import { RichTextInline } from './RichTextInline';

interface IRichTextParagraphProps {
  paragraph: IRichTextParagraph;
}

export const RichTextParagraph = ({ paragraph }: IRichTextParagraphProps) => (
  <p>
    {paragraph.content ? (
      withContentKeys(paragraph.content).map(({ key, item }) => <RichTextInline key={key} inline={item} />)
    ) : (
      <br />
    )}
  </p>
);
