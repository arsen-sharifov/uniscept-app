'use client';

import type { ICanvasExportContext, IExportTextLine } from '@interfaces';

import { svgElement } from './primitives';

const GRAPHEME_SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

const transformText = (text: string, transform: string): string => {
  if (transform === 'uppercase') return text.toLocaleUpperCase();
  if (transform === 'lowercase') return text.toLocaleLowerCase();

  return text;
};

const measureLines = (node: Text): IExportTextLine[] => {
  const range = document.createRange();
  const lines: IExportTextLine[] = [];

  Array.from(GRAPHEME_SEGMENTER.segment(node.data)).forEach(({ segment, index }) => {
    range.setStart(node, index);
    range.setEnd(node, index + segment.length);
    const rect = range.getBoundingClientRect();
    if (segment === '\n' || rect.width === 0) return;
    const previous = lines.at(-1);
    if (!previous || Math.abs(previous.y - rect.y) >= 1) {
      lines.push({ text: segment, x: rect.x, y: rect.y, width: rect.width, height: rect.height });

      return;
    }
    previous.text += segment;
    previous.width = Math.max(previous.x + previous.width, rect.right) - Math.min(previous.x, rect.x);
    previous.x = Math.min(previous.x, rect.x);
  });

  return lines;
};

const collectGlyphs = (text: string, { fonts, codePoints }: ICanvasExportContext, fontFamily: string): void => {
  fonts.add(fontFamily);
  Array.from(text, (character) => character.codePointAt(0) ?? 0).forEach((codePoint) => codePoints.add(codePoint));
};

export const renderExportText = (
  node: Text,
  style: CSSStyleDeclaration,
  context: ICanvasExportContext,
): SVGTextElement[] => {
  if (!node.data.trim()) return [];
  const { origin, scratch } = context;
  scratch.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = scratch.measureText(node.data);

  return measureLines(node).map((line) => {
    const text = transformText(line.text, style.textTransform);
    collectGlyphs(text, context, style.fontFamily);
    const element = svgElement('text', {
      x: line.x - origin.x,
      y: line.y - origin.y + (line.height - ascent - descent) / 2 + ascent,
      fill: style.color,
      'font-family': style.fontFamily,
      'font-size': style.fontSize,
      'font-weight': style.fontWeight,
      'font-style': style.fontStyle,
      'letter-spacing': style.letterSpacing,
      'xml:space': 'preserve',
      textLength: line.width,
      lengthAdjust: 'spacingAndGlyphs',
    });
    element.textContent = text;

    return element;
  });
};
