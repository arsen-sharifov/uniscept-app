import type { LucideIcon } from 'lucide-react';

export type TRichTextStyle = 'bold' | 'italic' | 'underline' | 'strike';

export type TRichTextListType = 'bulletList' | 'orderedList';

export type TTextColor = 'red' | 'amber' | 'green' | 'blue' | 'violet';

export type TTrimEdge = 'start' | 'end';

export interface IRichTextStyleMark {
  type: TRichTextStyle;
}

export interface IRichTextLinkMark {
  type: 'link';
  attrs: { href: string };
}

export interface IRichTextColorMark {
  type: 'textColor';
  attrs: { color: TTextColor };
}

export type TRichTextMark = IRichTextStyleMark | IRichTextLinkMark | IRichTextColorMark;

export interface IRichTextText {
  type: 'text';
  text: string;
  marks?: TRichTextMark[];
}

export interface IRichTextHardBreak {
  type: 'hardBreak';
}

export type TRichTextInline = IRichTextText | IRichTextHardBreak;

export interface IRichTextParagraph {
  type: 'paragraph';
  content?: TRichTextInline[];
}

export interface IRichTextListItem {
  type: 'listItem';
  content: [IRichTextParagraph];
}

export interface IRichTextListAttributes {
  start: number;
}

export interface IRichTextList {
  type: TRichTextListType;
  attrs?: IRichTextListAttributes;
  content: IRichTextListItem[];
}

export type TRichTextBlock = IRichTextParagraph | IRichTextList;

export interface IRichTextDocument {
  type: 'doc';
  content: TRichTextBlock[];
}

export interface IRichTextValue {
  text: string;
  document?: IRichTextDocument;
}

export interface IRichTextCommand<TId extends string> {
  id: TId;
  icon: LucideIcon;
  shortcut: string;
}

export interface IKeyedItem<TItem> {
  key: string;
  item: TItem;
}
