import { describe, expect, test } from 'vitest';

import { FULL_AVAILABILITY, NO_AVAILABILITY, NO_HISTORY_AVAILABILITY, READONLY_AVAILABILITY } from '@mocks/toolbar';
import { isToolDisabled } from '@/components/Toolbar/utils';
import { ECanvasTool } from '@/components/tools';

describe('isToolDisabled', () => {
  describe('GIVEN full availability', () => {
    describe('WHEN any tool is checked', () => {
      test('THEN nothing is disabled', () => {
        expect(isToolDisabled(ECanvasTool.Undo, FULL_AVAILABILITY)).toBe(false);
        expect(isToolDisabled(ECanvasTool.AddNode, FULL_AVAILABILITY)).toBe(false);
        expect(isToolDisabled(ECanvasTool.Select, FULL_AVAILABILITY)).toBe(false);
      });
    });
  });

  describe('GIVEN an exhausted history', () => {
    describe('WHEN the history tools are checked', () => {
      test('THEN undo and redo are disabled', () => {
        expect(isToolDisabled(ECanvasTool.Undo, NO_HISTORY_AVAILABILITY)).toBe(true);
        expect(isToolDisabled(ECanvasTool.Redo, NO_HISTORY_AVAILABILITY)).toBe(true);
      });
    });

    describe('WHEN a navigation tool is checked', () => {
      test('THEN it stays enabled', () => {
        expect(isToolDisabled(ECanvasTool.Select, NO_HISTORY_AVAILABILITY)).toBe(false);
      });
    });
  });

  describe('GIVEN no canvas edit access', () => {
    describe('WHEN the editing tools are checked', () => {
      test('THEN every editing tool is disabled', () => {
        expect(isToolDisabled(ECanvasTool.AddNode, READONLY_AVAILABILITY)).toBe(true);
        expect(isToolDisabled(ECanvasTool.Connect, READONLY_AVAILABILITY)).toBe(true);
        expect(isToolDisabled(ECanvasTool.Delete, READONLY_AVAILABILITY)).toBe(true);
        expect(isToolDisabled(ECanvasTool.ValidPath, READONLY_AVAILABILITY)).toBe(true);
        expect(isToolDisabled(ECanvasTool.InvalidPath, READONLY_AVAILABILITY)).toBe(true);
        expect(isToolDisabled(ECanvasTool.Answer, READONLY_AVAILABILITY)).toBe(true);
        expect(isToolDisabled(ECanvasTool.CrossReference, READONLY_AVAILABILITY)).toBe(true);
      });
    });

    describe('WHEN the navigation tools are checked', () => {
      test('THEN they stay enabled', () => {
        expect(isToolDisabled(ECanvasTool.Select, READONLY_AVAILABILITY)).toBe(false);
        expect(isToolDisabled(ECanvasTool.Pan, READONLY_AVAILABILITY)).toBe(false);
        expect(isToolDisabled(ECanvasTool.ZoomIn, READONLY_AVAILABILITY)).toBe(false);
      });
    });

    describe('WHEN the history tools are checked', () => {
      test('THEN they are not gated by canvas access', () => {
        expect(isToolDisabled(ECanvasTool.Undo, READONLY_AVAILABILITY)).toBe(false);
        expect(isToolDisabled(ECanvasTool.Redo, READONLY_AVAILABILITY)).toBe(false);
      });
    });
  });

  describe('GIVEN an unknown tool id', () => {
    describe('WHEN it is checked', () => {
      test('THEN it is never disabled', () => {
        expect(isToolDisabled('help', NO_AVAILABILITY)).toBe(false);
      });
    });
  });
});
