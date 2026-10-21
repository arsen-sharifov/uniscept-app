import { describe, expect, test } from 'vitest';

import { OVERLONG_LINK } from '@mocks/richText';
import { isSafeLink, normalizeLink } from '@/lib/richText';

describe('isSafeLink', () => {
  describe('GIVEN a web address', () => {
    describe('WHEN it is checked', () => {
      test('THEN https and http links are allowed', () => {
        expect(isSafeLink('https://example.com/a?b=c')).toBe(true);
        expect(isSafeLink('http://example.com')).toBe(true);
      });
    });
  });

  describe('GIVEN an email link', () => {
    describe('WHEN it is checked', () => {
      test('THEN the mailto link is allowed', () => {
        expect(isSafeLink('mailto:team@example.com')).toBe(true);
      });
    });
  });

  describe('GIVEN a script, data or file transfer link', () => {
    describe('WHEN it is checked', () => {
      test('THEN the link is refused even with leading spaces', () => {
        expect(isSafeLink('javascript:alert(1)')).toBe(false);
        expect(isSafeLink(' javascript:alert(1)')).toBe(false);
        expect(isSafeLink('data:text/html,<b>x</b>')).toBe(false);
        expect(isSafeLink('ftp://example.com')).toBe(false);
      });
    });
  });

  describe('GIVEN a web address longer than any browser accepts', () => {
    describe('WHEN it is checked and normalized', () => {
      test('THEN it is refused', () => {
        expect(isSafeLink(OVERLONG_LINK)).toBe(false);
        expect(normalizeLink(OVERLONG_LINK)).toBeNull();
      });
    });
  });

  describe('GIVEN an address without a scheme', () => {
    describe('WHEN it is checked', () => {
      test('THEN bare domains, relative paths and empty strings are refused', () => {
        expect(isSafeLink('example.com')).toBe(false);
        expect(isSafeLink('/relative/path')).toBe(false);
        expect(isSafeLink('')).toBe(false);
      });
    });
  });
});

describe('normalizeLink', () => {
  describe('GIVEN a padded bare domain', () => {
    describe('WHEN it is normalized', () => {
      test('THEN it becomes an https link', () => {
        expect(normalizeLink('  example.com/docs ')).toBe('https://example.com/docs');
      });
    });
  });

  describe('GIVEN a full web address', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the parsed address is returned', () => {
        expect(normalizeLink('https://example.com')).toBe('https://example.com/');
      });
    });
  });

  describe('GIVEN an email address', () => {
    describe('WHEN it is normalized with and without the scheme', () => {
      test('THEN both become the same mailto link', () => {
        expect(normalizeLink('team@example.com')).toBe('mailto:team@example.com');
        expect(normalizeLink('mailto:team@example.com')).toBe('mailto:team@example.com');
      });
    });
  });

  describe('GIVEN a domain with a port', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the port is not mistaken for a scheme', () => {
        expect(normalizeLink('example.com:8080/path')).toBe('https://example.com:8080/path');
      });
    });
  });

  describe('GIVEN an address with an at sign inside a path', () => {
    describe('WHEN it is normalized', () => {
      test('THEN it is treated as a web address', () => {
        expect(normalizeLink('user@example.com/path')).toBe('https://user@example.com/path');
      });
    });
  });

  describe('GIVEN something that is not an email address', () => {
    describe('WHEN it has two at signs or no dot in the domain', () => {
      test('THEN it is treated as a web address', () => {
        expect(normalizeLink('a@b@example.com')).toBe('https://a%40b@example.com/');
        expect(normalizeLink('team@localhost')).toBe('https://team@localhost/');
      });
    });
  });

  describe('GIVEN an unsafe or empty input', () => {
    describe('WHEN it is normalized', () => {
      test('THEN no link is produced', () => {
        expect(normalizeLink('javascript:alert(1)')).toBeNull();
        expect(normalizeLink('   ')).toBeNull();
      });
    });
  });
});
