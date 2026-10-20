import { describe, expect, test } from 'vitest';

import { EMPTY_DOCUMENT_JSON, PARSED_UNTRUSTED_DOCUMENT, SHOWCASE_DOCUMENT, UNTRUSTED_DOCUMENT } from '@mocks/richText';
import { isTextColor, parseRichText } from '@/lib/richText';

describe('parseRichText', () => {
  describe('GIVEN a document the editor wrote', () => {
    describe('WHEN it is parsed', () => {
      test('THEN every supported node and mark survives unchanged', () => {
        expect(parseRichText(SHOWCASE_DOCUMENT)).toEqual(SHOWCASE_DOCUMENT);
      });
    });
  });

  describe('GIVEN an untrusted document with unknown nodes, marks and attributes', () => {
    describe('WHEN it is parsed', () => {
      test('THEN only the supported structure, safe links and palette colors remain', () => {
        expect(parseRichText(UNTRUSTED_DOCUMENT)).toEqual(PARSED_UNTRUSTED_DOCUMENT);
      });
    });
  });

  describe('GIVEN a document whose blocks are all dropped', () => {
    describe('WHEN it is parsed', () => {
      test('THEN no document is returned', () => {
        expect(parseRichText(EMPTY_DOCUMENT_JSON)).toBeNull();
      });
    });
  });

  describe('GIVEN a value that is not a document', () => {
    describe('WHEN it is parsed', () => {
      test('THEN null, arrays, strings and other node types are rejected', () => {
        expect(parseRichText(null)).toBeNull();
        expect(parseRichText([SHOWCASE_DOCUMENT])).toBeNull();
        expect(parseRichText('doc')).toBeNull();
        expect(parseRichText({ type: 'paragraph', content: [] })).toBeNull();
      });
    });
  });
});

describe('isTextColor', () => {
  describe('GIVEN a palette key and an arbitrary color', () => {
    describe('WHEN they are checked', () => {
      test('THEN only the palette key is accepted', () => {
        expect(isTextColor('violet')).toBe(true);
        expect(isTextColor('#ff0000')).toBe(false);
        expect(isTextColor(undefined)).toBe(false);
      });
    });
  });
});
