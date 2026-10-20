import { beforeEach, describe, expect, test } from 'vitest';

import type { ICanvasExportNode } from '@interfaces';

import {
  EXPORT_FIXTURE,
  EXPORT_SCENES,
  LIST_FIXTURE,
  buildExportCanvas,
  stubCanvasLayout,
} from '@mocks/canvasExportDom';
import { cloneExportNodes, createExportStage } from '@/lib/canvas/export';

let root: HTMLElement;
let stage: HTMLDivElement;
let nodes: ICanvasExportNode[];

beforeEach(() => {
  stubCanvasLayout();
});

describe('cloneExportNodes', () => {
  describe('GIVEN a node label with a bullet list, an ordered list and an ordered list that starts at three', () => {
    beforeEach(() => {
      root = buildExportCanvas(EXPORT_SCENES.lists);
      stage = createExportStage(root);
    });

    describe('WHEN the nodes are cloned onto the export stage', () => {
      beforeEach(() => {
        nodes = cloneExportNodes(root, stage);
      });

      test('THEN every bullet item leads with a bullet marker', () => {
        const markers = nodes[0]?.element.querySelectorAll('ul > li > [data-export-marker]:first-child') ?? [];

        expect(Array.from(markers, (marker) => marker.textContent)).toEqual(LIST_FIXTURE.bullets);
      });

      test('THEN ordered items count from one when the list declares no start', () => {
        const markers =
          nodes[0]?.element.querySelectorAll('ol:not([start]) > li > [data-export-marker]:first-child') ?? [];

        expect(Array.from(markers, (marker) => marker.textContent)).toEqual(LIST_FIXTURE.numbers);
      });

      test('THEN ordered items continue from the start the list declares', () => {
        const markers = nodes[0]?.element.querySelectorAll('ol[start] > li > [data-export-marker]:first-child') ?? [];

        expect(Array.from(markers, (marker) => marker.textContent)).toEqual(LIST_FIXTURE.continued);
      });

      test('THEN the lists on the live canvas stay without markers', () => {
        expect(root.querySelector('[data-id="source"] [data-export-marker]')).toBeNull();
      });
    });
  });

  describe('GIVEN one node with an empty label editor and another whose editor holds a draft', () => {
    beforeEach(() => {
      root = buildExportCanvas(EXPORT_SCENES.placeholder);
      stage = createExportStage(root);
    });

    describe('WHEN the nodes are cloned onto the export stage', () => {
      beforeEach(() => {
        nodes = cloneExportNodes(root, stage);
      });

      test('THEN the empty editor shows its placeholder as text while the draft keeps its own text', () => {
        expect(nodes.map((node) => node.element.querySelector('[contenteditable] p')?.textContent)).toEqual([
          EXPORT_FIXTURE.placeholderLabel,
          EXPORT_FIXTURE.draftLabel,
        ]);
      });

      test('THEN the editor on the live canvas stays empty', () => {
        expect(root.querySelector('[data-id="source"] .is-editor-empty')?.textContent).toBe('');
      });
    });
  });
});
