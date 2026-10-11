import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getMessages } from '@mocks/nextIntlServer';
import NotFound from '@/app/not-found';
import uk from '@/locales/uk.json';

vi.mock('next-intl/server', () => import('@mocks/nextIntlServer'));

describe('NotFound', () => {
  describe('GIVEN a request resolved to ukrainian', () => {
    beforeEach(() => {
      getMessages.mockResolvedValue(uk);
    });

    describe('WHEN the missing page renders', () => {
      beforeEach(async () => {
        render(await NotFound());
      });

      test('THEN it explains the miss in ukrainian and links back to the platform', () => {
        expect(screen.getByRole('heading', { name: uk.common.errorPages.notFoundTitle })).toBeInTheDocument();
        expect(screen.getByText(uk.common.errorPages.notFoundHint)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: uk.common.errorPages.backHome })).toHaveAttribute('href', '/platform');
      });
    });
  });
});
