import { describe, expect, test } from 'vitest';

import {
  BLANK_DOCUMENT,
  BROKEN_LINE_DOCUMENT,
  FORMATTED_DOCUMENT,
  FORMATTED_TEXT,
  LEADING_LIST_DOCUMENT,
  PADDED_DOCUMENT,
  PLAIN_DOCUMENT,
  PLAIN_TEXT,
  RESTYLED_DOCUMENT,
  SHOWCASE_DOCUMENT,
  SHOWCASE_TEXT,
  TRIMMED_LEADING_LIST_DOCUMENT,
  TRIMMED_PADDED_DOCUMENT,
} from '@mocks/richText';
import {
  fromPlainText,
  isBlankRichText,
  isPlainDocument,
  isSameRichText,
  isSameRichTextValue,
  toPlainText,
  toRichTextValue,
  trimRichText,
} from '@/lib/richText';

describe('toPlainText', () => {
  describe('GIVEN a document with paragraphs, lists and a line break', () => {
    describe('WHEN it is flattened', () => {
      test('THEN every paragraph and list item lands on its own line without markers', () => {
        expect(toPlainText(SHOWCASE_DOCUMENT)).toBe(SHOWCASE_TEXT);
      });
    });
  });

  describe('GIVEN a document with an empty paragraph', () => {
    describe('WHEN it is flattened', () => {
      test('THEN the empty paragraph becomes a blank line', () => {
        expect(toPlainText(PLAIN_DOCUMENT)).toBe(PLAIN_TEXT);
      });
    });
  });
});

describe('fromPlainText', () => {
  describe('GIVEN legacy text with a blank line', () => {
    describe('WHEN it is turned into a document', () => {
      test('THEN each line becomes a paragraph and the round trip keeps the text', () => {
        expect(fromPlainText(PLAIN_TEXT)).toEqual(PLAIN_DOCUMENT);
        expect(toPlainText(fromPlainText(PLAIN_TEXT))).toBe(PLAIN_TEXT);
      });
    });
  });

  describe('GIVEN an empty label', () => {
    describe('WHEN it is turned into a document', () => {
      test('THEN the document holds one empty paragraph', () => {
        expect(fromPlainText('')).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] });
      });
    });
  });
});

describe('isPlainDocument', () => {
  describe('GIVEN paragraphs with unmarked text and line breaks', () => {
    describe('WHEN the document is checked', () => {
      test('THEN it counts as plain', () => {
        expect(isPlainDocument(PLAIN_DOCUMENT)).toBe(true);
        expect(isPlainDocument(BROKEN_LINE_DOCUMENT)).toBe(true);
      });
    });
  });

  describe('GIVEN a document with a mark or a list', () => {
    describe('WHEN the document is checked', () => {
      test('THEN it counts as formatted', () => {
        expect(isPlainDocument(FORMATTED_DOCUMENT)).toBe(false);
        expect(isPlainDocument(TRIMMED_LEADING_LIST_DOCUMENT)).toBe(false);
      });
    });
  });
});

describe('isBlankRichText', () => {
  describe('GIVEN a document with only spaces, breaks and empty paragraphs', () => {
    describe('WHEN it is checked', () => {
      test('THEN it counts as blank', () => {
        expect(isBlankRichText(BLANK_DOCUMENT)).toBe(true);
      });
    });
  });

  describe('GIVEN a document with formatted text', () => {
    describe('WHEN it is checked', () => {
      test('THEN it is not blank', () => {
        expect(isBlankRichText(FORMATTED_DOCUMENT)).toBe(false);
      });
    });
  });
});

describe('isSameRichText', () => {
  describe('GIVEN two missing documents or the same reference', () => {
    describe('WHEN they are compared', () => {
      test('THEN they are the same', () => {
        expect(isSameRichText(undefined, undefined)).toBe(true);
        expect(isSameRichText(FORMATTED_DOCUMENT, FORMATTED_DOCUMENT)).toBe(true);
      });
    });
  });

  describe('GIVEN equal documents built separately', () => {
    describe('WHEN they are compared', () => {
      test('THEN they are the same', () => {
        expect(isSameRichText(FORMATTED_DOCUMENT, structuredClone(FORMATTED_DOCUMENT))).toBe(true);
      });
    });
  });

  describe('GIVEN a changed mark or a missing document', () => {
    describe('WHEN they are compared', () => {
      test('THEN they differ', () => {
        expect(isSameRichText(FORMATTED_DOCUMENT, RESTYLED_DOCUMENT)).toBe(false);
        expect(isSameRichText(FORMATTED_DOCUMENT, undefined)).toBe(false);
        expect(isSameRichText(undefined, FORMATTED_DOCUMENT)).toBe(false);
      });
    });
  });
});

describe('isSameRichTextValue', () => {
  describe('GIVEN an editor value with the stored text and formatting', () => {
    describe('WHEN it is compared with what is stored', () => {
      test('THEN it is the same', () => {
        expect(
          isSameRichTextValue(
            { text: FORMATTED_TEXT, document: FORMATTED_DOCUMENT },
            FORMATTED_TEXT,
            FORMATTED_DOCUMENT,
          ),
        ).toBe(true);
      });
    });
  });

  describe('GIVEN an editor value with other text', () => {
    describe('WHEN it is compared with what is stored', () => {
      test('THEN it differs', () => {
        expect(isSameRichTextValue({ text: 'Other' }, FORMATTED_TEXT)).toBe(false);
      });
    });
  });

  describe('GIVEN an editor value with the stored text in other formatting', () => {
    describe('WHEN it is compared with what is stored', () => {
      test('THEN it differs', () => {
        expect(
          isSameRichTextValue(
            { text: FORMATTED_TEXT, document: RESTYLED_DOCUMENT },
            FORMATTED_TEXT,
            FORMATTED_DOCUMENT,
          ),
        ).toBe(false);
      });
    });
  });
});

describe('trimRichText', () => {
  describe('GIVEN blank blocks, breaks and spaces around the content', () => {
    describe('WHEN the document is trimmed', () => {
      test('THEN the edges are trimmed like the plain text and the inner blank line stays', () => {
        expect(trimRichText(PADDED_DOCUMENT)).toEqual(TRIMMED_PADDED_DOCUMENT);
        expect(toPlainText(TRIMMED_PADDED_DOCUMENT)).toBe(toPlainText(PADDED_DOCUMENT).trim());
      });
    });
  });

  describe('GIVEN a single list with a blank first item', () => {
    describe('WHEN the document is trimmed', () => {
      test('THEN the blank item goes and the remaining item is trimmed on both sides', () => {
        expect(trimRichText(LEADING_LIST_DOCUMENT)).toEqual(TRIMMED_LEADING_LIST_DOCUMENT);
      });
    });
  });

  describe('GIVEN a document with only whitespace', () => {
    describe('WHEN the document is trimmed', () => {
      test('THEN nothing is left', () => {
        expect(trimRichText(BLANK_DOCUMENT)).toBeNull();
      });
    });
  });
});

describe('toRichTextValue', () => {
  describe('GIVEN a formatted document', () => {
    describe('WHEN it is turned into a value', () => {
      test('THEN the plain text and the document are both kept', () => {
        expect(toRichTextValue(FORMATTED_DOCUMENT)).toEqual({ text: FORMATTED_TEXT, document: FORMATTED_DOCUMENT });
      });
    });
  });

  describe('GIVEN a document without formatting', () => {
    describe('WHEN it is turned into a value', () => {
      test('THEN only the plain text is kept', () => {
        expect(toRichTextValue(PLAIN_DOCUMENT)).toEqual({ text: PLAIN_TEXT });
      });
    });
  });

  describe('GIVEN a document with only whitespace', () => {
    describe('WHEN it is turned into a value', () => {
      test('THEN the text is empty', () => {
        expect(toRichTextValue(BLANK_DOCUMENT)).toEqual({ text: '' });
      });
    });
  });
});
