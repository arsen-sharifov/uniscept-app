import { describe, expect, test } from 'vitest';

import {
  ECanvasTool,
  HELP_TOOL_ID,
  buildCanvasToolGroups,
  buildCanvasTools,
  buildHelpTool,
  isCanvasTool,
} from '@/components/tools';
import en from '@/locales/en.json';

const TOOLS_TRANSLATIONS = en.platform.canvas.tools;

describe('isCanvasTool', () => {
  describe('GIVEN a canvas tool id', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it passes', () => {
        expect(isCanvasTool('select')).toBe(true);
        expect(isCanvasTool('undo')).toBe(true);
      });
    });
  });

  describe('GIVEN a non-tool id', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isCanvasTool('help')).toBe(false);
        expect(isCanvasTool('paint')).toBe(false);
      });
    });
  });
});

describe('buildCanvasTools', () => {
  describe('GIVEN the english tool translations', () => {
    describe('WHEN the tools are built', () => {
      test('THEN every canvas tool id has its own entry', () => {
        const tools = buildCanvasTools(TOOLS_TRANSLATIONS);

        expect(Object.keys(tools).sort()).toEqual(Object.values(ECanvasTool).sort());
      });

      test('THEN entries carry their id, shortcut and translated label', () => {
        const tools = buildCanvasTools(TOOLS_TRANSLATIONS);

        expect(tools[ECanvasTool.AddNode]).toMatchObject({
          id: ECanvasTool.AddNode,
          shortcut: 'N',
          label: TOOLS_TRANSLATIONS.items.addNode.label,
          description: TOOLS_TRANSLATIONS.items.addNode.description,
        });
      });

      test('THEN history tools are marked as actions', () => {
        const tools = buildCanvasTools(TOOLS_TRANSLATIONS);

        expect(tools[ECanvasTool.Undo]).toMatchObject({ kind: 'action', shortcut: '⌘Z' });
        expect(tools[ECanvasTool.Redo]).toMatchObject({ kind: 'action', shortcut: '⌘⇧Z' });
      });
    });
  });
});

describe('buildCanvasToolGroups', () => {
  describe('GIVEN the english tool translations', () => {
    describe('WHEN the groups are built', () => {
      test('THEN every group holds its tools in canonical order', () => {
        const groups = buildCanvasToolGroups(TOOLS_TRANSLATIONS).map((group) => ({
          id: group.id,
          tools: group.tools.map((tool) => tool.id),
        }));

        expect(groups).toEqual([
          { id: 'navigate', tools: [ECanvasTool.Select, ECanvasTool.Pan, ECanvasTool.ZoomIn, ECanvasTool.ZoomOut] },
          { id: 'history', tools: [ECanvasTool.Undo, ECanvasTool.Redo] },
          { id: 'build', tools: [ECanvasTool.AddNode, ECanvasTool.Connect, ECanvasTool.Delete] },
          { id: 'decide', tools: [ECanvasTool.ValidPath, ECanvasTool.InvalidPath, ECanvasTool.Answer] },
          { id: 'link', tools: [ECanvasTool.CrossReference] },
        ]);
      });
    });
  });
});

describe('buildHelpTool', () => {
  describe('GIVEN the english tool translations', () => {
    describe('WHEN the help tool is built', () => {
      test('THEN it carries the help id, shortcut and translated label', () => {
        expect(buildHelpTool(TOOLS_TRANSLATIONS)).toMatchObject({
          id: HELP_TOOL_ID,
          shortcut: '?',
          label: TOOLS_TRANSLATIONS.help,
        });
      });
    });
  });
});
