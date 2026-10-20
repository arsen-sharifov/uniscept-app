import { beforeEach, describe, expect, test } from 'vitest';

import type { ICanvasExportImage } from '@interfaces';

import { EXPORT_THREAD_NAME } from '@mocks/canvasExport';
import {
  EXPORT_FIXTURE,
  EXPORT_SCENES,
  LIST_FIXTURE,
  SAMPLED_COLOR,
  buildExportCanvas,
  parseExportSvg,
  stubCanvasExport,
} from '@mocks/canvasExportDom';
import { DECORATION_FIXTURE } from '@mocks/canvasExportText';
import { EXPORT_RECTS } from '@mocks/canvasExportValues';
import { EXPORT_MARK_TEXT, EXPORT_STAGE_SELECTOR, createCanvasSvg, getExportBounds } from '@/lib/canvas/export';

let root: HTMLElement;
let image: ICanvasExportImage;

describe('getExportBounds', () => {
  describe('GIVEN nodes at negative and distant coordinates and an edge bending beyond them', () => {
    describe('WHEN the whole graph is measured', () => {
      test('THEN it includes every node and the complete curve', () => {
        expect(getExportBounds(EXPORT_RECTS)).toEqual({ x: -560, y: -230, width: 2740, height: 1530 });
      });
    });
  });

  describe('GIVEN an empty canvas', () => {
    describe('WHEN export bounds are requested', () => {
      test('THEN it refuses to create a meaningless image', () => {
        expect(() => getExportBounds([])).toThrow('The canvas is empty');
      });
    });
  });
});

describe('createCanvasSvg', () => {
  beforeEach(() => {
    stubCanvasExport();
  });

  describe('GIVEN two connected nodes with helpers, an icon, an open label editor and a wash', () => {
    beforeEach(async () => {
      root = buildExportCanvas(EXPORT_SCENES.editing);
      image = await createCanvasSvg(root, EXPORT_THREAD_NAME);
    });

    describe('WHEN the graph is rendered to SVG', () => {
      test('THEN the frame wraps both nodes with padding and room for the product mark', () => {
        expect(image.width).toBe(EXPORT_FIXTURE.frame.width);
        expect(image.height).toBe(EXPORT_FIXTURE.frame.height);
        expect(image.svg).toContain(`<title>${EXPORT_THREAD_NAME}</title>`);
        expect(image.svg).toContain(`viewBox="0 0 ${EXPORT_FIXTURE.frame.width} ${EXPORT_FIXTURE.frame.height}"`);
      });

      test('THEN every node becomes a group with its transformed text while helpers stay out', () => {
        expect(image.svg).toContain('data-node-id="source"');
        expect(image.svg).toContain('data-node-id="target"');
        expect(image.svg).toContain(EXPORT_FIXTURE.sourceLabel.toUpperCase());
        expect(image.svg).toContain(EXPORT_FIXTURE.draftLabel);
        expect(image.svg).not.toContain(EXPORT_FIXTURE.omittedLabel);
        expect(image.svg).not.toContain(EXPORT_FIXTURE.hiddenLabel);
        expect(image.svg).not.toContain('react-flow__handle');
      });

      test('THEN shared definitions are registered once and referenced by every user', () => {
        expect(image.svg.match(/<marker /g)).toHaveLength(1);
        expect(image.svg.match(/<filter /g)).toHaveLength(1);
        expect(image.svg.match(/marker-end="url\(#arrow-0\)"/g)).toHaveLength(2);
        expect(image.svg).toContain('marker-start="url(#arrow-0)"');
        expect(image.svg).toContain('<clipPath ');
        expect(image.svg).toContain(`stroke="${EXPORT_FIXTURE.edgeStroke}"`);
      });

      test('THEN the wash, the icon and the product mark are painted and the stage is torn down', () => {
        expect(image.svg).toContain(`fill="${EXPORT_FIXTURE.washColor}"`);
        expect(image.svg).toContain(`fill="${SAMPLED_COLOR}"`);
        expect(image.svg).toContain('id="product-mark"');
        expect(image.svg).toContain(EXPORT_MARK_TEXT);
        expect(image.svg.match(/<svg /g)).toHaveLength(3);
        expect(root.querySelector(EXPORT_STAGE_SELECTOR)).toBeNull();
      });

      test('THEN icons carry their computed paint as attributes instead of classes', () => {
        expect(image.svg).toContain(`fill="${EXPORT_FIXTURE.iconFill}"`);
        expect(image.svg).not.toContain('class="h-3 w-3"');
      });

      test('THEN edges leave the declared handle sides', () => {
        expect(image.svg).toContain(EXPORT_FIXTURE.sidedEdgePath);
      });
    });
  });

  describe('GIVEN a label that spans two lines', () => {
    beforeEach(async () => {
      root = buildExportCanvas(EXPORT_SCENES.multiline);
      image = await createCanvasSvg(root, EXPORT_THREAD_NAME);
    });

    describe('WHEN the graph is rendered to SVG', () => {
      test('THEN every line becomes its own text run without the line break', () => {
        const [first = '', second = ''] = EXPORT_FIXTURE.multilineLabel.split('\n');

        expect(image.svg).toContain(`>${first.toUpperCase()}</text>`);
        expect(image.svg).toContain(`>${second.toUpperCase()}</text>`);
        expect(image.svg).not.toContain('\n');
      });
    });
  });

  describe('GIVEN a label and a thread name that carry markup', () => {
    beforeEach(async () => {
      root = buildExportCanvas(EXPORT_SCENES.markup);
      image = await createCanvasSvg(root, EXPORT_FIXTURE.markupThread);
    });

    describe('WHEN the exported file is opened as SVG', () => {
      test('THEN the markup stays literal text and never becomes elements', () => {
        const document = parseExportSvg(image.svg);

        expect(document.querySelector('parsererror')).toBeNull();
        expect(document.getElementsByTagName('script')).toHaveLength(0);
        expect(document.getElementsByTagName('a')).toHaveLength(0);
        expect(document.querySelector('title')?.textContent).toBe(EXPORT_FIXTURE.markupThread);
        expect(document.querySelector('[data-node-id="source"]')?.textContent).toContain(
          EXPORT_FIXTURE.markupLabel.toUpperCase(),
        );
      });
    });
  });

  describe('GIVEN a label and a thread name with characters XML forbids', () => {
    beforeEach(async () => {
      root = buildExportCanvas(EXPORT_SCENES.control);
      image = await createCanvasSvg(root, EXPORT_FIXTURE.controlLabel);
    });

    describe('WHEN the exported file is opened as SVG', () => {
      test('THEN it still parses and keeps the readable text', () => {
        const document = parseExportSvg(image.svg);

        expect(document.querySelector('parsererror')).toBeNull();
        expect(document.querySelector('title')?.textContent).toBe(EXPORT_FIXTURE.controlSafeLabel);
        expect(document.querySelector('[data-node-id="source"]')?.textContent).toContain(
          EXPORT_FIXTURE.controlSafeLabel.toUpperCase(),
        );
      });
    });
  });

  describe('GIVEN a node whose label editor is open and empty next to one whose editor holds a draft', () => {
    beforeEach(() => {
      root = buildExportCanvas(EXPORT_SCENES.placeholder);
    });

    describe('WHEN the graph is rendered to SVG', () => {
      beforeEach(async () => {
        image = await createCanvasSvg(root, EXPORT_THREAD_NAME);
      });

      test('THEN the placeholder stands in for the empty label while the draft keeps its own text', () => {
        const document = parseExportSvg(image.svg);
        const source = document.querySelector('[data-node-id="source"]')?.textContent;
        const target = document.querySelector('[data-node-id="target"]')?.textContent;

        expect(source).toContain(EXPORT_FIXTURE.placeholderLabel);
        expect(source).not.toContain(EXPORT_FIXTURE.draftLabel);
        expect(target).toContain(EXPORT_FIXTURE.draftLabel);
        expect(target).not.toContain(EXPORT_FIXTURE.placeholderLabel);
      });
    });
  });

  describe('GIVEN a node label with a bullet list, an ordered list and an ordered list that starts at three', () => {
    beforeEach(() => {
      root = buildExportCanvas(EXPORT_SCENES.lists);
    });

    describe('WHEN the graph is rendered to SVG', () => {
      beforeEach(async () => {
        image = await createCanvasSvg(root, EXPORT_THREAD_NAME);
      });

      test('THEN every list item is exported as text after its marker', () => {
        const runs = parseExportSvg(image.svg).querySelectorAll('[data-node-id="source"] text');

        expect(Array.from(runs, (run) => run.textContent)).toEqual(LIST_FIXTURE.runs);
      });
    });
  });

  describe('GIVEN a node label that underlines a word', () => {
    beforeEach(() => {
      root = buildExportCanvas(EXPORT_SCENES.underlined);
    });

    describe('WHEN the graph is rendered to SVG', () => {
      beforeEach(async () => {
        image = await createCanvasSvg(root, EXPORT_THREAD_NAME);
      });

      test('THEN one thin line in the decoration colour is painted under the word inside its node', () => {
        const lines = parseExportSvg(image.svg).querySelectorAll(
          `[data-node-id="source"] rect[fill="${DECORATION_FIXTURE.color}"]`,
        );

        expect(lines).toHaveLength(1);
        expect(lines[0]?.getAttribute('width')).toBe(DECORATION_FIXTURE.wordWidth);
        expect(lines[0]?.getAttribute('height')).toBe(DECORATION_FIXTURE.thickness);
      });
    });
  });

  describe('GIVEN an edge without handle sides in its markup', () => {
    beforeEach(async () => {
      root = buildExportCanvas(EXPORT_SCENES.unsided);
      image = await createCanvasSvg(root, EXPORT_THREAD_NAME);
    });

    describe('WHEN the graph is rendered to SVG', () => {
      test('THEN it falls back to leaving the source bottom for the target top', () => {
        expect(image.svg).toContain(EXPORT_FIXTURE.unsidedEdgePath);
      });
    });
  });

  describe('GIVEN an edge that points at a node missing from the canvas', () => {
    beforeEach(() => {
      root = buildExportCanvas(EXPORT_SCENES.orphan);
    });

    describe('WHEN the graph is rendered to SVG', () => {
      test('THEN the export refuses instead of drawing a dangling edge', async () => {
        await expect(createCanvasSvg(root, EXPORT_THREAD_NAME)).rejects.toThrow('A canvas edge is not ready');
        expect(root.querySelector(EXPORT_STAGE_SELECTOR)).toBeNull();
      });
    });
  });

  describe('GIVEN a node wrapper whose card has not mounted yet', () => {
    beforeEach(() => {
      root = buildExportCanvas(EXPORT_SCENES.unmounted);
    });

    describe('WHEN the graph is rendered to SVG', () => {
      test('THEN the export refuses', async () => {
        await expect(createCanvasSvg(root, EXPORT_THREAD_NAME)).rejects.toThrow('A canvas node is not ready');
      });
    });
  });

  describe('GIVEN a canvas that left the document', () => {
    beforeEach(() => {
      root = buildExportCanvas();
      root.remove();
    });

    describe('WHEN the graph is rendered to SVG', () => {
      test('THEN the export refuses', async () => {
        await expect(createCanvasSvg(root, EXPORT_THREAD_NAME)).rejects.toThrow('The active canvas changed');
      });
    });
  });
});
