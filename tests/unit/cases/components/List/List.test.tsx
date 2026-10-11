import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { List } from '@/components/List';

const trigger = (open: boolean, toggle: () => void) => (
  <button type="button" aria-expanded={open} onClick={toggle}>
    Archive
  </button>
);

describe('List', () => {
  describe('GIVEN a collapsed list', () => {
    beforeEach(() => {
      render(
        <List trigger={trigger}>
          <a href="#archived">Archived thread</a>
        </List>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the hidden content is inert, so keyboard focus cannot reach it', () => {
        expect(screen.getByText('Archived thread').closest('[inert]')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Archive' })).toHaveAttribute('aria-expanded', 'false');
      });
    });

    describe('WHEN the trigger expands it', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
      });

      test('THEN the content becomes reachable', () => {
        expect(screen.getByText('Archived thread').closest('[inert]')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Archive' })).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('GIVEN a list that starts open', () => {
    beforeEach(() => {
      render(
        <List trigger={trigger} defaultOpen>
          <a href="#archived">Archived thread</a>
        </List>,
      );
    });

    describe('WHEN the trigger collapses it', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
      });

      test('THEN the content is inert again', () => {
        expect(screen.getByText('Archived thread').closest('[inert]')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Archive' })).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
});
