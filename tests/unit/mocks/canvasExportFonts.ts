import { vi } from 'vitest';

import type { ICanvasExportContext } from '@interfaces';

import { stubProperty } from './browser';
import { exportContext } from './canvasExportDom';

export const LATIN_UNICODE_RANGE = 'U+0000-00FF, U+0131, U+2000-206F, U+4??';

export const FONT_FIXTURE = {
  family: 'Onest',
  familyStack: '"Onest", sans-serif',
  otherFamily: 'JetBrains Mono',
  cyrillicSource: 'cyrillic.woff2',
  inlineSource: 'data:font/woff2;base64,AAAA',
  latinText: 'Latin words',
  cyrillicText: 'Рішення',
  latinUrl: 'https://app.test/fonts/latin.woff2',
  cyrillicUrl: 'https://app.test/fonts/cyrillic.woff2',
  dataUrl: 'data:font/woff2;base64,Zm9udA==',
} as const;

const fontFace = (family: string, source: string, unicodeRange: string): CSSFontFaceRule => {
  const declarations: Record<string, string> = {
    'font-family': `"${family}"`,
    src: `url("${source}") format("woff2")`,
    'unicode-range': unicodeRange,
  };
  const body = Object.entries(declarations)
    .map(([property, value]) => `${property}: ${value};`)
    .join(' ');

  return Object.create(CSSFontFaceRule.prototype, {
    cssText: { value: `@font-face { ${body} }` },
    style: { value: { getPropertyValue: (property: string) => declarations[property] ?? '' } },
  });
};

const importRule = (styleSheet: object): CSSImportRule =>
  Object.create(CSSImportRule.prototype, { styleSheet: { value: styleSheet } });

export const fontResponse = (ok: boolean): Response =>
  ({ ok, blob: async () => new Blob(['font'], { type: 'font/woff2' }) }) as Response;

export const glyphContext = (text: string, family: string): ICanvasExportContext =>
  exportContext({
    fonts: new Set([family]),
    codePoints: new Set(Array.from(text, (character) => character.codePointAt(0) ?? 0)),
  });

export const stubFontSheets = () => {
  stubProperty(document, 'styleSheets', [
    {
      href: 'https://cdn.test/theme.css',
      get cssRules(): CSSRule[] {
        throw new DOMException('Cannot access rules', 'SecurityError');
      },
    },
    {
      href: 'https://app.test/fonts/fonts.css',
      cssRules: [
        importRule({
          href: 'https://app.test/fonts/latin.css',
          cssRules: [fontFace(FONT_FIXTURE.family, 'latin.woff2', 'U+0000-00FF')],
        }),
        fontFace(FONT_FIXTURE.family, FONT_FIXTURE.inlineSource, 'U+0020'),
        fontFace(FONT_FIXTURE.family, FONT_FIXTURE.cyrillicSource, 'U+0400-045F'),
        fontFace(FONT_FIXTURE.otherFamily, 'mono.woff2', ''),
      ],
    },
  ]);
  stubProperty(
    globalThis,
    'fetch',
    vi.fn(async () => fontResponse(true)),
  );
};
