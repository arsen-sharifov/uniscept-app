import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { AuthNotice } from '@/app/(auth)/fragments';

afterEach(() => {
  cleanup();
});

describe('AuthNotice', () => {
  describe('GIVEN a problem the visitor has to know about', () => {
    describe('WHEN the alert notice renders', () => {
      beforeEach(() => {
        render(<AuthNotice tone="alert">{TRANSLATIONS.auth.signIn.invalidLink}</AuthNotice>);
      });

      test('THEN it is announced at once', () => {
        expect(screen.getByRole('alert')).toHaveTextContent(TRANSLATIONS.auth.signIn.invalidLink);
      });
    });
  });

  describe('GIVEN news about what happens next', () => {
    describe('WHEN the notice renders', () => {
      beforeEach(() => {
        render(<AuthNotice tone="notice">{TRANSLATIONS.auth.signIn.emailSent}</AuthNotice>);
      });

      test('THEN it is announced politely as a status', () => {
        expect(screen.getByRole('status')).toHaveTextContent(TRANSLATIONS.auth.signIn.emailSent);
        expect(screen.queryByRole('alert')).toBeNull();
      });
    });
  });
});
