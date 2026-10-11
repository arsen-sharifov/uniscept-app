import { describe, expect, test } from 'vitest';

import { getClientIp, isSameOriginRequest } from '@api/server/utils';

const requestWith = (headers: Record<string, string>): Request =>
  new Request('http://localhost:3000/auth/verify-invite', { method: 'POST', headers });

describe('getClientIp', () => {
  describe('GIVEN a request that passed through several proxies', () => {
    describe('WHEN the client ip is read', () => {
      test('THEN the first forwarded address wins over the real ip header', () => {
        expect(
          getClientIp(requestWith({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1', 'x-real-ip': '10.0.0.2' })),
        ).toBe('203.0.113.7');
      });
    });
  });

  describe('GIVEN a request identified only through x-real-ip', () => {
    describe('WHEN the client ip is read', () => {
      test('THEN the trimmed real ip is used', () => {
        expect(getClientIp(requestWith({ 'x-real-ip': ' 198.51.100.4 ' }))).toBe('198.51.100.4');
      });
    });
  });

  describe('GIVEN a request without ip headers', () => {
    describe('WHEN the client ip is read', () => {
      test('THEN every such request shares the fallback key', () => {
        expect(getClientIp(requestWith({}))).toBe('unknown');
      });
    });
  });
});

describe('isSameOriginRequest', () => {
  describe('GIVEN a browser that sends fetch metadata', () => {
    describe('WHEN the request comes from the app itself', () => {
      test('THEN it is accepted', () => {
        expect(isSameOriginRequest(requestWith({ 'sec-fetch-site': 'same-origin' }))).toBe(true);
      });
    });

    describe('WHEN the request comes from a sibling subdomain', () => {
      test('THEN it is refused even with a matching origin header', () => {
        expect(
          isSameOriginRequest(
            requestWith({ 'sec-fetch-site': 'same-site', origin: 'http://localhost:3000', host: 'localhost:3000' }),
          ),
        ).toBe(false);
      });
    });

    describe('WHEN the request comes from another site', () => {
      test('THEN it is refused', () => {
        expect(isSameOriginRequest(requestWith({ 'sec-fetch-site': 'cross-site' }))).toBe(false);
      });
    });
  });

  describe('GIVEN a client without fetch metadata', () => {
    describe('WHEN no origin header is sent', () => {
      test('THEN the request is accepted like a same-origin form post', () => {
        expect(isSameOriginRequest(requestWith({}))).toBe(true);
      });
    });

    describe('WHEN the origin matches the host header', () => {
      test('THEN it is accepted', () => {
        expect(isSameOriginRequest(requestWith({ origin: 'http://localhost:3000', host: 'localhost:3000' }))).toBe(
          true,
        );
      });
    });

    describe('WHEN the origin matches the request address and no host header is sent', () => {
      test('THEN the address host stands in for the header', () => {
        expect(isSameOriginRequest(requestWith({ origin: 'http://localhost:3000' }))).toBe(true);
      });
    });

    describe('WHEN a foreign origin is sent', () => {
      test('THEN it is refused', () => {
        expect(isSameOriginRequest(requestWith({ origin: 'https://evil.example', host: 'localhost:3000' }))).toBe(
          false,
        );
      });
    });

    describe('WHEN the origin matches the host a proxy forwarded', () => {
      test('THEN the forwarded host wins over the internal host header', () => {
        expect(
          isSameOriginRequest(
            requestWith({
              origin: 'https://app.uniscept.dev',
              host: 'internal:8080',
              'x-forwarded-host': 'app.uniscept.dev',
            }),
          ),
        ).toBe(true);
      });
    });

    describe('WHEN the origin cannot be parsed', () => {
      test('THEN it is refused', () => {
        expect(isSameOriginRequest(requestWith({ origin: 'null', host: 'localhost:3000' }))).toBe(false);
      });
    });
  });
});
