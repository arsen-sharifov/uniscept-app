import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type { IIntegrationAccount, IIntegrationResponse } from '../../interfaces';
import { deleteAccounts, getUserClient, readAccountMetadata, seedAccount, seedAccountMetadata } from '../../utils';

let newcomer: IIntegrationAccount;
let owner: IIntegrationAccount;
let stranger: IIntegrationAccount;
let tinkerer: IIntegrationAccount;
let newcomerClient: SupabaseClient;
let ownerClient: SupabaseClient;
let strangerClient: SupabaseClient;
let tinkererClient: SupabaseClient;

beforeAll(async () => {
  [newcomer, owner, stranger, tinkerer] = await Promise.all([
    seedAccount('locale-newcomer'),
    seedAccount('locale-owner'),
    seedAccount('locale-stranger'),
    seedAccount('locale-tinkerer'),
  ]);
  [newcomerClient, ownerClient, strangerClient, tinkererClient] = await Promise.all([
    getUserClient(newcomer),
    getUserClient(owner),
    getUserClient(stranger),
    getUserClient(tinkerer),
  ]);
});

afterAll(async () => {
  await deleteAccounts(newcomer, owner, stranger, tinkerer);
});

describe('account locale', () => {
  describe('GIVEN an account that never saved preferences', () => {
    describe('WHEN it saves its first preferences in Ukrainian, the way the app does', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await newcomerClient.from('user_preferences').upsert({ user_id: newcomer.id, language: 'uk' });
      });

      test('THEN the account carries the language for its emails and keeps the rest of its metadata', async () => {
        expect(response.error).toBeNull();
        await expect(readAccountMetadata(newcomer.id)).resolves.toMatchObject({
          name: 'Integration locale-newcomer',
          locale: 'uk',
        });
      });
    });
  });

  describe('GIVEN an account that saved its preferences in Ukrainian', () => {
    beforeEach(async () => {
      await ownerClient.from('user_preferences').upsert({ user_id: owner.id, language: 'uk' });
    });

    describe('WHEN it switches the language to French', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await ownerClient.from('user_preferences').update({ language: 'fr' }).eq('user_id', owner.id);
      });

      test('THEN its emails follow the new language', async () => {
        expect(response.error).toBeNull();
        await expect(readAccountMetadata(owner.id)).resolves.toMatchObject({ locale: 'fr' });
      });
    });

    describe('WHEN another account tries to switch it to Spanish', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await strangerClient.from('user_preferences').update({ language: 'es' }).eq('user_id', owner.id);
      });

      test('THEN nothing changes and its emails stay in Ukrainian', async () => {
        expect(response.error).toBeNull();
        await expect(readAccountMetadata(owner.id)).resolves.toMatchObject({ locale: 'uk' });
      });
    });
  });

  describe('GIVEN an account with Ukrainian preferences whose email language was later set elsewhere', () => {
    beforeEach(async () => {
      await tinkererClient.from('user_preferences').upsert({ user_id: tinkerer.id, language: 'uk' });
      await seedAccountMetadata(tinkerer.id, { locale: 'es' });
    });

    describe('WHEN only the theme changes and the app saves every preference again', () => {
      let response: IIntegrationResponse;

      beforeEach(async () => {
        response = await tinkererClient
          .from('user_preferences')
          .upsert({ user_id: tinkerer.id, language: 'uk', theme: 'eclipse' });
      });

      test('THEN the account metadata is left alone because the language did not change', async () => {
        expect(response.error).toBeNull();
        await expect(readAccountMetadata(tinkerer.id)).resolves.toMatchObject({ locale: 'es' });
      });
    });
  });
});
