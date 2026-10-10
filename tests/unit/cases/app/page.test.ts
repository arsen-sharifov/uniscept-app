import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getMessages } from '@mocks/nextIntlServer';
import { generateMetadata } from '@/app/page';
import uk from '@/locales/uk.json';

vi.mock('next-intl/server', () => import('@mocks/nextIntlServer'));

describe('generateMetadata', () => {
  describe('GIVEN a landing page request resolved to ukrainian', () => {
    beforeEach(() => {
      getMessages.mockResolvedValue(uk);
    });

    describe('WHEN the landing page metadata is generated', () => {
      test('THEN the description speaks ukrainian and the title is left to the root layout', async () => {
        await expect(generateMetadata()).resolves.toEqual({ description: uk.common.metadata.description });
      });
    });
  });
});
