import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { Avatar } from '@/components/Avatar';

vi.mock('@/i18n', () => import('@mocks/i18n'));

describe('Avatar', () => {
  describe('GIVEN a member without a picked icon', () => {
    beforeEach(() => {
      render(<Avatar name="Ada Lovelace" />);
    });

    describe('WHEN it renders', () => {
      test('THEN an image named after the member shows their initials', () => {
        expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
      });
    });
  });

  describe('GIVEN a member with a picked icon', () => {
    beforeEach(() => {
      render(<Avatar name="Ada Lovelace" icon="cat" />);
    });

    describe('WHEN it renders', () => {
      test('THEN the icon replaces the initials', () => {
        expect(screen.getByRole('img', { name: 'Ada Lovelace' })).not.toHaveTextContent('AL');
        expect(screen.getByRole('img', { name: 'Ada Lovelace' }).querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a member without a name', () => {
    beforeEach(() => {
      render(<Avatar name="" />);
    });

    describe('WHEN it renders', () => {
      test('THEN the image still has a generic name', () => {
        expect(screen.getByRole('img', { name: TRANSLATIONS.common.userAvatar })).toHaveTextContent('U');
      });
    });
  });
});
