import { describe, expect, test } from 'vitest';

import { PRODUCTION_POLICY_OPTIONS, DEVELOPMENT_POLICY_OPTIONS } from '@mocks/security';
import { buildContentSecurityPolicy } from '@/lib/utils';

const directivesOf = (policy: string): Record<string, string[]> =>
  Object.fromEntries(
    policy.split('; ').map((directive) => {
      const [name = '', ...sources] = directive.split(' ');

      return [name, sources];
    }),
  );

describe('buildContentSecurityPolicy', () => {
  describe('GIVEN a production build against a hosted Supabase project', () => {
    describe('WHEN the policy is built', () => {
      test('THEN scripts run only through the nonce without eval', () => {
        expect(directivesOf(buildContentSecurityPolicy(PRODUCTION_POLICY_OPTIONS))['script-src']).toEqual([
          "'self'",
          "'nonce-abc123'",
          "'strict-dynamic'",
        ]);
      });

      test('THEN the app may only talk to itself and the Supabase project over https and wss', () => {
        expect(directivesOf(buildContentSecurityPolicy(PRODUCTION_POLICY_OPTIONS))['connect-src']).toEqual([
          "'self'",
          'https://project.supabase.co',
          'wss://project.supabase.co',
        ]);
      });

      test('THEN framing, plugins, base rewrites and foreign form targets are refused', () => {
        expect(directivesOf(buildContentSecurityPolicy(PRODUCTION_POLICY_OPTIONS))).toMatchObject({
          'frame-ancestors': ["'none'"],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
        });
      });
    });
  });

  describe('GIVEN the development server against a local Supabase stack', () => {
    describe('WHEN the policy is built', () => {
      test('THEN eval is allowed for fast refresh', () => {
        expect(directivesOf(buildContentSecurityPolicy(DEVELOPMENT_POLICY_OPTIONS))['script-src']).toContain(
          "'unsafe-eval'",
        );
      });

      test('THEN realtime uses the plain websocket scheme of the local stack', () => {
        expect(directivesOf(buildContentSecurityPolicy(DEVELOPMENT_POLICY_OPTIONS))['connect-src']).toEqual([
          "'self'",
          'http://127.0.0.1:54321',
          'ws://127.0.0.1:54321',
        ]);
      });
    });
  });
});
