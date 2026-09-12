import type { IRect } from './geometry';

export type TCanvasExportFormat = 'png' | 'jpg' | 'svg';

export type TCanvasExportOutcome = 'downloaded' | 'too-large';

export interface ICanvasExportNode extends IRect {
  id: string;
  element: HTMLElement;
}

export interface ICanvasExportImage {
  svg: string;
  width: number;
  height: number;
}

export interface ICanvasExportContext {
  stage: HTMLElement;
  origin: IRect;
  defs: SVGDefsElement;
  scratch: CanvasRenderingContext2D;
  fonts: Set<string>;
  codePoints: Set<number>;
  colors: Map<string, string>;
  definitions: Map<string, string>;
}

export interface IExportCssListScan {
  parts: string[];
  current: string;
  depth: number;
}

export interface IExportTextLine extends IRect {
  text: string;
}

export interface IExportShadowLayer {
  color: string;
  dx: number;
  dy: number;
  blur: number;
  spread: number;
}

export interface IExportCodePointRange {
  start: number;
  end: number;
}

export interface IExportFontFace {
  family: string;
  ranges: IExportCodePointRange[];
  css: string;
  baseUrl: string;
}
