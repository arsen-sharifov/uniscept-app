import { beforeEach, describe, expect, test } from 'vitest';

import {
  ACCOUNT_SUFFIX,
  BROKEN_STATUS,
  LOCAL_STATUS,
  LOCAL_SUPABASE,
  REMOTE_STATUS,
  REMOTE_STATUS_ERROR,
  STOPPED_STATUS,
  STOPPED_STATUS_ERROR,
  VERIFIER_CREDENTIALS,
} from '@mocks/verify';

import { createCredentials, readLocalSupabase } from '../../../../../../scripts/verify/utils/supabase.mjs';

describe('readLocalSupabase', () => {
  describe('GIVEN the status of a running local stack', () => {
    describe('WHEN the status is read', () => {
      let result: object;

      beforeEach(() => {
        result = readLocalSupabase(LOCAL_STATUS);
      });

      test('THEN it returns the local URL and the secret key', () => {
        expect(result).toEqual(LOCAL_SUPABASE);
      });
    });
  });

  describe('GIVEN a status that points at a hosted project', () => {
    describe('WHEN the status is read', () => {
      let result: object;

      beforeEach(() => {
        result = readLocalSupabase(REMOTE_STATUS);
      });

      test('THEN it refuses the hosted project', () => {
        expect(result).toEqual({ error: REMOTE_STATUS_ERROR });
      });
    });
  });

  describe('GIVEN no status because the local stack is stopped', () => {
    describe('WHEN the status is read', () => {
      let result: object;

      beforeEach(() => {
        result = readLocalSupabase(STOPPED_STATUS);
      });

      test('THEN it asks to start the local Supabase', () => {
        expect(result).toEqual({ error: STOPPED_STATUS_ERROR });
      });
    });
  });

  describe('GIVEN a status that is cut off', () => {
    describe('WHEN the status is read', () => {
      let result: object;

      beforeEach(() => {
        result = readLocalSupabase(BROKEN_STATUS);
      });

      test('THEN it asks to start the local Supabase', () => {
        expect(result).toEqual({ error: STOPPED_STATUS_ERROR });
      });
    });
  });
});

describe('createCredentials', () => {
  describe('GIVEN a random suffix', () => {
    describe('WHEN the credentials are created', () => {
      let credentials: object;

      beforeEach(() => {
        credentials = createCredentials(ACCOUNT_SUFFIX);
      });

      test('THEN the email and the password carry the suffix', () => {
        expect(credentials).toEqual(VERIFIER_CREDENTIALS);
      });
    });
  });
});
