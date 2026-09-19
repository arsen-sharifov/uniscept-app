import { describe, expect, test } from 'vitest';

import type { TNavItem, TTourAnchor } from '@interfaces';

import { countFolders, countNestedThreads, sameAnchors } from '@/components/Tour/utils';

const thread = (id: string): TNavItem => ({ type: 'thread', id, name: id });

const folder = (id: string, items: TNavItem[] = []): TNavItem => ({ type: 'folder', id, name: id, items });

const anchors = (...values: TTourAnchor[]): ReadonlySet<TTourAnchor> => new Set(values);

describe('countFolders', () => {
  describe('GIVEN a tree with nested folders', () => {
    describe('WHEN folders are counted', () => {
      test('THEN every level is included', () => {
        expect(countFolders([thread('t1'), folder('f1', [thread('t2'), folder('f2')])])).toBe(2);
      });
    });
  });

  describe('GIVEN a flat list of threads', () => {
    describe('WHEN folders are counted', () => {
      test('THEN the count is zero', () => {
        expect(countFolders([thread('t1'), thread('t2')])).toBe(0);
      });
    });
  });
});

describe('countNestedThreads', () => {
  describe('GIVEN threads inside and outside folders', () => {
    describe('WHEN nested threads are counted', () => {
      test('THEN only threads with a folder above them count', () => {
        const items = [thread('loose'), folder('f1', [thread('t1'), folder('f2', [thread('t2')])])];

        expect(countNestedThreads(items)).toBe(2);
      });
    });
  });

  describe('GIVEN an empty folder', () => {
    describe('WHEN nested threads are counted', () => {
      test('THEN the count is zero', () => {
        expect(countNestedThreads([folder('f1')])).toBe(0);
      });
    });
  });
});

describe('sameAnchors', () => {
  describe('GIVEN two anchor sets', () => {
    describe('WHEN they are compared', () => {
      test('THEN equality holds only for identical membership', () => {
        expect(sameAnchors(anchors('canvas'), anchors('canvas'))).toBe(true);
        expect(sameAnchors(anchors('canvas'), anchors('canvasNode'))).toBe(false);
        expect(sameAnchors(anchors('canvas'), anchors('canvas', 'canvasNode'))).toBe(false);
      });
    });
  });
});
