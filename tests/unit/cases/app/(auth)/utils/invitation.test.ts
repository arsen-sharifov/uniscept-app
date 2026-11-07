import { describe, expect, test } from 'vitest';

import { FINISHED_INVITEE, UNFINISHED_INVITEE } from '@mocks/authApi';
import { NAMED_ACCOUNT } from '@mocks/userApi';
import { isUnfinishedInvitee } from '@/app/(auth)/utils';

describe('isUnfinishedInvitee', () => {
  describe('GIVEN an invited teammate who never completed the account', () => {
    describe('WHEN the account is checked', () => {
      test('THEN the setup is still owed', () => {
        expect(isUnfinishedInvitee(UNFINISHED_INVITEE)).toBe(true);
      });
    });
  });

  describe('GIVEN an invited teammate who completed the account', () => {
    describe('WHEN the account is checked', () => {
      test('THEN nothing is owed', () => {
        expect(isUnfinishedInvitee(FINISHED_INVITEE)).toBe(false);
      });
    });
  });

  describe('GIVEN a person who signed up without an invitation', () => {
    describe('WHEN the account is checked', () => {
      test('THEN nothing is owed', () => {
        expect(isUnfinishedInvitee(NAMED_ACCOUNT)).toBe(false);
      });
    });
  });
});
