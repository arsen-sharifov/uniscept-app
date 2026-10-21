import type {
  IRichTextDocument,
  IRichTextList,
  IRichTextListItem,
  IRichTextParagraph,
  IRichTextValue,
  TRichTextBlock,
  TRichTextInline,
  TTrimEdge,
} from '@interfaces';

const inlineText = (inline: TRichTextInline): string => (inline.type === 'text' ? inline.text : '\n');

const paragraphText = (paragraph: IRichTextParagraph): string => (paragraph.content ?? []).map(inlineText).join('');

const blockParagraphs = (block: TRichTextBlock): IRichTextParagraph[] =>
  block.type === 'paragraph' ? [block] : block.content.map((item) => item.content[0]);

const isBlankParagraph = (paragraph: IRichTextParagraph): boolean => !paragraphText(paragraph).trim();

const isBlankBlock = (block: TRichTextBlock): boolean => blockParagraphs(block).every(isBlankParagraph);

const isBlankItem = (item: IRichTextListItem): boolean => isBlankParagraph(item.content[0]);

const isBlankInline = (inline: TRichTextInline): boolean => inline.type !== 'text' || !inline.text.trim();

export const toPlainText = (document: IRichTextDocument): string =>
  document.content.flatMap(blockParagraphs).map(paragraphText).join('\n');

export const fromPlainText = (text: string): IRichTextDocument => ({
  type: 'doc',
  content: text
    .split('\n')
    .map((line): IRichTextParagraph =>
      line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' },
    ),
});

export const isPlainDocument = (document: IRichTextDocument): boolean =>
  document.content.every(
    (block) =>
      block.type === 'paragraph' &&
      (block.content ?? []).every((inline) => inline.type === 'hardBreak' || !inline.marks?.length),
  );

export const isBlankRichText = (document: IRichTextDocument): boolean => document.content.every(isBlankBlock);

export const isSameRichText = (previous?: IRichTextDocument, next?: IRichTextDocument): boolean =>
  previous === next ||
  (previous !== undefined && next !== undefined && JSON.stringify(previous) === JSON.stringify(next));

const trimEdge = <TItem>(items: TItem[], isBlank: (item: TItem) => boolean, edge: TTrimEdge): TItem[] => {
  const isFilled = (item: TItem) => !isBlank(item);
  if (!items.some(isFilled)) return [];

  return edge === 'start' ? items.slice(items.findIndex(isFilled)) : items.slice(0, items.findLastIndex(isFilled) + 1);
};

const trimSequence = <TItem>(
  items: TItem[],
  isBlank: (item: TItem) => boolean,
  edge: TTrimEdge,
  trimItem: (item: TItem, edge: TTrimEdge) => TItem,
): TItem[] => {
  const kept = trimEdge(items, isBlank, edge);
  const index = edge === 'start' ? 0 : kept.length - 1;

  return kept.map((item, position) => (position === index ? trimItem(item, edge) : item));
};

const trimInline = (inline: TRichTextInline, edge: TTrimEdge): TRichTextInline => {
  if (inline.type !== 'text') return inline;

  return { ...inline, text: edge === 'start' ? inline.text.trimStart() : inline.text.trimEnd() };
};

const trimParagraph = (paragraph: IRichTextParagraph, edge: TTrimEdge): IRichTextParagraph => ({
  ...paragraph,
  content: trimSequence(paragraph.content ?? [], isBlankInline, edge, trimInline),
});

const trimItem = (item: IRichTextListItem, edge: TTrimEdge): IRichTextListItem => ({
  ...item,
  content: [trimParagraph(item.content[0], edge)],
});

const trimList = (list: IRichTextList, edge: TTrimEdge): IRichTextList => ({
  ...list,
  content: trimSequence(list.content, isBlankItem, edge, trimItem),
});

const trimBlock = (block: TRichTextBlock, edge: TTrimEdge): TRichTextBlock =>
  block.type === 'paragraph' ? trimParagraph(block, edge) : trimList(block, edge);

export const trimRichText = (document: IRichTextDocument): IRichTextDocument | null => {
  const content = trimSequence(
    trimSequence(document.content, isBlankBlock, 'start', trimBlock),
    isBlankBlock,
    'end',
    trimBlock,
  );

  return content.length > 0 ? { type: 'doc', content } : null;
};

export const toRichTextValue = (document: IRichTextDocument): IRichTextValue => {
  const trimmed = trimRichText(document);
  if (!trimmed) return { text: '' };

  const text = toPlainText(trimmed);

  return isPlainDocument(trimmed) ? { text } : { text, document: trimmed };
};
