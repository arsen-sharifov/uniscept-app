import { describe, expect, test } from 'vitest';

import type { TExampleAct, TExampleNodeKey, TExampleTarget, TGuideId, TTourStepKey } from '@interfaces';
import { EXAMPLE_NODES, GUIDE_IDS } from '@constants';
import { canvasEdge, canvasNode, comment, questionNode, referenceNode } from '@mocks/canvas';
import { FULL_TOUR_ACCESS, NO_TOUR_ACCESS, snapshot, withAnchors, withNodes } from '@mocks/onboarding';
import { ECanvasTool } from '@/components/tools';
import {
  BASE_GUIDE_ID,
  EXAMPLE_GUIDE_ID,
  GUIDES,
  findGuide,
  findUnmetRequirement,
  hasEarnedBadge,
  isFirstRun,
} from '@/lib/onboarding';
import en from '@/locales/en.json';

const guideOf = (id: TGuideId) => {
  const guide = findGuide(id);
  if (!guide) throw new Error(`No guide ${id}`);

  return guide;
};

const guideSteps = (id: TGuideId) => guideOf(id).steps;

const stepAt = (id: TGuideId, copyKey: TTourStepKey) => {
  const step = guideSteps(id).find((candidate) => candidate.copyKey === copyKey);
  if (!step) throw new Error(`Guide ${id} has no step ${copyKey}`);

  return step;
};

const doneAt = (id: TGuideId, copyKey: TTourStepKey) => {
  const { isDone } = stepAt(id, copyKey);
  if (!isDone) throw new Error(`Step ${copyKey} is a read step`);

  return isDone;
};

const anchorsOf = (id: TGuideId, copyKey: TTourStepKey) => {
  const { anchors } = stepAt(id, copyKey);
  if (!anchors) throw new Error(`Step ${copyKey} has no target`);

  return anchors;
};

const exampleSteps = guideSteps(EXAMPLE_GUIDE_ID);

const exampleActs = exampleSteps.flatMap(({ act }) => (act ? [act] : []));

const arguedNodes = exampleSteps.flatMap(({ act, speaker }) =>
  act?.type === 'argue' ? act.keys.map((key) => ({ key, speaker })) : [],
);

const exampleOptions = arguedNodes.filter(({ key }) => EXAMPLE_NODES[key].parent === 'question');

const actIndex = (predicate: (act: TExampleAct) => boolean) => exampleActs.findIndex(predicate);

const arguedAt = (key: TExampleTarget) =>
  key === 'question' ? -1 : arguedNodes.findIndex((entry) => entry.key === key);

describe('GUIDES', () => {
  describe('GIVEN the guide catalogue', () => {
    describe('WHEN every step is inspected', () => {
      test('THEN the base pass comes first and every guide has steps', () => {
        expect(GUIDES.at(0)?.id).toBe(BASE_GUIDE_ID);
        expect(GUIDES.every((guide) => guide.steps.length > 0)).toBe(true);
      });

      test('THEN the catalogue holds exactly the known guide ids', () => {
        expect(new Set(GUIDES.map((guide) => guide.id))).toEqual(new Set(GUIDE_IDS));
        expect(GUIDES).toHaveLength(GUIDE_IDS.length);
      });

      test('THEN every guide carries a title and a summary in english', () => {
        GUIDES.forEach((guide) => {
          expect(en.platform.onboarding.guides[`${guide.id}Title`]).toBeTruthy();
          expect(en.platform.onboarding.guides[`${guide.id}Summary`]).toBeTruthy();
        });
      });

      test('THEN every step copy key resolves to a title and a body', () => {
        GUIDES.flatMap((guide) => guide.steps).forEach((step) => {
          expect(en.platform.onboarding.steps[step.copyKey].title).toBeTruthy();
          expect(en.platform.onboarding.steps[step.copyKey].body).toBeTruthy();
        });
      });

      test('THEN no copy key is reused across steps', () => {
        const keys = GUIDES.flatMap((guide) => guide.steps).map((step) => step.copyKey);

        expect(new Set(keys).size).toBe(keys.length);
      });

      test('THEN every guide opens on an explanation', () => {
        GUIDES.forEach((guide) => {
          expect(guide.steps.at(0)?.isDone).toBeUndefined();
        });
      });

      test('THEN every guide but the watched example asks for at least one action', () => {
        GUIDES.filter((guide) => guide.id !== EXAMPLE_GUIDE_ID).forEach((guide) => {
          expect(guide.steps.some((step) => step.isDone)).toBe(true);
        });
      });

      test('THEN the example closes the catalogue', () => {
        expect(GUIDES.at(-1)?.id).toBe(EXAMPLE_GUIDE_ID);
      });
    });

    describe('WHEN a guide cannot run', () => {
      test('THEN every requirement names a hint that exists in english', () => {
        GUIDES.flatMap((guide) => guide.requires).forEach(({ hintKey }) => {
          expect(en.platform.onboarding.hints[hintKey]).toBeTruthy();
        });
      });

      test('THEN no hint is left without a requirement that uses it', () => {
        const used = new Set<string>(GUIDES.flatMap((guide) => guide.requires).map(({ hintKey }) => hintKey));

        expect(Object.keys(en.platform.onboarding.hints).filter((key) => !used.has(key))).toEqual([]);
      });
    });
  });

  describe('GIVEN the base pass on a brand new account', () => {
    describe('WHEN the snapshot is empty', () => {
      test('THEN no base step is done', () => {
        expect(guideSteps('base').some((step) => step.isDone?.(snapshot()))).toBe(false);
      });
    });

    describe('WHEN a workspace exists', () => {
      test('THEN the workspace step is done', () => {
        expect(doneAt('base', 'baseWorkspace')(snapshot({ workspaceCount: 1 }))).toBe(true);
      });
    });

    describe('WHEN a thread is open', () => {
      test('THEN the thread step is done', () => {
        expect(doneAt('base', 'baseThread')(snapshot({ threadId: 'thread-1' }))).toBe(true);
      });
    });
  });

  describe('GIVEN the base pass on a canvas with an unanswered question node', () => {
    describe('WHEN the question has no label', () => {
      test('THEN the question step stays open', () => {
        const blank = { ...questionNode('q'), data: { ...questionNode('q').data, label: '   ' } };

        expect(doneAt('base', 'baseQuestion')(withNodes(blank))).toBe(false);
      });
    });

    describe('WHEN the question is written', () => {
      test('THEN the question step is done', () => {
        expect(doneAt('base', 'baseQuestion')(withNodes(questionNode('q')))).toBe(true);
      });
    });
  });

  describe('GIVEN the base pass on a canvas that grows', () => {
    describe('WHEN a reasoning node is added', () => {
      test('THEN the node step is done', () => {
        expect(doneAt('base', 'baseNode')(withNodes(canvasNode('n1')))).toBe(true);
      });
    });

    describe('WHEN only a reference node exists', () => {
      test('THEN the node step stays open', () => {
        expect(doneAt('base', 'baseNode')(withNodes(referenceNode('r1')))).toBe(false);
      });
    });

    describe('WHEN the new node is still on its placeholder', () => {
      test('THEN the writing step waits for a label to be committed', () => {
        expect(doneAt('base', 'baseNodeText')(withNodes(canvasNode('n1')))).toBe(false);
        expect(doneAt('base', 'baseNodeText')(snapshot({ signals: new Set(['nodeLabelled']) }))).toBe(true);
      });
    });

    describe('WHEN the question is linked to the node', () => {
      test('THEN the connect step is done', () => {
        const linked = snapshot({
          nodes: [questionNode('q'), canvasNode('n1')],
          edges: [canvasEdge('e1', 'q', 'n1')],
        });

        expect(doneAt('base', 'baseConnect')(linked)).toBe(true);
      });
    });

    describe('WHEN the node is linked into the question the wrong way round', () => {
      test('THEN the connect step stays open', () => {
        const reversed = snapshot({
          nodes: [questionNode('q'), canvasNode('n1')],
          edges: [canvasEdge('e1', 'n1', 'q')],
        });

        expect(doneAt('base', 'baseConnect')(reversed)).toBe(false);
      });
    });

    describe('WHEN a second node and a second link arrive', () => {
      test('THEN the objection steps are done', () => {
        const pair = snapshot({
          nodes: [questionNode('q'), canvasNode('n1'), canvasNode('n2')],
          edges: [canvasEdge('e1', 'q', 'n1'), canvasEdge('e2', 'q', 'n2')],
        });

        expect(doneAt('base', 'baseObjection')(pair)).toBe(true);
        expect(doneAt('base', 'baseSecondLink')(pair)).toBe(true);
      });
    });

    describe('WHEN the second node hangs off the first claim instead of the question', () => {
      test('THEN the second link is still asked for', () => {
        const chained = snapshot({
          nodes: [questionNode('q'), canvasNode('n1'), canvasNode('n2')],
          edges: [canvasEdge('e1', 'q', 'n1'), canvasEdge('e2', 'n1', 'n2')],
        });

        expect(doneAt('base', 'baseSecondLink')(chained)).toBe(false);
      });
    });

    describe('WHEN one branch is judged and the other is rejected', () => {
      test('THEN each verdict step waits for its own mark', () => {
        const valid = withNodes(canvasNode('n1', { status: 'valid' }));

        expect(doneAt('base', 'baseValid')(valid)).toBe(true);
        expect(doneAt('base', 'baseInvalid')(valid)).toBe(false);
        expect(doneAt('base', 'baseInvalid')(withNodes(canvasNode('n2', { status: 'invalid' })))).toBe(true);
      });
    });

    describe('WHEN a node is marked as the answer', () => {
      test('THEN the closing action of the run is done', () => {
        expect(doneAt('base', 'baseAnswer')(withNodes(canvasNode('n1', { isAnswer: true })))).toBe(true);
      });
    });
  });

  describe('GIVEN the explanations woven between the base pass actions', () => {
    describe('WHEN they are inspected', () => {
      test('THEN they carry no completion of their own', () => {
        expect(stepAt('base', 'baseIntro').isDone).toBeUndefined();
        expect(stepAt('base', 'baseDirection').isDone).toBeUndefined();
        expect(stepAt('base', 'baseVerdict').isDone).toBeUndefined();
      });
    });
  });

  describe('GIVEN the connect step of the base pass', () => {
    describe('WHEN the tool has not been picked yet', () => {
      test('THEN it points at the tool', () => {
        expect(anchorsOf('base', 'baseConnect')(snapshot())).toEqual(['toolbarConnect']);
      });
    });

    describe('WHEN the tool is held but no source is chosen', () => {
      test('THEN it points at the question to start from', () => {
        expect(anchorsOf('base', 'baseConnect')(snapshot({ activeTool: ECanvasTool.Connect }))).toEqual([
          'canvasQuestionNode',
        ]);
      });
    });

    describe('WHEN the source is already chosen', () => {
      test('THEN it moves on to a node that carries no link yet', () => {
        expect(
          anchorsOf('base', 'baseConnect')(snapshot({ activeTool: ECanvasTool.Connect, pendingConnection: 'q' })),
        ).toEqual(['canvasNodeLoose', 'canvasNode']);
      });
    });
  });

  describe('GIVEN the add-node step of the base pass', () => {
    describe('WHEN the tool is picked', () => {
      test('THEN the target moves from the toolbar to the canvas', () => {
        expect(anchorsOf('base', 'baseNode')(snapshot())).toEqual(['toolbarAddNode']);
        expect(anchorsOf('base', 'baseNode')(snapshot({ activeTool: ECanvasTool.AddNode }))).toEqual(['canvas']);
      });
    });
  });

  describe('GIVEN the step that moves a read-only member into a workspace of their own', () => {
    describe('WHEN the account can already build where it is', () => {
      test('THEN the step steps aside', () => {
        expect(stepAt('base', 'baseOwnWorkspace').isSkipped?.(snapshot({ workspaceCount: 1 }))).toBe(true);
      });
    });

    describe('WHEN there is no workspace at all or its rights are still loading', () => {
      test('THEN the step steps aside and leaves it to the workspace step', () => {
        const loading = snapshot({ workspaceCount: 1, permissions: { ...NO_TOUR_ACCESS, resolved: false } });

        expect(stepAt('base', 'baseOwnWorkspace').isSkipped?.(snapshot({ permissions: NO_TOUR_ACCESS }))).toBe(true);
        expect(stepAt('base', 'baseOwnWorkspace').isSkipped?.(loading)).toBe(true);
      });
    });

    describe('WHEN the account lands in a workspace it owns', () => {
      test('THEN the step is done', () => {
        expect(doneAt('base', 'baseOwnWorkspace')(snapshot({ workspaceCount: 2 }))).toBe(true);
      });
    });
  });

  describe('GIVEN the reference steps of the canvas guide', () => {
    describe('WHEN the cross-reference tool is picked', () => {
      test('THEN the tool step is done', () => {
        expect(doneAt('canvas', 'referencesTool')(snapshot({ activeTool: ECanvasTool.CrossReference }))).toBe(true);
      });
    });

    describe('WHEN the search panel opens on the canvas', () => {
      test('THEN the placement step is done but the pick is still open', () => {
        const searching = withAnchors('canvasReferenceSearch');

        expect(doneAt('canvas', 'referencesPlace')(searching)).toBe(true);
        expect(doneAt('canvas', 'referencesPick')(searching)).toBe(false);
      });
    });

    describe('WHEN a reference node lands on the canvas', () => {
      test('THEN the pick step is done', () => {
        expect(doneAt('canvas', 'referencesPick')(withNodes(referenceNode('r1')))).toBe(true);
      });
    });
  });

  describe('GIVEN the canvas guide in a workspace that has nothing to point a reference at', () => {
    const lonely = snapshot({
      workspaceCount: 1,
      threadId: 'thread-1',
      nodes: [canvasNode('n1')],
      referenceTargetCount: 0,
    });

    describe('WHEN its reference steps are checked', () => {
      test('THEN it asks for a second thread instead of skipping the reference block', () => {
        expect(findUnmetRequirement(guideOf('canvas'), lonely)).toBeNull();
        expect(stepAt('canvas', 'referencesWhat').isSkipped).toBeUndefined();
        expect(stepAt('canvas', 'referencesThread').isSkipped?.(lonely)).toBe(false);
        expect(doneAt('canvas', 'referencesThread')(lonely)).toBe(false);
        expect(doneAt('canvas', 'referencesThread')({ ...lonely, referenceTargetCount: 1 })).toBe(true);
      });

      test('THEN the second thread is not asked for once something can be referenced', () => {
        expect(stepAt('canvas', 'referencesThread').isSkipped?.({ ...lonely, referenceTargetCount: 1 })).toBe(true);
        expect(stepAt('canvas', 'referencesTool').isSkipped?.(lonely)).toBe(true);
        expect(stepAt('canvas', 'referencesTool').isSkipped?.({ ...lonely, referenceTargetCount: 1 })).toBe(false);
      });
    });
  });

  describe('GIVEN the comment steps of the canvas guide', () => {
    describe('WHEN a comments panel is open', () => {
      test('THEN the open step is done', () => {
        expect(doneAt('canvas', 'commentsOpen')(snapshot({ openCommentsNodeId: 'n1' }))).toBe(true);
      });
    });

    describe('WHEN a node holds a comment', () => {
      test('THEN the write step is done', () => {
        expect(doneAt('canvas', 'commentsWrite')(withNodes(canvasNode('n1', { comments: [comment('c1')] })))).toBe(
          true,
        );
      });
    });
  });

  describe('GIVEN the export steps of the canvas guide', () => {
    describe('WHEN a canvas has been exported', () => {
      test('THEN the format step is done', () => {
        expect(doneAt('canvas', 'exportFormat')(snapshot({ signals: new Set(['canvasExported']) }))).toBe(true);
      });
    });
  });

  describe('GIVEN the tool steps of the canvas guide', () => {
    describe('WHEN the shortcut sheet is on screen', () => {
      test('THEN the sheet step is done', () => {
        expect(doneAt('canvas', 'toolsSheet')(withAnchors('shortcutsSheet'))).toBe(true);
      });
    });

    describe('WHEN the sheet is read before the keys are tried', () => {
      test('THEN the closing step waits for the sheet to go away', () => {
        expect(doneAt('canvas', 'toolsClose')(withAnchors('shortcutsSheet'))).toBe(false);
        expect(doneAt('canvas', 'toolsClose')(snapshot())).toBe(true);
      });
    });

    describe('WHEN the toolbar is walked tool by tool', () => {
      test('THEN every tool is shown without being asked for', () => {
        const walk: readonly TTourStepKey[] = [
          'toolsSelect',
          'toolsPan',
          'toolsZoom',
          'toolsUndo',
          'toolsAdd',
          'toolsConnect',
          'toolsDelete',
          'toolsValid',
          'toolsInvalid',
          'toolsAnswer',
          'toolsReference',
        ];

        walk.forEach((copyKey) => {
          expect(stepAt('canvas', copyKey).isDone).toBeUndefined();
          expect(anchorsOf('canvas', copyKey)(snapshot())).toHaveLength(1);
        });
      });
    });

    describe('WHEN the targets of the steps that walk the shortcut sheet are resolved', () => {
      test('THEN the reading step lights the sheet and the closing step its cross', () => {
        expect(anchorsOf('canvas', 'toolsSheetRead')(snapshot())).toEqual(['shortcutsSheet']);
        expect(anchorsOf('canvas', 'toolsClose')(snapshot())).toEqual(['shortcutsClose', 'shortcutsSheet']);
      });
    });
  });

  describe('GIVEN the structure steps of the workspace guide', () => {
    describe('WHEN a folder exists but holds no thread', () => {
      test('THEN only the folder step is done', () => {
        const withFolder = snapshot({ folderCount: 1 });

        expect(doneAt('workspace', 'structureFolder')(withFolder)).toBe(true);
        expect(doneAt('workspace', 'structureNest')(withFolder)).toBe(false);
      });
    });
  });

  describe('GIVEN the members block of the workspace guide', () => {
    describe('WHEN the workspace settings are already open', () => {
      test('THEN it does not ask for them a second time', () => {
        expect(stepAt('workspace', 'membersOpen').isSkipped?.(withAnchors('workspaceSettingsModal'))).toBe(true);
        expect(stepAt('workspace', 'membersOpen').isSkipped?.(snapshot())).toBe(false);
      });
    });
  });

  describe('GIVEN an account without editing rights', () => {
    describe('WHEN a guide runs anyway', () => {
      test('THEN the steps it cannot perform step aside', () => {
        const readOnly = snapshot({
          workspaceCount: 1,
          threadId: 'thread-1',
          nodes: [canvasNode('n1')],
          referenceTargetCount: 2,
          permissions: NO_TOUR_ACCESS,
        });

        expect(findUnmetRequirement(guideOf('canvas'), readOnly)).toBeNull();
        expect(stepAt('canvas', 'commentsOpen').isSkipped?.(readOnly)).toBe(true);
        expect(stepAt('canvas', 'referencesPlace').isSkipped?.(readOnly)).toBe(true);
        expect(stepAt('workspace', 'structureFolder').isSkipped?.(readOnly)).toBe(true);
        expect(stepAt('workspace', 'membersSection').isSkipped?.(readOnly)).toBe(true);
        expect(stepAt('workspace', 'membersOpen').isSkipped?.(readOnly)).toBe(true);
        expect(stepAt('workspace', 'structureSearch').isSkipped).toBeUndefined();
      });

      test('THEN the first run stays open because it builds a workspace of its own', () => {
        const readOnly = snapshot({ workspaceCount: 1, permissions: NO_TOUR_ACCESS });

        expect(findUnmetRequirement(guideOf(BASE_GUIDE_ID), readOnly)).toBeNull();
        expect(stepAt('base', 'baseOwnWorkspace').isSkipped?.(readOnly)).toBe(false);
        expect(doneAt('base', 'baseOwnWorkspace')(readOnly)).toBe(false);
      });

      test('THEN the members block only asks for what each right allows', () => {
        const membersOnly = snapshot({ permissions: { ...NO_TOUR_ACCESS, canManageMembers: true } });

        expect(stepAt('workspace', 'membersSection').isSkipped?.(membersOnly)).toBe(false);
        expect(stepAt('workspace', 'membersRoles').isSkipped?.(membersOnly)).toBe(true);
        expect(stepAt('workspace', 'membersOpen').isSkipped?.(membersOnly)).toBe(false);
      });
    });
  });

  describe('GIVEN steps whose action hides behind a panel', () => {
    describe('WHEN the targets are listed', () => {
      test('THEN the deeper control comes before the control that opens it', () => {
        expect(anchorsOf('base', 'baseWorkspace')(snapshot())).toEqual([
          'sidebarWorkspaceCreate',
          'sidebarNewWorkspace',
          'sidebarWorkspaceSwitcher',
        ]);
        expect(anchorsOf('canvas', 'toolsSheet')(snapshot())).toEqual(['helpMenuShortcuts', 'toolbarHelp']);
        expect(anchorsOf('settings', 'settingsAppearance')(snapshot())).toEqual([
          'settingsAppearanceNav',
          'settingsNav',
        ]);
      });
    });
  });

  describe('GIVEN every step in the catalogue', () => {
    describe('WHEN its targets are resolved against an empty snapshot', () => {
      test('THEN a step that names a resolver outside the example always yields an anchor', () => {
        GUIDES.filter((guide) => guide.id !== EXAMPLE_GUIDE_ID)
          .flatMap((guide) => guide.steps)
          .forEach(({ anchors }) => {
            if (!anchors) return;

            expect(anchors(snapshot()).length).toBeGreaterThan(0);
          });
      });

      test('THEN a step without a target or an open canvas sits in the middle of the screen', () => {
        GUIDES.flatMap((guide) => guide.steps).forEach(({ anchors, openAnchors, placement, isDone }) => {
          if (anchors || openAnchors) return;

          expect(placement).toBe('center');
          expect(isDone).toBeUndefined();
        });
      });
    });
  });

  describe('GIVEN the scripted scenes of the example guide', () => {
    describe('WHEN the speakers are read in order', () => {
      test('THEN every scene names a speaker and the two friends take turns', () => {
        const speakers = exampleSteps.map(({ speaker }) => speaker);

        expect(speakers.every(Boolean)).toBe(true);
        expect(speakers.slice(1).every((speaker, index) => speaker !== speakers[index])).toBe(true);
      });
    });

    describe('WHEN their completion is inspected', () => {
      test('THEN the user only ever presses next', () => {
        expect(exampleSteps.every(({ isDone, isSkipped }) => isDone === undefined && isSkipped === undefined)).toBe(
          true,
        );
      });
    });

    describe('WHEN the moves are played in order', () => {
      test('THEN the thread comes first and the closing scenes play nothing', () => {
        expect(exampleActs.at(0)).toEqual({ type: 'thread' });
        expect(exampleSteps.at(-1)?.act).toBeUndefined();
        expect(exampleSteps.at(-2)?.act).toBeUndefined();
      });

      test('THEN the canvas stays small: eight to twelve nodes counting the question', () => {
        const keys = arguedNodes.map(({ key }) => key);

        expect(new Set(keys).size).toBe(keys.length);
        expect(keys.length + 1).toBeGreaterThanOrEqual(8);
        expect(keys.length + 1).toBeLessThanOrEqual(12);
        expect([...keys].sort()).toEqual(Object.keys(EXAMPLE_NODES).sort());
      });

      test('THEN each speaker argues a node of their own at a time, after the node it hangs from', () => {
        arguedNodes.forEach(({ key }) => {
          expect(arguedAt(key)).toBeGreaterThan(arguedAt(EXAMPLE_NODES[key].parent));
        });
      });

      test('THEN one general question branches into several options, each backed by a reason', () => {
        expect(exampleOptions.length).toBeGreaterThanOrEqual(3);
        exampleOptions.forEach(({ key }) => {
          expect(arguedNodes.some((entry) => EXAMPLE_NODES[entry.key].parent === key)).toBe(true);
        });
      });

      test('THEN both friends put forward options of their own, like two separate users', () => {
        expect(new Set(exampleOptions.map(({ speaker }) => speaker))).toEqual(new Set(['nodi', 'ergo']));
      });

      test('THEN a node is only marked valid once the node it hangs from holds', () => {
        const validated = new Set<TExampleTarget>(['question']);

        exampleActs.forEach((act) => {
          if (act.type !== 'status' || act.status !== 'valid') return;

          act.keys.forEach((key: TExampleNodeKey) => {
            expect(validated.has(EXAMPLE_NODES[key].parent)).toBe(true);
            validated.add(key);
          });
        });
      });

      test('THEN the answer lands on a branch that was marked valid before it', () => {
        const answerIndex = actIndex((act) => act.type === 'answer');
        const answer = exampleActs[answerIndex];
        if (answer?.type !== 'answer') throw new Error('The example never picks an answer');

        const judgedAt = actIndex(
          (act) => act.type === 'status' && act.status === 'valid' && act.keys.includes(answer.key),
        );

        expect(judgedAt).toBeGreaterThan(-1);
        expect(judgedAt).toBeLessThan(answerIndex);
      });
    });

    describe('WHEN a speaker is mid-move', () => {
      test('THEN the ring follows the tool they hold or the comments they opened', () => {
        const { anchors } = stepAt(EXAMPLE_GUIDE_ID, 'exampleCapsule');

        expect(anchors?.(snapshot({ activeTool: ECanvasTool.AddNode }))).toEqual(['toolbarAddNode']);
        expect(anchors?.(snapshot({ activeTool: ECanvasTool.Connect }))).toEqual(['toolbarConnect']);
        expect(anchors?.(snapshot({ openCommentsNodeId: 'n1' }))).toEqual(['canvasCommentsPanel']);
        expect(anchors?.(snapshot())).toEqual([]);
      });
    });
  });
});

describe('findUnmetRequirement', () => {
  describe('GIVEN an account that owns no workspace yet', () => {
    describe('WHEN availability is checked', () => {
      test('THEN every area guide asks for a workspace before anything else', () => {
        const blank = snapshot();

        GUIDES.filter((guide) => guide.id !== BASE_GUIDE_ID && guide.id !== 'settings').forEach((guide) => {
          expect(findUnmetRequirement(guide, blank)?.hintKey).toBe('needsWorkspace');
        });
      });

      test('THEN the first run and the personal settings are still open', () => {
        const blank = snapshot();

        expect(findUnmetRequirement(guideOf(BASE_GUIDE_ID), blank)).toBeNull();
        expect(findUnmetRequirement(guideOf('settings'), blank)).toBeNull();
      });
    });
  });

  describe('GIVEN a workspace with no canvas open', () => {
    describe('WHEN availability is checked', () => {
      test('THEN the canvas guide asks for a canvas, then for a node', () => {
        const idle = snapshot({ workspaceCount: 1 });
        const opened = snapshot({ workspaceCount: 1, threadId: 'thread-1' });

        expect(findUnmetRequirement(guideOf('canvas'), idle)?.hintKey).toBe('needsCanvas');
        expect(findUnmetRequirement(guideOf('canvas'), opened)?.hintKey).toBe('needsNode');
        expect(findUnmetRequirement(guideOf('workspace'), idle)).toBeNull();
      });
    });
  });

  describe('GIVEN an account that can only read the workspace', () => {
    describe('WHEN the example guide is checked', () => {
      test('THEN it asks for building rights', () => {
        const readOnly = snapshot({ workspaceCount: 1, permissions: NO_TOUR_ACCESS });

        expect(findUnmetRequirement(guideOf(EXAMPLE_GUIDE_ID), readOnly)?.hintKey).toBe('needsBuildRights');
      });
    });
  });

  describe('GIVEN an account that can build but not comment', () => {
    describe('WHEN the example guide is checked', () => {
      test('THEN it is held back, because its friends leave comments', () => {
        const silent = snapshot({ workspaceCount: 1, permissions: { ...FULL_TOUR_ACCESS, canComment: false } });

        expect(findUnmetRequirement(guideOf(EXAMPLE_GUIDE_ID), silent)?.hintKey).toBe('needsBuildRights');
      });
    });
  });

  describe('GIVEN a workspace where everything is in place', () => {
    describe('WHEN availability is checked', () => {
      test('THEN every guide is available', () => {
        const ready = snapshot({
          workspaceCount: 1,
          threadId: 'thread-1',
          nodes: [questionNode('q'), canvasNode('n1')],
          edges: [canvasEdge('e1', 'q', 'n1')],
          referenceTargetCount: 3,
        });

        expect(GUIDES.every((guide) => findUnmetRequirement(guide, ready) === null)).toBe(true);
      });
    });
  });
});

describe('hasEarnedBadge', () => {
  describe('GIVEN a partially finished catalogue', () => {
    describe('WHEN the badge is checked', () => {
      test('THEN it is not earned', () => {
        expect(hasEarnedBadge([BASE_GUIDE_ID])).toBe(false);
      });
    });
  });

  describe('GIVEN every guide finished', () => {
    describe('WHEN the badge is checked', () => {
      test('THEN it is earned', () => {
        expect(hasEarnedBadge(GUIDES.map((guide) => guide.id))).toBe(true);
      });
    });
  });
});

describe('isFirstRun', () => {
  describe('GIVEN the base pass running on an account that has never finished it', () => {
    describe('WHEN the run is checked', () => {
      test('THEN it is the first run', () => {
        expect(isFirstRun({ guideId: BASE_GUIDE_ID, stepIndex: 3 }, [])).toBe(true);
      });
    });
  });

  describe('GIVEN the base pass replayed after it was finished', () => {
    describe('WHEN the run is checked', () => {
      test('THEN it is not the first run', () => {
        expect(isFirstRun({ guideId: BASE_GUIDE_ID, stepIndex: 3 }, [BASE_GUIDE_ID])).toBe(false);
      });
    });
  });

  describe('GIVEN an area guide running', () => {
    describe('WHEN the run is checked', () => {
      test('THEN it is not the first run', () => {
        expect(isFirstRun({ guideId: EXAMPLE_GUIDE_ID, stepIndex: 0 }, [BASE_GUIDE_ID])).toBe(false);
      });
    });
  });

  describe('GIVEN nothing running', () => {
    describe('WHEN the run is checked', () => {
      test('THEN it is not the first run', () => {
        expect(isFirstRun(null, [])).toBe(false);
      });
    });
  });
});
