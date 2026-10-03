import { describe, expect, test } from 'vitest';

import { canvasNode, questionNode } from '@mocks/canvas';
import { NODE_ALARM_WASHES } from '@/components/Canvas/consts';
import { collectStatusTargetIds, resolveNodeWashStyle } from '@/components/Canvas/utils';

describe('collectStatusTargetIds', () => {
  describe('GIVEN several selected canvas nodes including the clicked one', () => {
    describe('WHEN targets are collected', () => {
      test('THEN the whole selection is targeted', () => {
        const nodes = [
          { ...canvasNode('n1'), selected: true },
          { ...canvasNode('n2'), selected: true },
          canvasNode('n3'),
        ];

        expect(collectStatusTargetIds(nodes, 'n1')).toEqual(['n1', 'n2']);
      });
    });
  });

  describe('GIVEN a selection that does not include the clicked node', () => {
    describe('WHEN targets are collected', () => {
      test('THEN only the clicked node is targeted', () => {
        const nodes = [
          { ...canvasNode('n1'), selected: true },
          { ...canvasNode('n2'), selected: true },
          canvasNode('n3'),
        ];

        expect(collectStatusTargetIds(nodes, 'n3')).toEqual(['n3']);
      });
    });
  });

  describe('GIVEN a selection containing the question node', () => {
    describe('WHEN targets are collected', () => {
      test('THEN non-canvas nodes are ignored', () => {
        const nodes = [
          { ...questionNode('q'), selected: true },
          { ...canvasNode('n1'), selected: true },
          canvasNode('n2'),
        ];

        expect(collectStatusTargetIds(nodes, 'n1')).toEqual(['n1']);
      });
    });
  });
});

describe('resolveNodeWashStyle', () => {
  describe('GIVEN an alarm tone', () => {
    describe('WHEN the node is at rest', () => {
      test('THEN the tone wash is painted as a flat background layer', () => {
        expect(resolveNodeWashStyle('invalid', false)).toEqual({
          backgroundImage: `linear-gradient(${NODE_ALARM_WASHES.invalid}, ${NODE_ALARM_WASHES.invalid})`,
        });
        expect(resolveNodeWashStyle('affected', false)).toEqual({
          backgroundImage: `linear-gradient(${NODE_ALARM_WASHES.affected}, ${NODE_ALARM_WASHES.affected})`,
        });
      });
    });

    describe('WHEN the node is being edited', () => {
      test('THEN no wash is painted', () => {
        expect(resolveNodeWashStyle('invalid', true)).toBeUndefined();
      });
    });
  });

  describe('GIVEN a calm tone or no tone at all', () => {
    describe('WHEN the node is at rest', () => {
      test('THEN no wash is painted', () => {
        expect(resolveNodeWashStyle('valid', false)).toBeUndefined();
        expect(resolveNodeWashStyle('answer', false)).toBeUndefined();
        expect(resolveNodeWashStyle(undefined, false)).toBeUndefined();
      });
    });
  });
});
