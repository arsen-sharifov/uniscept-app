'use client';

import type { XYPosition } from '@xyflow/react';

import type { ICanvasExportNode } from '@interfaces';

import { CANVAS_NODE_SELECTOR, EXPORT_NODE_SELECTOR, EXPORT_OMIT_SELECTOR, EXPORT_STAGE_CSS } from './consts';

export const createExportStage = (root: HTMLElement): HTMLDivElement => {
  const stage = document.createElement('div');
  stage.dataset.canvasExportStage = '';
  stage.setAttribute('aria-hidden', 'true');
  stage.inert = true;
  Object.assign(stage.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '0',
    height: '0',
    opacity: '0',
    pointerEvents: 'none',
  });
  const style = document.createElement('style');
  style.textContent = EXPORT_STAGE_CSS;
  stage.append(style);
  root.append(stage);

  return stage;
};

const replaceTextareas = (source: HTMLElement, clone: HTMLElement): void => {
  const inputs = source.querySelectorAll('textarea');
  clone.querySelectorAll('textarea').forEach((input, index) => {
    const label = document.createElement('p');
    label.className = input.className;
    label.textContent = inputs[index]?.value || input.placeholder;
    label.style.whiteSpace = 'pre-wrap';
    input.replaceWith(label);
  });
};

const pruneExportClone = (source: HTMLElement): HTMLElement => {
  const clone = source.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(EXPORT_OMIT_SELECTOR).forEach((child) => child.remove());
  replaceTextareas(source, clone);

  return clone;
};

const placeExportClone = (
  clone: HTMLElement,
  source: HTMLElement,
  wrapper: HTMLElement,
  stage: HTMLElement,
): XYPosition => {
  const { m41: x, m42: y } = new DOMMatrix(getComputedStyle(wrapper).transform);
  Object.assign(clone.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: getComputedStyle(source).width,
    height: 'auto',
  });
  stage.append(clone);

  return { x, y };
};

export const cloneExportNodes = (root: HTMLElement, stage: HTMLElement): ICanvasExportNode[] => {
  const placed = Array.from(root.querySelectorAll<HTMLElement>(CANVAS_NODE_SELECTOR)).map((wrapper) => {
    const source = wrapper.querySelector<HTMLElement>(EXPORT_NODE_SELECTOR);
    if (!source || !wrapper.dataset.id) throw new Error('A canvas node is not ready');
    const element = pruneExportClone(source);

    return { id: wrapper.dataset.id, element, ...placeExportClone(element, source, wrapper, stage) };
  });

  return placed.map((node) => {
    const { width, height } = node.element.getBoundingClientRect();

    return { ...node, width, height };
  });
};
