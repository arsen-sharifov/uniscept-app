import { onTestFinished } from 'vitest';

import { OKLCH_COLOR } from './canvasExportValues';

const decorated = (tag: string, line: string, color: string, content: string): string =>
  `<${tag} style="text-decoration-line: ${line}; text-decoration-color: ${color}">${content}</${tag}>`;

export const DECORATION_FIXTURE = {
  word: 'Cost',
  lines: 'Cost\nbasis',
  link: 'bold link',
  blank: '  ',
  color: 'rgb(37, 99, 235)',
  outerColor: 'rgb(9, 8, 7)',
  origin: { x: -10, y: -30, width: 0, height: 0 },
  textX: '10',
  baseline: '44',
  underlineY: '45.68',
  lineThroughY: '38.64',
  captionUnderlineY: '44.9',
  thickness: '1.12',
  minimumThickness: '1',
  wordWidth: '32',
  linkWidth: '72',
  lineWidths: ['32', '40'],
} as const;

export const TEXT_STYLE = {
  fontStyle: 'normal',
  fontWeight: '400',
  fontSize: '16px',
  fontFamily: 'sans-serif',
  textTransform: 'none',
  color: 'rgb(20, 20, 20)',
  letterSpacing: 'normal',
} as CSSStyleDeclaration;

export const CAPTION_TEXT_STYLE = { ...TEXT_STYLE, fontSize: '10px' } as CSSStyleDeclaration;

export const DECORATION_MARKUP = {
  underlined: decorated('u', 'underline', DECORATION_FIXTURE.color, DECORATION_FIXTURE.word),
  struck: decorated('s', 'line-through', DECORATION_FIXTURE.color, DECORATION_FIXTURE.word),
  struckUnderlined: decorated(
    's',
    'line-through',
    DECORATION_FIXTURE.outerColor,
    decorated('u', 'underline', DECORATION_FIXTURE.color, DECORATION_FIXTURE.word),
  ),
  boldLink: decorated('a', 'underline', DECORATION_FIXTURE.color, `<strong>${DECORATION_FIXTURE.link}</strong>`),
  doublyUnderlined: decorated(
    'u',
    'underline',
    DECORATION_FIXTURE.outerColor,
    decorated('u', 'underline', DECORATION_FIXTURE.color, DECORATION_FIXTURE.word),
  ),
  plain: `<strong>${DECORATION_FIXTURE.word}</strong>`,
  blank: decorated('u', 'underline', DECORATION_FIXTURE.color, DECORATION_FIXTURE.blank),
  beyondNode: decorated(
    'div',
    'line-through',
    DECORATION_FIXTURE.outerColor,
    `<div data-export-node style="text-decoration-line: underline; text-decoration-color: ${DECORATION_FIXTURE.color}"><span>${DECORATION_FIXTURE.word}</span></div>`,
  ),
  themed: decorated('u', 'underline', OKLCH_COLOR, DECORATION_FIXTURE.word),
  multiline: decorated('u', 'underline', DECORATION_FIXTURE.color, DECORATION_FIXTURE.lines),
};

export const mountExportText = (markup: string): Text => {
  const node = document.createElement('div');
  node.dataset.exportNode = '';
  node.innerHTML = markup;
  document.body.append(node);
  onTestFinished(() => node.remove());

  return document.createTreeWalker(node, NodeFilter.SHOW_TEXT).nextNode() as Text;
};
