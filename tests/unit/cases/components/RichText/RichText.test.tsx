import { fireEvent, render, screen } from '@testing-library/react';
import { type RefObject, createRef } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { listenOnPage } from '@mocks/browser';
import {
  EMPTY_PARAGRAPH_DOCUMENT,
  NUMBERED_FROM_THREE_DOCUMENT,
  PLAIN_TEXT,
  SHOWCASE_DOCUMENT,
  SHOWCASE_TEXT,
  UNSAFE_LINK_DOCUMENT,
} from '@mocks/richText';
import { RichText } from '@/components/RichText';

const onPageClick = vi.fn();
const onPagePress = vi.fn();
const onPageDoubleClick = vi.fn();

const container = () => document.querySelector<HTMLElement>('[data-rich-text]');

beforeEach(() => {
  listenOnPage({ click: onPageClick, mousedown: onPagePress, dblclick: onPageDoubleClick });
});

describe('RichText', () => {
  describe('GIVEN legacy text without formatting', () => {
    beforeEach(() => {
      render(<RichText text={PLAIN_TEXT} className="whitespace-pre-wrap" />);
    });

    describe('WHEN it renders', () => {
      test('THEN the raw text sits directly in the styled container', () => {
        expect(container()).toHaveClass('rich-text', 'whitespace-pre-wrap');
        expect(container()?.textContent).toBe(PLAIN_TEXT);
        expect(container()?.children).toHaveLength(0);
      });
    });
  });

  describe('GIVEN a formatted document', () => {
    beforeEach(() => {
      render(<RichText text={SHOWCASE_TEXT} document={SHOWCASE_DOCUMENT} />);
    });

    describe('WHEN it renders', () => {
      test('THEN each mark becomes its semantic element', () => {
        expect(screen.getByText('Read').tagName).toBe('U');
        expect(screen.getByText('Read').parentElement?.tagName).toBe('EM');
        expect(screen.getByText('Costs').tagName).toBe('S');
        expect(screen.getByText('Risks')).toHaveAttribute('data-text-color', 'red');
      });

      test('THEN the link opens safely in a new tab without dragging the node', () => {
        expect(screen.getByRole('link', { name: 'the brief' })).toHaveAttribute('href', 'https://example.com/brief');
        expect(screen.getByRole('link', { name: 'the brief' })).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link', { name: 'the brief' })).toHaveAttribute('rel', 'noopener noreferrer nofollow');
        expect(screen.getByRole('link', { name: 'the brief' })).toHaveAttribute('draggable', 'false');
        expect(screen.getByRole('link', { name: 'the brief' })).toHaveClass('nodrag', 'nopan');
      });

      test('THEN bullet and numbered lists keep their items and line breaks', () => {
        expect(screen.getAllByRole('list')).toHaveLength(2);
        expect(container()?.querySelector('ul')?.children).toHaveLength(2);
        expect(container()?.querySelector('ol li br')).toBeInTheDocument();
      });
    });

    describe('WHEN the link is clicked, pressed and double clicked', () => {
      beforeEach(() => {
        fireEvent.mouseDown(screen.getByRole('link', { name: 'the brief' }));
        fireEvent.click(screen.getByRole('link', { name: 'the brief' }));
        fireEvent.doubleClick(screen.getByRole('link', { name: 'the brief' }));
      });

      test('THEN none of it reaches the canvas behind the node', () => {
        expect(onPagePress).not.toHaveBeenCalled();
        expect(onPageClick).not.toHaveBeenCalled();
        expect(onPageDoubleClick).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a document with an empty paragraph', () => {
    beforeEach(() => {
      render(<RichText text="" document={EMPTY_PARAGRAPH_DOCUMENT} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the empty paragraph keeps a line of height', () => {
        expect(container()?.querySelector('p br')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a numbered list that starts at three', () => {
    beforeEach(() => {
      render(<RichText text="" document={NUMBERED_FROM_THREE_DOCUMENT} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the list counts on from three', () => {
        expect(screen.getByRole('list')).toHaveAttribute('start', '3');
      });
    });
  });

  describe('GIVEN a document carrying an unsafe link that skipped validation', () => {
    beforeEach(() => {
      render(<RichText text="Sneaky" document={UNSAFE_LINK_DOCUMENT} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the text shows without a link', () => {
        expect(screen.getByText('Sneaky')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a ref handed to the label', () => {
    let ref: RefObject<HTMLDivElement | null>;

    beforeEach(() => {
      ref = createRef<HTMLDivElement>();
      render(<RichText ref={ref} text={PLAIN_TEXT} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the ref points at the container', () => {
        expect(ref.current).toBe(container());
      });
    });
  });
});
