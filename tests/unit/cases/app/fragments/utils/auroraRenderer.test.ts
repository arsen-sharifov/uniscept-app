import { beforeEach, describe, expect, test } from 'vitest';

import type { IAuroraRenderer } from '@interfaces';

import { webGlSurface } from '@mocks/browser';
import { createAuroraRenderer } from '@/app/fragments/utils/auroraRenderer';

const asCanvas = (surface: ReturnType<typeof webGlSurface>['canvas']) => surface as unknown as HTMLCanvasElement;

describe('createAuroraRenderer', () => {
  describe('GIVEN a canvas without a graphics context', () => {
    describe('WHEN a renderer is created on it', () => {
      test('THEN there is none', () => {
        expect(createAuroraRenderer({ getContext: () => null } as unknown as HTMLCanvasElement, 1)).toBeNull();
      });
    });
  });

  describe('GIVEN shaders that fail to link', () => {
    describe('WHEN a renderer is created', () => {
      test('THEN there is none', () => {
        expect(createAuroraRenderer(asCanvas(webGlSurface(false).canvas), 1)).toBeNull();
      });
    });
  });

  describe('GIVEN a working graphics context at half resolution', () => {
    let surface: ReturnType<typeof webGlSurface>;
    let renderer: IAuroraRenderer;

    beforeEach(() => {
      surface = webGlSurface();
      renderer = createAuroraRenderer(asCanvas(surface.canvas), 0.5)!;
    });

    describe('WHEN it is resized', () => {
      beforeEach(() => {
        renderer.resize(801, 601);
      });

      test('THEN the canvas, the viewport and the resolution follow the rounded scaled size', () => {
        expect(surface.canvas).toMatchObject({ width: 401, height: 301 });
        expect(surface.gl.viewport).toHaveBeenCalledExactlyOnceWith(0, 0, 401, 301);
        expect(surface.gl.uniform2f).toHaveBeenCalledExactlyOnceWith('resolution', 401, 301);
      });
    });

    describe('WHEN it is resized to nothing', () => {
      beforeEach(() => {
        renderer.resize(0, 0);
      });

      test('THEN it keeps at least one pixel', () => {
        expect(surface.canvas).toMatchObject({ width: 1, height: 1 });
      });
    });

    describe('WHEN it draws', () => {
      beforeEach(() => {
        renderer.draw(3.5, 1);
      });

      test('THEN the palette and the time reach the shader and one full-screen triangle is drawn', () => {
        expect(surface.gl.uniform1f.mock.calls).toEqual([
          ['paper', 1],
          ['time', 3.5],
        ]);
        expect(surface.gl.drawArrays).toHaveBeenCalledExactlyOnceWith(surface.gl.TRIANGLES, 0, 3);
      });
    });
  });
});
