'use client';

import type { ICanvasExportImage, IRect, TCanvasExportFormat, TCanvasExportOutcome } from '@interfaces';

import {
  EXPORT_FILENAME_MAX_LENGTH,
  EXPORT_JPEG_QUALITY,
  EXPORT_MARK_TEXT,
  EXPORT_MAX_DIMENSION,
  EXPORT_MAX_PIXELS,
  EXPORT_MIME_TYPES,
  EXPORT_MIN_SCALE,
  EXPORT_SCALE,
  EXPORT_URL_LIFETIME_MS,
  FILENAME_FORBIDDEN_PATTERN,
  FILENAME_RESERVED_PATTERN,
  FILENAME_TRAILING_PATTERN,
} from './consts';
import { createCanvasSvg } from './svg';

const isPrintable = (character: string): boolean => {
  const code = character.charCodeAt(0);

  return code >= 32 && code !== 127;
};

export const getExportFilename = (threadName: string, format: TCanvasExportFormat): string => {
  const name = Array.from(threadName.normalize('NFC'))
    .filter(isPrintable)
    .join('')
    .replace(FILENAME_FORBIDDEN_PATTERN, '-')
    .trim();
  const shortened =
    Array.from(name).slice(0, EXPORT_FILENAME_MAX_LENGTH).join('').replace(FILENAME_TRAILING_PATTERN, '') ||
    EXPORT_MARK_TEXT;
  const safeName = FILENAME_RESERVED_PATTERN.test(shortened) ? `_${shortened}` : shortened;

  return `${safeName}.${format}`;
};

export const getRasterDimensions = (width: number, height: number): Pick<IRect, 'width' | 'height'> | null => {
  const scale = Math.min(
    EXPORT_SCALE,
    EXPORT_MAX_DIMENSION / width,
    EXPORT_MAX_DIMENSION / height,
    Math.sqrt(EXPORT_MAX_PIXELS / width / height),
  );
  if (!Number.isFinite(scale) || scale < EXPORT_MIN_SCALE || width <= 0 || height <= 0) return null;

  return { width: Math.floor(width * scale), height: Math.floor(height * scale) };
};

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load the export image'));
    image.src = url;
  });

const encodeCanvas = (canvas: HTMLCanvasElement, type: string): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, type, EXPORT_JPEG_QUALITY));

const rasterizeCanvasSvg = async (
  { svg, width, height }: ICanvasExportImage,
  format: Exclude<TCanvasExportFormat, 'svg'>,
): Promise<Blob | null> => {
  const dimensions = getRasterDimensions(width, height);
  if (!dimensions) return null;
  const url = URL.createObjectURL(new Blob([svg], { type: EXPORT_MIME_TYPES.svg }));
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  try {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas rendering is unavailable');
    context.drawImage(await loadImage(url), 0, 0, canvas.width, canvas.height);
    const blob = await encodeCanvas(canvas, EXPORT_MIME_TYPES[format]);
    if (blob && blob.type !== EXPORT_MIME_TYPES[format]) throw new Error('Could not encode the image');

    return blob;
  } finally {
    URL.revokeObjectURL(url);
    canvas.width = 0;
    canvas.height = 0;
  }
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), EXPORT_URL_LIFETIME_MS);
};

export const exportCanvas = async (
  root: HTMLElement,
  threadName: string,
  format: TCanvasExportFormat,
): Promise<TCanvasExportOutcome> => {
  const image = await createCanvasSvg(root, threadName);
  const blob =
    format === 'svg' ? new Blob([image.svg], { type: EXPORT_MIME_TYPES.svg }) : await rasterizeCanvasSvg(image, format);
  if (!blob) return 'too-large';
  downloadBlob(blob, getExportFilename(threadName, format));

  return 'downloaded';
};
