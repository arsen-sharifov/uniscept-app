import { describe, expect, test } from 'vitest';

import { PASSWORD_RESET_RESEND_WINDOW_SECONDS } from '@constants';
import {
  EXPIRED_RESET_REQUEST,
  FORGED_RESET_REQUEST,
  PENDING_RESET,
  REMEMBERED_RESET_REQUEST,
  RESET_CLOCK,
  RESET_REQUEST_COOKIE_VALUE,
  SHOUTED_RESET_REQUEST,
  STALE_PENDING_RESET,
} from '@mocks/authApi';
import {
  readPasswordResetCookie,
  restorePasswordReset,
  toPasswordResetCookie,
  toPendingPasswordReset,
  toSecondsLeft,
} from '@/lib/utils';

describe('toPasswordResetCookie', () => {
  describe('GIVEN a reset request', () => {
    describe('WHEN it is written into the cookie', () => {
      test('THEN the time of the next allowed request comes first and the email after it', () => {
        expect(toPasswordResetCookie(REMEMBERED_RESET_REQUEST)).toBe(RESET_REQUEST_COOKIE_VALUE);
      });
    });
  });
});

describe('readPasswordResetCookie', () => {
  describe('GIVEN a cookie written for a reset request', () => {
    describe('WHEN it is read back', () => {
      test('THEN the same request comes out', () => {
        expect(readPasswordResetCookie(RESET_REQUEST_COOKIE_VALUE)).toEqual(REMEMBERED_RESET_REQUEST);
      });
    });
  });

  describe('GIVEN no cookie', () => {
    describe('WHEN it is read', () => {
      test('THEN there is no request', () => {
        expect(readPasswordResetCookie(undefined)).toBeNull();
      });
    });
  });

  describe('GIVEN a cookie someone edited by hand', () => {
    describe('WHEN a value without a time, with a broken time or without a valid email is read', () => {
      test('THEN none of them counts as a request', () => {
        expect(readPasswordResetCookie('ada@example.com')).toBeNull();
        expect(readPasswordResetCookie(':ada@example.com')).toBeNull();
        expect(readPasswordResetCookie('soon:ada@example.com')).toBeNull();
        expect(readPasswordResetCookie(`${RESET_CLOCK}:not-an-email`)).toBeNull();
      });
    });
  });
});

describe('toPendingPasswordReset', () => {
  describe('GIVEN a request whose pause is still running', () => {
    describe('WHEN it is turned into the state of the page', () => {
      test('THEN the email and the whole seconds that are left come out', () => {
        expect(toPendingPasswordReset(REMEMBERED_RESET_REQUEST, RESET_CLOCK + 500)).toEqual(PENDING_RESET);
      });
    });
  });

  describe('GIVEN a request whose pause is over', () => {
    describe('WHEN it is turned into the state of the page', () => {
      test('THEN the form is shown again', () => {
        expect(toPendingPasswordReset(EXPIRED_RESET_REQUEST, RESET_CLOCK)).toBeNull();
      });
    });
  });

  describe('GIVEN no request', () => {
    describe('WHEN it is turned into the state of the page', () => {
      test('THEN the form is shown', () => {
        expect(toPendingPasswordReset(null, RESET_CLOCK)).toBeNull();
      });
    });
  });
});

describe('toSecondsLeft', () => {
  describe('GIVEN a time far beyond the pause, as a hand edited cookie could carry', () => {
    describe('WHEN the seconds left are counted', () => {
      test('THEN they never exceed the pause', () => {
        expect(toSecondsLeft(FORGED_RESET_REQUEST.resendAt, RESET_CLOCK)).toBe(PASSWORD_RESET_RESEND_WINDOW_SECONDS);
      });
    });
  });

  describe('GIVEN a time already passed', () => {
    describe('WHEN the seconds left are counted', () => {
      test('THEN none are left', () => {
        expect(toSecondsLeft(EXPIRED_RESET_REQUEST.resendAt, RESET_CLOCK)).toBe(0);
      });
    });
  });
});

describe('restorePasswordReset', () => {
  describe('GIVEN a request remembered in the browser and an older answer of the server', () => {
    describe('WHEN the page state is restored', () => {
      test('THEN the remembered request wins with its own time', () => {
        expect(restorePasswordReset(REMEMBERED_RESET_REQUEST, STALE_PENDING_RESET, '', RESET_CLOCK)).toEqual({
          ...REMEMBERED_RESET_REQUEST,
          secondsLeft: PENDING_RESET.secondsLeft,
        });
      });
    });
  });

  describe('GIVEN a remembered request whose pause is over and a stale answer of the server', () => {
    describe('WHEN the page state is restored', () => {
      test('THEN nothing is restored and the form is shown', () => {
        expect(restorePasswordReset(EXPIRED_RESET_REQUEST, PENDING_RESET, '', RESET_CLOCK)).toBeNull();
      });
    });
  });

  describe('GIVEN only the answer of the server', () => {
    describe('WHEN the page state is restored', () => {
      test('THEN its seconds are kept and the time of the next request is set from them', () => {
        expect(restorePasswordReset(null, PENDING_RESET, '', RESET_CLOCK)).toEqual({
          ...PENDING_RESET,
          resendAt: REMEMBERED_RESET_REQUEST.resendAt,
        });
      });
    });
  });

  describe('GIVEN an email typed on the sign-in page', () => {
    describe('WHEN the pending request belongs to another email', () => {
      test('THEN nothing is restored so the typed email can be sent', () => {
        expect(restorePasswordReset(REMEMBERED_RESET_REQUEST, null, 'grace@example.com', RESET_CLOCK)).toBeNull();
      });
    });

    describe('WHEN the pending request belongs to the same email written in another case', () => {
      test('THEN the request is restored', () => {
        expect(restorePasswordReset(SHOUTED_RESET_REQUEST, null, 'ada@example.com', RESET_CLOCK)).toEqual({
          ...SHOUTED_RESET_REQUEST,
          secondsLeft: PENDING_RESET.secondsLeft,
        });
      });
    });
  });
});
