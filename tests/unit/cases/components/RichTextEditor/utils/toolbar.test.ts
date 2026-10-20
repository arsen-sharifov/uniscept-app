import type { Editor } from '@tiptap/core';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IToolbarTracker } from '@interfaces';

import { stubAnimationFrame } from '@mocks/browser';
import {
  LINKED_COLORED_HTML,
  MOVED_RECT,
  SELECTED_WORD_HTML,
  TRACKED_TOOLBAR_KEY,
  mountTestEditor,
  stubEditorLayout,
} from '@mocks/richText';
import { createToolbarTracker, shouldShowToolbar } from '@/components/RichTextEditor/utils';

let editor: Editor;
let menu: HTMLElement;

const toolbarVisibility = () =>
  shouldShowToolbar({
    editor,
    element: menu,
    view: editor.view,
    state: editor.state,
    from: editor.state.selection.from,
    to: editor.state.selection.to,
  });

beforeEach(() => {
  menu = document.createElement('div');
  document.body.append(menu);
});

afterEach(() => {
  menu.remove();
  vi.unstubAllGlobals();
});

describe('shouldShowToolbar', () => {
  beforeEach(() => {
    stubEditorLayout();
  });

  describe('GIVEN a focused editor with a word selected', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML);
      editor.view.focus();
      editor.commands.setTextSelection({ from: 6, to: 10 });
    });

    describe('WHEN the toolbar asks whether to show', () => {
      test('THEN it shows', () => {
        expect(toolbarVisibility()).toBe(true);
      });
    });

    describe('WHEN the editor turns read only', () => {
      beforeEach(() => {
        editor.setEditable(false);
      });

      test('THEN it hides', () => {
        expect(toolbarVisibility()).toBe(false);
      });
    });
  });

  describe('GIVEN a focused editor with only a caret in plain text', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML);
      editor.view.focus();
      editor.commands.setTextSelection(3);
    });

    describe('WHEN the toolbar asks whether to show', () => {
      test('THEN it stays hidden', () => {
        expect(toolbarVisibility()).toBe(false);
      });
    });
  });

  describe('GIVEN a focused editor with the caret inside a link', () => {
    beforeEach(() => {
      editor = mountTestEditor(LINKED_COLORED_HTML);
      editor.view.focus();
      editor.commands.setTextSelection(3);
    });

    describe('WHEN the toolbar asks whether to show', () => {
      test('THEN it shows so the link can be edited', () => {
        expect(toolbarVisibility()).toBe(true);
      });
    });
  });

  describe('GIVEN a selection while focus sits in an unrelated field', () => {
    let field: HTMLInputElement;

    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML);
      editor.commands.setTextSelection({ from: 6, to: 10 });
      field = document.createElement('input');
      document.body.append(field);
      field.focus();
    });

    afterEach(() => {
      field.remove();
    });

    describe('WHEN the toolbar asks whether to show', () => {
      test('THEN it hides', () => {
        expect(toolbarVisibility()).toBe(false);
      });
    });

    describe('WHEN that field moves into the toolbar', () => {
      beforeEach(() => {
        menu.append(field);
        field.focus();
      });

      test('THEN it keeps showing', () => {
        expect(toolbarVisibility()).toBe(true);
      });
    });
  });
});

describe('createToolbarTracker', () => {
  let frames: ReturnType<typeof stubAnimationFrame>;
  let layout: ReturnType<typeof stubEditorLayout>;
  let tracker: IToolbarTracker;
  let dispatch: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    layout = stubEditorLayout();
    frames = stubAnimationFrame();
    editor = mountTestEditor(SELECTED_WORD_HTML);
    editor.commands.setTextSelection({ from: 6, to: 10 });
    tracker = createToolbarTracker(TRACKED_TOOLBAR_KEY);
    dispatch = vi.spyOn(editor.view, 'dispatch');
    tracker.start(editor);
  });

  describe('GIVEN a tracked selection that stays in place', () => {
    describe('WHEN a frame passes', () => {
      beforeEach(() => {
        frames.flush();
      });

      test('THEN the toolbar is left alone and tracking continues', () => {
        expect(dispatch).not.toHaveBeenCalled();
        expect(frames.pending()).toBe(1);
      });
    });
  });

  describe('GIVEN a tracked selection whose canvas zooms', () => {
    describe('WHEN the next frame sees the selection moved', () => {
      beforeEach(() => {
        layout.moveTo(MOVED_RECT);
        frames.flush();
      });

      test('THEN the toolbar is asked to reposition', () => {
        expect(dispatch).toHaveBeenCalledOnce();
        expect(dispatch.mock.calls[0]?.[0].getMeta(TRACKED_TOOLBAR_KEY)).toBe('updatePosition');
      });
    });
  });

  describe('GIVEN a tracker that was stopped', () => {
    describe('WHEN it stops', () => {
      beforeEach(() => {
        tracker.stop();
      });

      test('THEN no frame stays scheduled', () => {
        expect(frames.pending()).toBe(0);
      });
    });
  });

  describe('GIVEN a tracked editor that gets destroyed', () => {
    describe('WHEN the next frame runs', () => {
      beforeEach(() => {
        editor.destroy();
        frames.flush();
      });

      test('THEN tracking ends on its own', () => {
        expect(frames.pending()).toBe(0);
      });
    });
  });
});
