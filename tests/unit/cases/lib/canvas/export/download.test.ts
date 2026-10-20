import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TCanvasExportOutcome } from '@interfaces';

import { EXPORT_THREAD_NAME } from '@mocks/canvasExport';
import {
  EXPORT_FIXTURE,
  EXPORT_SCENES,
  buildExportCanvas,
  encodeAsPng,
  encodeAsRequested,
  encodeNothing,
  stubCanvasExport,
  stubDownloads,
  stubImageDecoding,
  stubObjectUrls,
} from '@mocks/canvasExportDom';
import { BIDI_SAFE_FILENAME, BIDI_THREAD_NAME, LONG_THREAD_NAME, UNICODE_THREAD_NAME } from '@mocks/canvasExportValues';
import { EXPORT_URL_LIFETIME_MS, exportCanvas, getExportFilename, getRasterDimensions } from '@/lib/canvas/export';

let root: HTMLElement;
let outcome: TCanvasExportOutcome;
let downloads: string[];
let blobs: Blob[];

afterEach(() => {
  vi.useRealTimers();
});

describe('getExportFilename', () => {
  describe('GIVEN a multilingual thread name with forbidden filename characters', () => {
    describe('WHEN the export filename is created', () => {
      test('THEN it preserves Unicode and replaces path separators', () => {
        expect(getExportFilename(UNICODE_THREAD_NAME, 'svg')).toBe('Рішення- café - équipe-.svg');
      });
    });
  });

  describe('GIVEN a Windows device name or an empty name', () => {
    describe('WHEN the export filename is created', () => {
      test('THEN it produces a usable filename', () => {
        expect(getExportFilename('CON', 'png')).toBe('_CON.png');
        expect(getExportFilename('LPT1.notes', 'jpg')).toBe('_LPT1.notes.jpg');
        expect(getExportFilename(' ... ', 'svg')).toBe('Uniscept.svg');
      });
    });
  });

  describe('GIVEN a thread name with bidi control characters', () => {
    describe('WHEN the export filename is created', () => {
      test('THEN the controls are removed so the name cannot disguise its extension', () => {
        expect(getExportFilename(BIDI_THREAD_NAME, 'svg')).toBe(BIDI_SAFE_FILENAME);
      });
    });
  });

  describe('GIVEN a long thread name', () => {
    describe('WHEN the export filename is created', () => {
      test('THEN it leaves room for the extension', () => {
        expect(getExportFilename(LONG_THREAD_NAME, 'png')).toHaveLength(124);
        expect(getExportFilename(LONG_THREAD_NAME, 'png')).toMatch(/\.png$/);
      });
    });
  });
});

describe('getRasterDimensions', () => {
  describe('GIVEN a typical graph', () => {
    describe('WHEN raster dimensions are computed', () => {
      test('THEN it uses three pixels per canvas pixel', () => {
        expect(getRasterDimensions(1200, 800)).toEqual({ width: 3600, height: 2400 });
      });
    });
  });

  describe('GIVEN a large graph that exceeds the preferred pixel budget', () => {
    describe('WHEN raster dimensions are computed', () => {
      test('THEN it preserves at least double resolution within the memory limit', () => {
        expect(getRasterDimensions(4000, 4000)).toEqual({ width: 8192, height: 8192 });
      });
    });
  });

  describe('GIVEN a graph too large for a readable bitmap', () => {
    describe('WHEN raster dimensions are computed', () => {
      test('THEN it yields no dimensions so the caller can suggest a vector export', () => {
        expect(getRasterDimensions(9000, 1000)).toBeNull();
        expect(getRasterDimensions(5000, 5000)).toBeNull();
      });
    });
  });
});

describe('exportCanvas', () => {
  beforeEach(() => {
    stubCanvasExport();
    stubImageDecoding();
    blobs = stubObjectUrls();
    downloads = stubDownloads();
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(encodeAsRequested);
  });

  describe('GIVEN a small connected graph', () => {
    beforeEach(() => {
      root = buildExportCanvas();
    });

    describe('WHEN it is exported as SVG', () => {
      beforeEach(async () => {
        outcome = await exportCanvas(root, EXPORT_THREAD_NAME, 'svg');
      });

      test('THEN the vector file downloads under the thread name while its URL stays alive', () => {
        expect(outcome).toBe('downloaded');
        expect(downloads).toEqual([`${EXPORT_THREAD_NAME}.svg`]);
        expect(blobs.map((blob) => blob.type)).toEqual(['image/svg+xml']);
        expect(URL.revokeObjectURL).not.toHaveBeenCalled();
      });
    });

    describe('WHEN it is exported as SVG and the download URL outlives its lifetime', () => {
      beforeEach(async () => {
        vi.useFakeTimers({ toFake: ['setTimeout'] });
        await exportCanvas(root, EXPORT_THREAD_NAME, 'svg');
        vi.advanceTimersByTime(EXPORT_URL_LIFETIME_MS);
      });

      test('THEN the download URL is released', () => {
        expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith(EXPORT_FIXTURE.blobUrl);
      });
    });

    describe('WHEN it is exported as PNG', () => {
      beforeEach(async () => {
        outcome = await exportCanvas(root, EXPORT_THREAD_NAME, 'png');
      });

      test('THEN the rasterised file downloads and the intermediate SVG URL is released', () => {
        expect(outcome).toBe('downloaded');
        expect(downloads).toEqual([`${EXPORT_THREAD_NAME}.png`]);
        expect(blobs.map((blob) => blob.type)).toEqual(['image/svg+xml', 'image/png']);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(EXPORT_FIXTURE.blobUrl);
      });
    });

    describe('WHEN it is exported as JPG', () => {
      beforeEach(async () => {
        outcome = await exportCanvas(root, EXPORT_THREAD_NAME, 'jpg');
      });

      test('THEN the bitmap is encoded as JPEG under the jpg extension', () => {
        expect(outcome).toBe('downloaded');
        expect(downloads).toEqual([`${EXPORT_THREAD_NAME}.jpg`]);
        expect(blobs.map((blob) => blob.type)).toEqual(['image/svg+xml', 'image/jpeg']);
      });
    });

    describe('WHEN the browser cannot encode the bitmap', () => {
      beforeEach(async () => {
        vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(encodeNothing);
        outcome = await exportCanvas(root, EXPORT_THREAD_NAME, 'jpg');
      });

      test('THEN the export reports the graph as too large and downloads nothing', () => {
        expect(outcome).toBe('too-large');
        expect(downloads).toEqual([]);
      });
    });

    describe('WHEN the browser silently falls back to another image type', () => {
      beforeEach(() => {
        vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(encodeAsPng);
      });

      test('THEN the export fails instead of shipping a mislabelled file', async () => {
        await expect(exportCanvas(root, EXPORT_THREAD_NAME, 'jpg')).rejects.toThrow('Could not encode the image');
        expect(downloads).toEqual([]);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(EXPORT_FIXTURE.blobUrl);
      });
    });

    describe('WHEN the intermediate SVG cannot be decoded as an image', () => {
      beforeEach(() => {
        stubImageDecoding('error');
      });

      test('THEN the export fails and still releases the SVG URL', async () => {
        await expect(exportCanvas(root, EXPORT_THREAD_NAME, 'png')).rejects.toThrow('Could not load the export image');
        expect(HTMLCanvasElement.prototype.toBlob).not.toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(EXPORT_FIXTURE.blobUrl);
      });
    });
  });

  describe('GIVEN a graph too wide for a sharp bitmap', () => {
    beforeEach(() => {
      root = buildExportCanvas(EXPORT_SCENES.wide);
    });

    describe('WHEN it is exported as PNG', () => {
      beforeEach(async () => {
        outcome = await exportCanvas(root, EXPORT_THREAD_NAME, 'png');
      });

      test('THEN the export stops before rasterising and reports the graph as too large', () => {
        expect(outcome).toBe('too-large');
        expect(downloads).toEqual([]);
        expect(HTMLCanvasElement.prototype.toBlob).not.toHaveBeenCalled();
      });
    });
  });
});
