import { beforeEach, describe, expect, test } from 'vitest';

import type { IHeroEdgePath, IRect } from '@interfaces';

import { setElementLayout } from '@mocks/browser';
import { heroEdge } from '@mocks/landing';
import { buildEdgePath, measureLayoutRect } from '@/app/fragments/utils';

describe('measureLayoutRect', () => {
  let rectangle: IRect | null;
  let stage: HTMLDivElement;
  let node: HTMLDivElement;

  beforeEach(() => {
    stage = document.createElement('div');
    node = document.createElement('div');
    stage.appendChild(node);
    setElementLayout(node, { offsetLeft: 80, offsetTop: 60, offsetWidth: 100, offsetHeight: 40, offsetParent: stage });
  });

  describe('GIVEN a node placed directly on the stage', () => {
    beforeEach(() => {
      node.style.transform = 'translateY(24px) scale(0.9)';
    });

    describe('WHEN its connection anchors are measured during the entrance animation', () => {
      beforeEach(() => {
        rectangle = measureLayoutRect(node, stage);
      });

      test('THEN the layout offsets are used and the animated transform is ignored', () => {
        expect(rectangle).toEqual({ x: 80, y: 60, width: 100, height: 40 });
      });
    });
  });

  describe('GIVEN a node nested in a positioned wrapper', () => {
    beforeEach(() => {
      const wrapper = document.createElement('div');
      stage.appendChild(wrapper);
      wrapper.appendChild(node);
      setElementLayout(wrapper, { offsetLeft: 20, offsetTop: 30, offsetParent: stage });
      setElementLayout(node, { offsetParent: wrapper });
    });

    describe('WHEN its layout rectangle is measured', () => {
      beforeEach(() => {
        rectangle = measureLayoutRect(node, stage);
      });

      test('THEN wrapper offsets are included', () => {
        expect(rectangle).toEqual({ x: 100, y: 90, width: 100, height: 40 });
      });
    });
  });

  describe('GIVEN a node centered with percentage translation', () => {
    beforeEach(() => {
      node.style.translate = '-50% -50%';
      node.style.transform = 'translateY(24px) scale(0.9)';
    });

    describe('WHEN its connection anchors are measured during the entrance animation', () => {
      beforeEach(() => {
        rectangle = measureLayoutRect(node, stage);
      });

      test('THEN centering is included without the animated transform', () => {
        expect(rectangle).toEqual({ x: 30, y: 40, width: 100, height: 40 });
      });
    });
  });

  describe('GIVEN a responsive node hidden from layout', () => {
    beforeEach(() => {
      setElementLayout(node, { offsetWidth: 0 });
    });

    describe('WHEN its layout rectangle is requested', () => {
      beforeEach(() => {
        rectangle = measureLayoutRect(node, stage);
      });

      test('THEN it cannot create an edge to an invisible node', () => {
        expect(rectangle).toBeNull();
      });
    });
  });
});

describe('buildEdgePath', () => {
  let path: IHeroEdgePath;

  describe('GIVEN two horizontally separated cards', () => {
    describe('WHEN their edge is built', () => {
      beforeEach(() => {
        path = buildEdgePath(
          heroEdge('p1', 'c1'),
          { x: 0, y: 0, width: 100, height: 40 },
          { x: 200, y: 0, width: 100, height: 40 },
        );
      });

      test('THEN the edge leaves the nearest side at the card midpoint', () => {
        expect(path).toMatchObject({ id: 'p1-c1', source: 'p1', target: 'c1' });
        expect(path.d).toMatch(/^M 100 20 C /);
        expect(path.d).not.toContain('NaN');
      });
    });
  });
});
