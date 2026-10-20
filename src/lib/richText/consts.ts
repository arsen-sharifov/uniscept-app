import { Bold, Italic, Link, List, ListOrdered, Strikethrough, Underline } from 'lucide-react';

import type { IRichTextCommand, TRichTextListType, TRichTextStyle, TTextColor } from '@interfaces';

export const RICH_TEXT_STYLES: readonly IRichTextCommand<TRichTextStyle>[] = [
  { id: 'bold', icon: Bold, shortcut: '⌘B' },
  { id: 'italic', icon: Italic, shortcut: '⌘I' },
  { id: 'underline', icon: Underline, shortcut: '⌘U' },
  { id: 'strike', icon: Strikethrough, shortcut: '⌘⇧S' },
];

export const RICH_TEXT_LISTS: readonly IRichTextCommand<TRichTextListType>[] = [
  { id: 'bulletList', icon: List, shortcut: '⌘⇧8' },
  { id: 'orderedList', icon: ListOrdered, shortcut: '⌘⇧7' },
];

export const RICH_TEXT_LINK: IRichTextCommand<'link'> = { id: 'link', icon: Link, shortcut: '⌘K' };

export const TEXT_COLORS: readonly TTextColor[] = ['red', 'amber', 'green', 'blue', 'violet'];

export const TEXT_COLOR_VALUES: Record<TTextColor, string> = {
  red: 'var(--ink-red)',
  amber: 'var(--ink-amber)',
  green: 'var(--ink-green)',
  blue: 'var(--ink-blue)',
  violet: 'var(--ink-violet)',
};

export const SAFE_LINK_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:']);

export const MAX_LINK_LENGTH = 2048;

export const MAX_RICH_TEXT_BYTES = 80_000;

export const LINK_TARGET = '_blank';

export const LINK_REL = 'noopener noreferrer nofollow';

export const URL_SCHEME_PATTERN = /^[a-z][\d+a-z-]*:/i;

export const WHITESPACE_PATTERN = /\s/;
