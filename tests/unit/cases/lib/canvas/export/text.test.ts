import { beforeEach, describe, expect, test } from 'vitest';

import type { ICanvasExportContext } from '@interfaces';

import { SAMPLED_COLOR, exportContext, stubTextLayout } from '@mocks/canvasExportDom';
import {
  CAPTION_TEXT_STYLE,
  DECORATION_FIXTURE,
  DECORATION_MARKUP,
  TEXT_STYLE,
  mountExportText,
} from '@mocks/canvasExportText';
import { OKLCH_COLOR } from '@mocks/canvasExportValues';
import { renderExportText } from '@/lib/canvas/export';

let context: ICanvasExportContext;
let text: Text;
let elements: SVGElement[];

beforeEach(() => {
  stubTextLayout();
  context = exportContext({ origin: DECORATION_FIXTURE.origin });
});

describe('renderExportText', () => {
  describe('GIVEN a word inside an underlined element', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.underlined);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN the text run is followed by one line just below its baseline spanning the whole word', () => {
        const [run, underline] = elements;

        expect(elements.map((element) => element.tagName)).toEqual(['text', 'rect']);
        expect(run).toHaveAttribute('x', DECORATION_FIXTURE.textX);
        expect(run).toHaveAttribute('y', DECORATION_FIXTURE.baseline);
        expect(underline).toHaveAttribute('x', DECORATION_FIXTURE.textX);
        expect(underline).toHaveAttribute('y', DECORATION_FIXTURE.underlineY);
        expect(underline).toHaveAttribute('width', DECORATION_FIXTURE.wordWidth);
        expect(underline).toHaveAttribute('height', DECORATION_FIXTURE.thickness);
        expect(underline).toHaveAttribute('fill', DECORATION_FIXTURE.color);
      });
    });
  });

  describe('GIVEN a word inside a struck element', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.struck);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN one line crosses the word above its baseline', () => {
        const [, strike] = elements;

        expect(elements.map((element) => element.tagName)).toEqual(['text', 'rect']);
        expect(strike).toHaveAttribute('x', DECORATION_FIXTURE.textX);
        expect(strike).toHaveAttribute('y', DECORATION_FIXTURE.lineThroughY);
        expect(strike).toHaveAttribute('width', DECORATION_FIXTURE.wordWidth);
        expect(strike).toHaveAttribute('height', DECORATION_FIXTURE.thickness);
        expect(strike).toHaveAttribute('fill', DECORATION_FIXTURE.color);
      });
    });
  });

  describe('GIVEN an underlined word nested inside a struck element of another colour', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.struckUnderlined);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN both lines are drawn, each in the colour its own element declares', () => {
        const [, underline, strike] = elements;

        expect(elements.map((element) => element.tagName)).toEqual(['text', 'rect', 'rect']);
        expect(underline).toHaveAttribute('y', DECORATION_FIXTURE.underlineY);
        expect(underline).toHaveAttribute('fill', DECORATION_FIXTURE.color);
        expect(strike).toHaveAttribute('y', DECORATION_FIXTURE.lineThroughY);
        expect(strike).toHaveAttribute('fill', DECORATION_FIXTURE.outerColor);
      });
    });
  });

  describe('GIVEN bold text inside an underlined link that declares no decoration itself', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.boldLink);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN the underline is inherited from the link and spans the bold text', () => {
        const [, underline] = elements;

        expect(elements.map((element) => element.tagName)).toEqual(['text', 'rect']);
        expect(underline).toHaveAttribute('y', DECORATION_FIXTURE.underlineY);
        expect(underline).toHaveAttribute('width', DECORATION_FIXTURE.linkWidth);
        expect(underline).toHaveAttribute('fill', DECORATION_FIXTURE.color);
      });
    });
  });

  describe('GIVEN a word underlined by two nested elements in different colours', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.doublyUnderlined);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN a single underline is drawn in the colour of the nearest element', () => {
        const [, underline] = elements;

        expect(elements.map((element) => element.tagName)).toEqual(['text', 'rect']);
        expect(underline).toHaveAttribute('fill', DECORATION_FIXTURE.color);
      });
    });
  });

  describe('GIVEN a word without any decoration', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.plain);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN only the text run is produced', () => {
        expect(elements.map((element) => element.tagName)).toEqual(['text']);
      });
    });
  });

  describe('GIVEN an underlined element that holds only whitespace', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.blank);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN nothing is drawn, not even a stray underline', () => {
        expect(elements).toEqual([]);
      });
    });
  });

  describe('GIVEN decorations declared on the canvas node and on an element above it', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.beyondNode);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN neither is drawn because the search stops at the node boundary', () => {
        expect(elements.map((element) => element.tagName)).toEqual(['text']);
      });
    });
  });

  describe('GIVEN an underline coloured with a theme colour outside the rgb family', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.themed);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN the line is painted with the colour the export resolves and caches', () => {
        const [, underline] = elements;

        expect(underline).toHaveAttribute('fill', SAMPLED_COLOR);
        expect(context.colors.get(OKLCH_COLOR)).toBe(SAMPLED_COLOR);
      });
    });
  });

  describe('GIVEN an underlined text that spans two lines', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.multiline);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, TEXT_STYLE, context);
      });

      test('THEN every line gets its own run followed by an underline as wide as that line', () => {
        const underlines = elements.filter((element) => element.tagName === 'rect');

        expect(elements.map((element) => element.tagName)).toEqual(['text', 'rect', 'text', 'rect']);
        expect(underlines.map((underline) => underline.getAttribute('width'))).toEqual(DECORATION_FIXTURE.lineWidths);
      });
    });
  });

  describe('GIVEN an underlined word set in a small caption size', () => {
    beforeEach(() => {
      text = mountExportText(DECORATION_MARKUP.underlined);
    });

    describe('WHEN the text is rendered', () => {
      beforeEach(() => {
        elements = renderExportText(text, CAPTION_TEXT_STYLE, context);
      });

      test('THEN the line keeps at least one pixel of thickness and sits closer to the baseline', () => {
        const [, underline] = elements;

        expect(underline).toHaveAttribute('height', DECORATION_FIXTURE.minimumThickness);
        expect(underline).toHaveAttribute('y', DECORATION_FIXTURE.captionUnderlineY);
      });
    });
  });
});
