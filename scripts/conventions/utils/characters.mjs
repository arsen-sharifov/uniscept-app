import { HIDDEN_CHARACTER } from '../consts.mjs';

const toCodePoint = (character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

export const findHiddenCharacters = (text) =>
  text
    .split('\n')
    .flatMap((content, index) =>
      [...content].flatMap((character, position) =>
        HIDDEN_CHARACTER.test(character)
          ? [{ line: index + 1, column: position + 1, codePoint: toCodePoint(character) }]
          : [],
      ),
    );
