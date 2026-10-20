import type {
  IRichTextDocument,
  IRichTextListItem,
  IRichTextParagraph,
  TRichTextBlock,
  TRichTextInline,
  TRichTextMark,
  TRichTextStyle,
  TTextColor,
} from '@interfaces';

import { uniqueBy } from '@/lib/utils';

import { RICH_TEXT_STYLES, TEXT_COLORS } from '../consts';
import { isSafeLink } from './links';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const isRichTextStyle = (value: unknown): value is TRichTextStyle =>
  RICH_TEXT_STYLES.some((style) => style.id === value);

export const isTextColor = (value: unknown): value is TTextColor =>
  typeof value === 'string' && TEXT_COLORS.includes(value as TTextColor);

const attributeOf = (attributes: unknown, name: string): unknown => (isRecord(attributes) ? attributes[name] : null);

const parseMark = (value: unknown): TRichTextMark[] => {
  if (!isRecord(value)) return [];

  const { type, attrs } = value;
  const href = attributeOf(attrs, 'href');
  const color = attributeOf(attrs, 'color');

  if (type === 'link') return typeof href === 'string' && isSafeLink(href) ? [{ type, attrs: { href } }] : [];
  if (type === 'textColor') return isTextColor(color) ? [{ type, attrs: { color } }] : [];

  return isRichTextStyle(type) ? [{ type }] : [];
};

const parseMarks = (value: unknown): TRichTextMark[] =>
  uniqueBy(toArray(value).flatMap(parseMark), (mark) => mark.type);

const parseInline = (value: unknown): TRichTextInline[] => {
  if (!isRecord(value)) return [];
  if (value.type === 'hardBreak') return [{ type: 'hardBreak' }];
  if (value.type !== 'text' || typeof value.text !== 'string' || !value.text) return [];

  const marks = parseMarks(value.marks);

  return [marks.length > 0 ? { type: 'text', text: value.text, marks } : { type: 'text', text: value.text }];
};

const toParagraph = (content: TRichTextInline[]): IRichTextParagraph =>
  content.length > 0 ? { type: 'paragraph', content } : { type: 'paragraph' };

const parseParagraph = (value: unknown): IRichTextParagraph[] =>
  isRecord(value) && value.type === 'paragraph' ? [toParagraph(toArray(value.content).flatMap(parseInline))] : [];

const parseListItem = (value: unknown): IRichTextListItem[] => {
  if (!isRecord(value) || value.type !== 'listItem') return [];

  const content = toArray(value.content)
    .flatMap(parseParagraph)
    .flatMap((paragraph, index): TRichTextInline[] => [
      ...(index > 0 ? [{ type: 'hardBreak' } as const] : []),
      ...(paragraph.content ?? []),
    ]);

  return [{ type: 'listItem', content: [toParagraph(content)] }];
};

const parseBlock = (value: unknown): TRichTextBlock[] => {
  if (!isRecord(value)) return [];
  if (value.type !== 'bulletList' && value.type !== 'orderedList') return parseParagraph(value);

  const content = toArray(value.content).flatMap(parseListItem);

  return content.length > 0 ? [{ type: value.type, content }] : [];
};

export const parseRichText = (value: unknown): IRichTextDocument | null => {
  if (!isRecord(value) || value.type !== 'doc') return null;

  const content = toArray(value.content).flatMap(parseBlock);

  return content.length > 0 ? { type: 'doc', content } : null;
};
