import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { PREFERENCES_STORAGE_KEY } from '@constants';
import { THEME_BOOTSTRAP } from '@/app/themeBootstrap';

const ATTRIBUTES = ['data-theme', 'data-canvas-pattern', 'data-default-zoom', 'data-snap-to-grid', 'data-smart-guides'];

afterEach(() => {
  localStorage.clear();
  ATTRIBUTES.forEach((attribute) => document.documentElement.removeAttribute(attribute));
});

describe('THEME_BOOTSTRAP', () => {
  describe('GIVEN stored preferences with valid values', () => {
    beforeEach(() => {
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          theme: 'eclipse',
          canvasPattern: 'lines',
          defaultZoom: 125,
          snapToGrid: true,
          smartGuides: false,
        }),
      );
    });

    describe('WHEN the bootstrap script runs', () => {
      beforeEach(() => {
        new Function(THEME_BOOTSTRAP)();
      });

      test('THEN the html attributes mirror the stored preferences', () => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('eclipse');
        expect(document.documentElement.getAttribute('data-canvas-pattern')).toBe('lines');
        expect(document.documentElement.getAttribute('data-default-zoom')).toBe('125');
        expect(document.documentElement.getAttribute('data-snap-to-grid')).toBe('true');
        expect(document.documentElement.getAttribute('data-smart-guides')).toBe('false');
      });
    });
  });

  describe('GIVEN stored preferences with unknown or mistyped values', () => {
    beforeEach(() => {
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({ theme: 'neon', canvasPattern: 'zigzag', defaultZoom: 33, snapToGrid: 'yes', smartGuides: 0 }),
      );
    });

    describe('WHEN the bootstrap script runs', () => {
      beforeEach(() => {
        new Function(THEME_BOOTSTRAP)();
      });

      test('THEN every attribute falls back to its default', () => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
        expect(document.documentElement.getAttribute('data-canvas-pattern')).toBe('dots');
        expect(document.documentElement.getAttribute('data-default-zoom')).toBe('100');
        expect(document.documentElement.getAttribute('data-snap-to-grid')).toBe('false');
        expect(document.documentElement.getAttribute('data-smart-guides')).toBe('true');
      });
    });
  });

  describe('GIVEN corrupted json in storage', () => {
    beforeEach(() => {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, '{oops');
    });

    describe('WHEN the bootstrap script runs', () => {
      beforeEach(() => {
        new Function(THEME_BOOTSTRAP)();
      });

      test('THEN every attribute falls back to its default', () => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
        expect(document.documentElement.getAttribute('data-canvas-pattern')).toBe('dots');
        expect(document.documentElement.getAttribute('data-default-zoom')).toBe('100');
        expect(document.documentElement.getAttribute('data-snap-to-grid')).toBe('false');
        expect(document.documentElement.getAttribute('data-smart-guides')).toBe('true');
      });
    });
  });

  describe('GIVEN empty storage', () => {
    describe('WHEN the bootstrap script runs', () => {
      beforeEach(() => {
        new Function(THEME_BOOTSTRAP)();
      });

      test('THEN every attribute falls back to its default', () => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
        expect(document.documentElement.getAttribute('data-canvas-pattern')).toBe('dots');
        expect(document.documentElement.getAttribute('data-default-zoom')).toBe('100');
        expect(document.documentElement.getAttribute('data-snap-to-grid')).toBe('false');
        expect(document.documentElement.getAttribute('data-smart-guides')).toBe('true');
      });
    });
  });
});
