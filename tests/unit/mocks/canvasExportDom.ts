import { onTestFinished, vi } from 'vitest';

import type { ICanvasExportContext } from '@interfaces';

import { svgElement } from '@/lib/canvas/export';

import type { IUnitExportScene, IUnitExportSceneEdge, IUnitExportSceneNode } from '../interfaces';
import { stubFontsReady, stubProperty, stubRangeRects } from './browser';
import { DECORATION_MARKUP } from './canvasExportText';

export const EXPORT_FIXTURE = {
  sourceLabel: 'Origin claim',
  draftLabel: 'Draft label',
  placeholderLabel: 'Describe the claim',
  multilineLabel: 'First line\nSecond line',
  markupLabel: '</text><script>alert(1)</script><a href="javascript:alert(2)">go</a>',
  markupThread: 'Plan"><script>alert(3)</script>',
  controlLabel: `Bell${String.fromCodePoint(0x07)} form${String.fromCodePoint(0x0c)} feed${String.fromCodePoint(0xff_ff)} end`,
  controlSafeLabel: 'Bell form feed end',
  omittedLabel: 'Show more',
  hiddenLabel: 'Hidden helper',
  edgeStroke: 'rgb(21, 128, 61)',
  washColor: 'rgba(220, 38, 38, 0.07)',
  iconFill: 'rgb(1, 2, 3)',
  blobUrl: 'blob:export',
  sidedEdgePath: 'data-edge-id="e1" data-tone="valid" d="M240,110 ',
  unsidedEdgePath: 'data-edge-id="e1" data-tone="valid" d="M140,140 ',
  frame: { width: 656, height: 196 },
} as const;

export const LIST_FIXTURE = {
  markup: [
    '<ul><li><p>Alpha</p></li><li><p>Beta</p></li></ul>',
    '<ol><li><p>One</p></li><li><p>Two</p></li></ol>',
    '<ol start="3"><li><p>Three</p></li><li><p>Four</p></li></ol>',
  ].join(''),
  bullets: ['•', '•'],
  numbers: ['1.', '2.'],
  continued: ['3.', '4.'],
  runs: ['•', 'Alpha', '•', 'Beta', '1.', 'One', '2.', 'Two', '3.', 'Three', '4.', 'Four'],
} as const;

const GLYPH_SIZE = { width: 8, height: 20 };

const SOURCE_NODE = { id: 'source', x: 40, y: 80, label: EXPORT_FIXTURE.sourceLabel };
const TARGET_NODE = { id: 'target', x: 400, y: 80, label: 'Refuted premise' };
const FORWARD_EDGE = { id: 'e1', source: 'source', target: 'target', sided: true, bidirectional: false };
const RETURN_EDGE = { id: 'e2', source: 'target', target: 'source', sided: true, bidirectional: true };

const EXPORT_SCENE: IUnitExportScene = { nodes: [SOURCE_NODE, TARGET_NODE], edges: [FORWARD_EDGE, RETURN_EDGE] };

export const EXPORT_SCENES = {
  editing: { ...EXPORT_SCENE, nodes: [SOURCE_NODE, { ...TARGET_NODE, editor: EXPORT_FIXTURE.draftLabel }] },
  placeholder: {
    ...EXPORT_SCENE,
    nodes: [
      { ...SOURCE_NODE, editor: '' },
      { ...TARGET_NODE, editor: EXPORT_FIXTURE.draftLabel },
    ],
  },
  multiline: { ...EXPORT_SCENE, nodes: [{ ...SOURCE_NODE, label: EXPORT_FIXTURE.multilineLabel }, TARGET_NODE] },
  markup: { ...EXPORT_SCENE, nodes: [{ ...SOURCE_NODE, label: EXPORT_FIXTURE.markupLabel }, TARGET_NODE] },
  control: { ...EXPORT_SCENE, nodes: [{ ...SOURCE_NODE, label: EXPORT_FIXTURE.controlLabel }, TARGET_NODE] },
  lists: { ...EXPORT_SCENE, nodes: [{ ...SOURCE_NODE, richLabel: LIST_FIXTURE.markup }, TARGET_NODE] },
  underlined: { ...EXPORT_SCENE, nodes: [{ ...SOURCE_NODE, richLabel: DECORATION_MARKUP.underlined }, TARGET_NODE] },
  unmounted: { ...EXPORT_SCENE, nodes: [{ ...SOURCE_NODE, card: false }, TARGET_NODE] },
  wide: { ...EXPORT_SCENE, nodes: [SOURCE_NODE, { ...TARGET_NODE, x: 20_000 }] },
  unsided: { ...EXPORT_SCENE, edges: [{ ...FORWARD_EDGE, sided: false }, RETURN_EDGE] },
  orphan: { ...EXPORT_SCENE, edges: [{ ...FORWARD_EDGE, target: 'missing' }, RETURN_EDGE] },
};

export const SAMPLED_COLOR = 'rgba(250, 250, 245, 1)';

const scratchCanvas = (): CanvasRenderingContext2D =>
  ({
    font: '',
    fillStyle: '',
    measureText: () => ({ fontBoundingBoxAscent: 12, fontBoundingBoxDescent: 4 }),
    clearRect: () => {},
    fillRect: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: Uint8ClampedArray.of(250, 250, 245, 255) }),
  }) as unknown as CanvasRenderingContext2D;

export const exportContext = (overrides: Partial<ICanvasExportContext> = {}): ICanvasExportContext => ({
  stage: document.body,
  origin: new DOMRect(),
  defs: svgElement('defs'),
  scratch: scratchCanvas(),
  fonts: new Set(),
  codePoints: new Set(),
  colors: new Map(),
  definitions: new Map(),
  ...overrides,
});

const nodeRect = (element: Element): DOMRect => {
  const style = element instanceof HTMLElement ? element.style : undefined;

  return new DOMRect(Number.parseFloat(style?.left ?? '') || 0, Number.parseFloat(style?.top ?? '') || 0, 200, 60);
};

const glyphRect = ({ startContainer, startOffset }: Range): DOMRect => {
  const lines = (startContainer.textContent ?? '').slice(0, startOffset).split('\n');
  const { width, height } = GLYPH_SIZE;

  return new DOMRect((lines.at(-1)?.length ?? 0) * width, (lines.length - 1) * height, width, height);
};

export const stubCanvasLayout = () => {
  stubProperty(
    globalThis,
    'DOMMatrix',
    class {
      m41: number;
      m42: number;

      constructor(transform: string) {
        const [, x = '0', y = '0'] = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(transform) ?? [];
        this.m41 = Number(x);
        this.m42 = Number(y);
      }
    },
  );
  stubProperty(Element.prototype, 'getBoundingClientRect', function (this: Element) {
    return nodeRect(this);
  });
  stubProperty(SVGElement.prototype, 'getBBox', () => new DOMRect(240, 110, 160, 0));
};

export const stubTextLayout = () => stubRangeRects(glyphRect);

export const stubCanvasExport = () => {
  const fonts = stubFontsReady();
  fonts.load();
  onTestFinished(() => {
    fonts.restore();
  });
  stubCanvasLayout();
  stubTextLayout();
  stubProperty(HTMLCanvasElement.prototype, 'getContext', scratchCanvas);
};

export const stubImageDecoding = (outcome: 'load' | 'error' = 'load') =>
  stubProperty(
    globalThis,
    'Image',
    class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_url: string) {
        queueMicrotask(() => (outcome === 'load' ? this.onload : this.onerror)?.());
      }
    },
  );

export const stubObjectUrls = (): Blob[] => {
  const blobs: Blob[] = [];
  stubProperty(
    URL,
    'createObjectURL',
    vi.fn((blob: Blob) => {
      blobs.push(blob);

      return EXPORT_FIXTURE.blobUrl;
    }),
  );
  stubProperty(URL, 'revokeObjectURL', vi.fn());

  return blobs;
};

export const stubDownloads = (): string[] => {
  const downloads: string[] = [];
  stubProperty(HTMLAnchorElement.prototype, 'click', function (this: HTMLAnchorElement) {
    downloads.push(this.download);
  });

  return downloads;
};

export const encodeAsRequested = (callback: BlobCallback, type?: string) => callback(new Blob(['image'], { type }));

export const encodeNothing = (callback: BlobCallback) => callback(null);

export const encodeAsPng = (callback: BlobCallback) => callback(new Blob(['image'], { type: 'image/png' }));

export const parseExportSvg = (svg: string): Document => new DOMParser().parseFromString(svg, 'image/svg+xml');

const htmlElement = (
  tag: string,
  attributes: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElement => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  element.append(...children);

  return element;
};

const nodeLabel = (label: string, richLabel?: string): HTMLElement => {
  if (richLabel === undefined) return htmlElement('p', { style: 'text-transform: uppercase' }, [label]);

  const element = htmlElement('div', { 'data-rich-text': '' });
  element.innerHTML = richLabel;

  return element;
};

const labelEditor = (draft: string): HTMLElement => {
  const paragraph = draft
    ? htmlElement('p', {}, [draft])
    : htmlElement('p', { class: 'is-editor-empty', 'data-placeholder': EXPORT_FIXTURE.placeholderLabel });

  return htmlElement('div', { class: 'rich-text rich-text-editor', contenteditable: 'true' }, [paragraph]);
};

const nodeIcon = (): SVGSVGElement => {
  const icon = svgElement('svg', { class: 'h-3 w-3' });
  icon.append(svgElement('path', { style: `fill: ${EXPORT_FIXTURE.iconFill}` }));

  return icon;
};

const nodeCard = (content: Node[]): HTMLElement =>
  htmlElement(
    'div',
    {
      'data-export-node': '',
      style: [
        'background-color: rgb(255, 255, 255)',
        `background-image: linear-gradient(${EXPORT_FIXTURE.washColor}, ${EXPORT_FIXTURE.washColor})`,
        'border-top-width: 1px',
        'border-top-color: rgb(200, 200, 200)',
        'border-top-left-radius: 12px',
        'overflow: hidden',
        'box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px !important',
      ].join('; '),
    },
    [
      htmlElement('div', { class: 'react-flow__handle' }),
      htmlElement('button', { 'data-export-omit': '' }, [EXPORT_FIXTURE.omittedLabel]),
      htmlElement('span', { style: 'display: none' }, [EXPORT_FIXTURE.hiddenLabel]),
      ...content,
    ],
  );

const exportNode = ({ id, x, y, label, richLabel, editor, card = true }: IUnitExportSceneNode): HTMLElement => {
  const editors = editor === undefined ? [] : [labelEditor(editor)];
  const cards = card ? [nodeCard([nodeLabel(label, richLabel), nodeIcon(), ...editors])] : [];

  return htmlElement(
    'div',
    { class: 'react-flow__node', 'data-id': id, style: `transform: translate(${x}px, ${y}px)` },
    cards,
  );
};

const exportEdge = ({ id, source, target, sided, bidirectional }: IUnitExportSceneEdge): SVGGElement => {
  const sides: Record<string, string> = sided ? { 'data-source-handle': 'right', 'data-target-handle': 'left' } : {};
  const edge = svgElement('g', {
    'data-export-edge': id,
    'data-source': source,
    'data-target': target,
    'data-tone': 'valid',
    'data-bidirectional': String(bidirectional),
    ...sides,
  });
  edge.append(
    svgElement('path', {
      class: 'react-flow__edge-path',
      style: `stroke: ${EXPORT_FIXTURE.edgeStroke}; stroke-width: 1.75`,
    }),
  );

  return edge;
};

export const buildExportCanvas = ({ nodes, edges }: IUnitExportScene = EXPORT_SCENE): HTMLElement => {
  const edgeLayer = svgElement('svg');
  edgeLayer.append(...edges.map(exportEdge));
  const root = htmlElement('div', {}, [...nodes.map(exportNode), edgeLayer]);
  document.body.append(root);
  onTestFinished(() => root.remove());

  return root;
};
