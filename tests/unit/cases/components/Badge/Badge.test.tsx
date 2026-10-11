import { render, screen } from '@testing-library/react';
import { Rocket } from 'lucide-react';
import { beforeEach, describe, expect, test } from 'vitest';

import { Badge } from '@/components/Badge';

describe('Badge', () => {
  describe('GIVEN an earned badge', () => {
    beforeEach(() => {
      render(<Badge icon={Rocket} label="First flight" unlock="Finish the tour" earned />);
    });

    describe('WHEN it renders', () => {
      test('THEN it is named by its label alone', () => {
        expect(screen.getByRole('img', { name: 'First flight' })).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a locked badge', () => {
    beforeEach(() => {
      render(<Badge icon={Rocket} label="First flight" unlock="Finish the tour" earned={false} />);
    });

    describe('WHEN it renders', () => {
      test('THEN its name also tells how to unlock it', () => {
        expect(screen.getByRole('img', { name: 'First flight · Finish the tour' })).toHaveAttribute(
          'title',
          'First flight · Finish the tour',
        );
      });
    });
  });
});
