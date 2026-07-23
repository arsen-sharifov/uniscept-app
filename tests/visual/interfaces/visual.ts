import type { TTheme } from '@interfaces';

export interface IVisualViewportCapture {
  mode: 'viewport';
}

export interface IVisualFullPageCapture {
  mode: 'full-page';
}

export interface IVisualElementCapture {
  mode: 'element';
  selector: string;
}

export interface IVisualRegionCapture {
  mode: 'region';
  selectors: readonly string[];
  padding: number;
  includeDescendants?: boolean;
}

export type TVisualCaptureConfig =
  | IVisualViewportCapture
  | IVisualFullPageCapture
  | IVisualElementCapture
  | IVisualRegionCapture;

export type TVisualCapture =
  | 'aside'
  | 'canvas'
  | 'canvasNode'
  | 'dialog'
  | 'fullPage'
  | 'fullTarget'
  | 'menu'
  | 'popover'
  | 'resolvedCanvas'
  | 'stepper'
  | 'target'
  | 'viewport';

export interface IVisualClip {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface IVisualCase {
  name: string;
  storyId: string;
  capture: TVisualCapture;
  urlArgs?: string;
}

export interface IVisualConfig {
  themes: readonly TTheme[];
  captures: Record<TVisualCapture, TVisualCaptureConfig>;
  cases: readonly IVisualCase[];
}
