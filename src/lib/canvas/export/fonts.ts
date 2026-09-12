'use client';

import type { ICanvasExportContext, IExportCodePointRange, IExportFontFace } from '@interfaces';

import { CSS_URL_PATTERN, EXPORT_FONT_TIMEOUT_MS, QUOTES_PATTERN, UNICODE_RANGE_PATTERN } from './consts';
import { splitCssList, svgElement } from './primitives';

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the export resource'));
    reader.readAsDataURL(blob);
  });

export const parseUnicodeRanges = (value: string): IExportCodePointRange[] =>
  splitCssList(value).flatMap((range) => {
    const [, start, end] = range.match(UNICODE_RANGE_PATTERN) ?? [];
    if (!start) return [];

    return [
      {
        start: parseInt(start.replaceAll('?', '0'), 16),
        end: parseInt(end ?? start.replaceAll('?', 'F'), 16),
      },
    ];
  });

const coversCodePoints = (ranges: IExportCodePointRange[], codePoints: Set<number>): boolean =>
  ranges.length === 0 ||
  Array.from(codePoints).some((codePoint) => ranges.some(({ start, end }) => codePoint >= start && codePoint <= end));

const collectFontFaces = (sheets: CSSStyleSheet[]): IExportFontFace[] =>
  sheets.flatMap((sheet) => {
    try {
      return Array.from(sheet.cssRules).flatMap((rule) => {
        if (rule instanceof CSSImportRule && rule.styleSheet) return collectFontFaces([rule.styleSheet]);
        if (!(rule instanceof CSSFontFaceRule)) return [];

        return [
          {
            family: rule.style.getPropertyValue('font-family').replace(QUOTES_PATTERN, '').trim(),
            ranges: parseUnicodeRanges(rule.style.getPropertyValue('unicode-range')),
            css: rule.cssText,
            baseUrl: sheet.href ?? document.baseURI,
          },
        ];
      });
    } catch {
      return [];
    }
  });

const fetchDataUrl = (url: string): Promise<string> =>
  fetch(url, { signal: AbortSignal.timeout(EXPORT_FONT_TIMEOUT_MS) }).then(async (response) => {
    if (!response.ok) throw new Error('Could not load an export font');

    return blobToDataUrl(await response.blob());
  });

const inlineFontResources = async (
  { css, baseUrl }: IExportFontFace,
  resources: Map<string, Promise<string>>,
): Promise<string> => {
  const replacements = await Promise.all(
    Array.from(css.matchAll(CSS_URL_PATTERN), async ([match, , source]) => {
      if (!source || source.startsWith('data:')) return { match, value: match };
      const url = new URL(source, baseUrl).href;
      if (!resources.has(url)) resources.set(url, fetchDataUrl(url));

      return { match, value: `url("${await resources.get(url)}")` };
    }),
  );

  return replacements.reduce((result, { match, value }) => result.replace(match, value), css);
};

export const embedExportFonts = async ({ fonts, codePoints }: ICanvasExportContext): Promise<SVGStyleElement> => {
  const usedFamilies = new Set(
    Array.from(fonts).flatMap((family) => splitCssList(family).map((name) => name.replace(QUOTES_PATTERN, ''))),
  );
  const faces = collectFontFaces(Array.from(document.styleSheets)).filter(
    (face) => usedFamilies.has(face.family) && coversCodePoints(face.ranges, codePoints),
  );
  const resources = new Map<string, Promise<string>>();
  const style = svgElement('style');
  style.textContent = (await Promise.all(faces.map((face) => inlineFontResources(face, resources)))).join('\n');

  return style;
};
