import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { REMEMBERED_RESET_REQUEST } from '@mocks/authApi';
import { useAuthFlowStore } from '@/lib/stores';

afterEach(() => {
  useAuthFlowStore.getState().reset();
});

describe('authFlowStore', () => {
  describe('GIVEN the initial store', () => {
    describe('WHEN an email is handed over and a reset request is remembered', () => {
      beforeEach(() => {
        useAuthFlowStore.getState().setDraftEmail('ada@example.com');
        useAuthFlowStore.getState().rememberResetRequest(REMEMBERED_RESET_REQUEST);
      });

      test('THEN both are kept', () => {
        expect(useAuthFlowStore.getState()).toMatchObject({
          draftEmail: 'ada@example.com',
          resetRequest: REMEMBERED_RESET_REQUEST,
        });
      });
    });
  });

  describe('GIVEN a handed over email and a remembered request', () => {
    beforeEach(() => {
      useAuthFlowStore.getState().setDraftEmail('ada@example.com');
      useAuthFlowStore.getState().rememberResetRequest(REMEMBERED_RESET_REQUEST);
    });

    describe('WHEN the handed over email is cleared', () => {
      beforeEach(() => {
        useAuthFlowStore.getState().clearDraftEmail();
      });

      test('THEN only the email is gone and the request stays', () => {
        expect(useAuthFlowStore.getState()).toMatchObject({ draftEmail: '', resetRequest: REMEMBERED_RESET_REQUEST });
      });
    });

    describe('WHEN the store is reset', () => {
      beforeEach(() => {
        useAuthFlowStore.getState().reset();
      });

      test('THEN everything is gone', () => {
        expect(useAuthFlowStore.getState()).toMatchObject({ draftEmail: '', resetRequest: null });
      });
    });
  });
});
