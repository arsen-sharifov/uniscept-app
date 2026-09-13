import { beforeEach, describe, expect, test, vi } from 'vitest';

import { LATIN_UNICODE_RANGE } from '@mocks/canvasExport';
import { FONT_FIXTURE, fontResponse, glyphContext, installFontFaces } from '@mocks/canvasExportDom';
import { embedExportFonts, parseUnicodeRanges } from '@/lib/canvas/export';

let style: SVGStyleElement;

describe('parseUnicodeRanges', () => {
  describe('GIVEN a unicode-range with single points, spans and a wildcard', () => {
    describe('WHEN the ranges are parsed', () => {
      test('THEN every form becomes an inclusive code point span', () => {
        expect(parseUnicodeRanges(LATIN_UNICODE_RANGE)).toEqual([
          { start: 0x0000, end: 0x00ff },
          { start: 0x0131, end: 0x0131 },
          { start: 0x2000, end: 0x206f },
          { start: 0x400, end: 0x4ff },
        ]);
      });
    });
  });

  describe('GIVEN a face without a unicode-range', () => {
    describe('WHEN the ranges are parsed', () => {
      test('THEN no span is produced', () => {
        expect(parseUnicodeRanges('')).toEqual([]);
      });
    });
  });
});

describe('embedExportFonts', () => {
  describe('GIVEN Latin and Cyrillic faces of the used family plus an unrelated family', () => {
    beforeEach(() => {
      installFontFaces();
    });

    describe('WHEN an English graph embeds its fonts', () => {
      beforeEach(async () => {
        style = await embedExportFonts(glyphContext('Origin claim', `"${FONT_FIXTURE.family}", sans-serif`));
      });

      test('THEN only the Latin face is inlined as a data URL', () => {
        expect(style.textContent).toContain(`url("${FONT_FIXTURE.dataUrl}")`);
        expect(style.textContent).not.toContain(FONT_FIXTURE.cyrillicSource);
        expect(style.textContent).not.toContain(FONT_FIXTURE.otherFamily);
        expect(fetch).toHaveBeenCalledExactlyOnceWith(FONT_FIXTURE.latinUrl, expect.anything());
      });

      test('THEN faces behind @import are followed, inaccessible sheets are skipped and data URLs are kept', () => {
        expect(style.textContent).toContain(`url("${FONT_FIXTURE.inlineSource}")`);
        expect(fetch).toHaveBeenCalledExactlyOnceWith(
          FONT_FIXTURE.latinUrl,
          expect.objectContaining({ signal: expect.any(AbortSignal) }),
        );
      });
    });

    describe('WHEN a Ukrainian graph embeds its fonts', () => {
      beforeEach(async () => {
        style = await embedExportFonts(glyphContext('Рішення', FONT_FIXTURE.family));
      });

      test('THEN the Cyrillic face is fetched instead', () => {
        expect(fetch).toHaveBeenCalledExactlyOnceWith(FONT_FIXTURE.cyrillicUrl, expect.anything());
        expect(style.textContent).toContain(`url("${FONT_FIXTURE.dataUrl}")`);
      });
    });

    describe('WHEN the font file cannot be fetched', () => {
      beforeEach(() => {
        vi.mocked(fetch).mockResolvedValue(fontResponse(false));
      });

      test('THEN the export fails instead of shipping a broken face', async () => {
        await expect(embedExportFonts(glyphContext('Origin', FONT_FIXTURE.family))).rejects.toThrow(
          'Could not load an export font',
        );
      });
    });
  });
});
