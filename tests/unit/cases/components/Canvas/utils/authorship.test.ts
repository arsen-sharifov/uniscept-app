import { describe, expect, test } from 'vitest';

import { toShortName } from '@/components/Canvas/utils';

describe('toShortName', () => {
  describe('GIVEN a first and a last name', () => {
    describe('WHEN it is shortened', () => {
      test('THEN the last name turns into its initial', () => {
        expect(toShortName('Олена Коваленко')).toBe('Олена К.');
      });
    });
  });

  describe('GIVEN a double-barrelled last name after a middle name', () => {
    describe('WHEN it is shortened', () => {
      test('THEN the first name stays with the initial of the last word', () => {
        expect(toShortName('Anna Maria литвиненко-Шевчук')).toBe('Anna Л.');
      });
    });
  });

  describe('GIVEN a single name with stray spaces', () => {
    describe('WHEN it is shortened', () => {
      test('THEN the trimmed name stays whole', () => {
        expect(toShortName('  Dev ')).toBe('Dev');
      });
    });
  });

  describe('GIVEN a last name that starts with a character outside the basic plane', () => {
    describe('WHEN it is shortened', () => {
      test('THEN the initial keeps the whole character', () => {
        expect(toShortName('Ada 𝒳avier')).toBe('Ada 𝒳.');
      });
    });
  });

  describe('GIVEN a name made only of spaces', () => {
    describe('WHEN it is shortened', () => {
      test('THEN it stays empty', () => {
        expect(toShortName('   ')).toBe('');
      });
    });
  });
});
