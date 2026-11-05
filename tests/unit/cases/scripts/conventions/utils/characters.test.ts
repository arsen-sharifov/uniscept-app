import { beforeEach, describe, expect, test } from 'vitest';

import {
  HIDDEN_CHARACTER_FINDINGS,
  TEXT_WITH_HIDDEN_CHARACTERS,
  TEXT_WITHOUT_HIDDEN_CHARACTERS,
} from '@mocks/conventions';

import { findHiddenCharacters } from '../../../../../../scripts/conventions/utils/characters.mjs';

describe('findHiddenCharacters', () => {
  describe('GIVEN text with bidirectional, tag and filler characters', () => {
    describe('WHEN the text is checked', () => {
      let findings: unknown[];

      beforeEach(() => {
        findings = findHiddenCharacters(TEXT_WITH_HIDDEN_CHARACTERS);
      });

      test('THEN every hidden character is reported with its position', () => {
        expect(findings).toEqual(HIDDEN_CHARACTER_FINDINGS);
      });
    });
  });

  describe('GIVEN text with visible characters only', () => {
    describe('WHEN the text is checked', () => {
      let findings: unknown[];

      beforeEach(() => {
        findings = findHiddenCharacters(TEXT_WITHOUT_HIDDEN_CHARACTERS);
      });

      test('THEN nothing is reported', () => {
        expect(findings).toEqual([]);
      });
    });
  });
});
