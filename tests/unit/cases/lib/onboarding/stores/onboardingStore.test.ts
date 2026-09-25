import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { GUIDES, useOnboardingStore } from '@/lib/onboarding';

const LAST_GUIDE_ID = GUIDES[GUIDES.length - 1]!.id;

const finishGuide = (id: (typeof GUIDES)[number]['id']) => {
  const steps = GUIDES.find((guide) => guide.id === id)?.steps.length ?? 0;
  useOnboardingStore.getState().startGuide(id);
  Array.from({ length: steps }).forEach(() => useOnboardingStore.getState().advance());
};

afterEach(() => useOnboardingStore.getState().forget());

describe('onboardingStore', () => {
  describe('GIVEN an account with no stored progress', () => {
    describe('WHEN its progress is loaded', () => {
      beforeEach(() => useOnboardingStore.getState().hydrate('user-1', null));

      test('THEN the offer opens once', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ loaded: true, offerAnswered: false, offerOpen: true });
      });
    });

    describe('WHEN the offer is declined', () => {
      beforeEach(() => {
        useOnboardingStore.getState().hydrate('user-1', null);
        useOnboardingStore.getState().answerOffer();
      });

      test('THEN it is marked answered and closed, and the help menu is pointed out', () => {
        expect(useOnboardingStore.getState()).toMatchObject({
          offerAnswered: true,
          offerOpen: false,
          hint: 'afterDecline',
        });
      });
    });
  });

  describe('GIVEN an account that already answered the offer', () => {
    describe('WHEN its progress is loaded', () => {
      beforeEach(() =>
        useOnboardingStore.getState().hydrate('user-1', { offerAnswered: true, completedGuides: ['base'] }),
      );

      test('THEN the offer stays closed and progress is restored', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ offerOpen: false, completedGuides: ['base'] });
      });
    });

    describe('WHEN the offer is reopened from the chrome', () => {
      beforeEach(() => {
        useOnboardingStore.getState().hydrate('user-1', { offerAnswered: true, completedGuides: ['base'] });
        useOnboardingStore.getState().openOffer();
      });

      test('THEN it shows again without losing progress', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ offerOpen: true, completedGuides: ['base'] });
      });
    });

    describe('WHEN the guides are opened and closed again', () => {
      beforeEach(() => {
        useOnboardingStore.getState().hydrate('user-1', { offerAnswered: true, completedGuides: ['base'] });
        useOnboardingStore.getState().openPicker();
        useOnboardingStore.getState().closePicker();
      });

      test('THEN the picker is closed and nothing else opens', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ pickerOpen: false, offerOpen: false, run: null });
      });
    });
  });

  describe('GIVEN a loaded account that finished a guide after its progress was read', () => {
    beforeEach(() => {
      useOnboardingStore.getState().hydrate('user-1', { offerAnswered: true, completedGuides: ['base'] });
      finishGuide('settings');
    });

    describe('WHEN a late read arrives with a guide finished elsewhere but without that one', () => {
      beforeEach(() => {
        useOnboardingStore
          .getState()
          .hydrate('user-1', { offerAnswered: true, completedGuides: ['base', 'workspace'] });
      });

      test('THEN the guides finished here and those stored elsewhere are both kept', () => {
        expect(useOnboardingStore.getState().completedGuides).toEqual(['base', 'settings', 'workspace']);
      });
    });
  });

  describe('GIVEN an answered offer left behind by the previous account', () => {
    beforeEach(() => {
      useOnboardingStore.getState().hydrate('user-1', { offerAnswered: true, completedGuides: ['base'] });
      useOnboardingStore.getState().startGuide('base');
    });

    describe('WHEN somebody else signs in on the same tab', () => {
      beforeEach(() => useOnboardingStore.getState().hydrate('user-2', null));

      test('THEN the offer greets them with nothing carried over', () => {
        expect(useOnboardingStore.getState()).toMatchObject({
          userId: 'user-2',
          offerAnswered: false,
          offerOpen: true,
          completedGuides: [],
          run: null,
        });
      });
    });

    describe('WHEN their own progress is loaded again', () => {
      beforeEach(() => useOnboardingStore.getState().hydrate('user-1', { offerAnswered: false, completedGuides: [] }));

      test('THEN the answer they just gave survives the late read', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ offerAnswered: true, offerOpen: false });
        expect(useOnboardingStore.getState().run).not.toBeNull();
      });
    });
  });

  describe('GIVEN a loaded account with a signal left over from earlier', () => {
    beforeEach(() => {
      useOnboardingStore.getState().hydrate('user-1', null);
      useOnboardingStore.setState({ signals: new Set(['canvasExported']) });
    });

    describe('WHEN a guide is started', () => {
      beforeEach(() => useOnboardingStore.getState().startGuide('base'));

      test('THEN it starts at the first step with the offer answered and signals cleared', () => {
        expect(useOnboardingStore.getState()).toMatchObject({
          run: { guideId: 'base', stepIndex: 0 },
          offerAnswered: true,
          offerOpen: false,
        });
        expect(useOnboardingStore.getState().signals.size).toBe(0);
      });
    });
  });

  describe('GIVEN a running guide', () => {
    beforeEach(() => {
      useOnboardingStore.getState().hydrate('user-1', null);
      useOnboardingStore.getState().startGuide('base');
    });

    describe('WHEN an action the guide waits for happens', () => {
      beforeEach(() => useOnboardingStore.getState().markSignal('canvasExported'));

      test('THEN the signal is kept for the run', () => {
        expect(useOnboardingStore.getState().signals.has('canvasExported')).toBe(true);
      });
    });

    describe('WHEN a step is advanced', () => {
      beforeEach(() => useOnboardingStore.getState().advance());

      test('THEN the run moves on', () => {
        expect(useOnboardingStore.getState().run).toEqual({ guideId: 'base', stepIndex: 1 });
      });
    });

    describe('WHEN the target of a later step disappears and the run rewinds', () => {
      beforeEach(() => {
        useOnboardingStore.getState().advance();
        useOnboardingStore.getState().advance();
        useOnboardingStore.getState().rewind();
      });

      test('THEN it steps back instead of dropping the run', () => {
        expect(useOnboardingStore.getState().run).toEqual({ guideId: 'base', stepIndex: 1 });
      });
    });

    describe('WHEN a rewind is asked for on the very first step', () => {
      beforeEach(() => useOnboardingStore.getState().rewind());

      test('THEN the run stays where it is', () => {
        expect(useOnboardingStore.getState().run).toEqual({ guideId: 'base', stepIndex: 0 });
      });
    });

    describe('WHEN the run is quit halfway', () => {
      beforeEach(() => {
        useOnboardingStore.getState().advance();
        useOnboardingStore.getState().quitRun();
      });

      test('THEN the run clears, nothing is marked complete and the help menu is pointed out', () => {
        expect(useOnboardingStore.getState()).toMatchObject({
          run: null,
          completedGuides: [],
          offerAnswered: true,
          hint: 'afterDecline',
        });
      });
    });

    describe('WHEN the guides are opened while the help menu is pointed out', () => {
      beforeEach(() => {
        useOnboardingStore.getState().quitRun();
        useOnboardingStore.getState().openPicker();
      });

      test('THEN the pointer gives way to the picker', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ pickerOpen: true, hint: null });
      });
    });
  });

  describe('GIVEN a running area guide', () => {
    beforeEach(() => {
      useOnboardingStore.getState().hydrate('user-1', { offerAnswered: true, completedGuides: ['base'] });
      useOnboardingStore.getState().startGuide('settings');
    });

    describe('WHEN it is quit halfway', () => {
      beforeEach(() => useOnboardingStore.getState().quitRun());

      test('THEN the help menu is not pointed out, because the user came from the picker', () => {
        expect(useOnboardingStore.getState().hint).toBeNull();
      });
    });

    describe('WHEN it is finished', () => {
      beforeEach(() => finishGuide('settings'));

      test('THEN the picker opens for the next guide', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ pickerOpen: true, hint: null });
      });
    });
  });

  describe('GIVEN an account that already finished the base pass', () => {
    beforeEach(() =>
      useOnboardingStore.getState().hydrate('user-1', { offerAnswered: true, completedGuides: ['base'] }),
    );

    describe('WHEN the base pass is replayed to the end', () => {
      beforeEach(() => finishGuide('base'));

      test('THEN the picker opens as after any other guide, without pointing at the help menu', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ pickerOpen: true, hint: null });
      });
    });

    describe('WHEN a replay of the base pass is quit halfway', () => {
      beforeEach(() => {
        useOnboardingStore.getState().startGuide('base');
        useOnboardingStore.getState().quitRun();
      });

      test('THEN the help menu is not pointed out again', () => {
        expect(useOnboardingStore.getState().hint).toBeNull();
      });
    });
  });

  describe('GIVEN the help menu is pointed out', () => {
    beforeEach(() => {
      useOnboardingStore.getState().hydrate('user-1', null);
      useOnboardingStore.getState().answerOffer();
    });

    describe('WHEN the pointer is dismissed', () => {
      beforeEach(() => useOnboardingStore.getState().dismissHint());

      test('THEN it goes away', () => {
        expect(useOnboardingStore.getState().hint).toBeNull();
      });
    });

    describe('WHEN a guide is started from elsewhere', () => {
      beforeEach(() => useOnboardingStore.getState().startGuide('base'));

      test('THEN the pointer goes away with the run starting', () => {
        expect(useOnboardingStore.getState().hint).toBeNull();
      });
    });
  });

  describe('GIVEN no guide running', () => {
    beforeEach(() => useOnboardingStore.getState().hydrate('user-1', null));

    describe('WHEN an action a guide would wait for happens', () => {
      beforeEach(() => useOnboardingStore.getState().markSignal('canvasExported'));

      test('THEN nothing is recorded', () => {
        expect(useOnboardingStore.getState().signals.size).toBe(0);
      });
    });
  });

  describe('GIVEN a loaded account that has not finished the base pass', () => {
    beforeEach(() => useOnboardingStore.getState().hydrate('user-1', null));

    describe('WHEN the last step of the base pass is passed', () => {
      beforeEach(() => finishGuide('base'));

      test('THEN the guide is recorded and the help menu is pointed out instead of opening the picker', () => {
        expect(useOnboardingStore.getState()).toMatchObject({
          run: null,
          completedGuides: ['base'],
          pickerOpen: false,
          celebrating: false,
          hint: 'afterTour',
        });
      });
    });

    describe('WHEN the same guide is finished twice', () => {
      beforeEach(() => {
        finishGuide('base');
        finishGuide('base');
      });

      test('THEN it is not recorded twice', () => {
        expect(useOnboardingStore.getState().completedGuides).toEqual(['base']);
      });
    });
  });

  describe('GIVEN every guide but one finished', () => {
    beforeEach(() =>
      useOnboardingStore.getState().hydrate('user-1', {
        offerAnswered: true,
        completedGuides: GUIDES.slice(0, -1).map((guide) => guide.id),
      }),
    );

    describe('WHEN the last one is finished', () => {
      beforeEach(() => finishGuide(LAST_GUIDE_ID));

      test('THEN the celebration opens instead of the picker', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ celebrating: true, pickerOpen: false, run: null });
      });
    });

    describe('WHEN the celebration that follows is closed', () => {
      beforeEach(() => {
        finishGuide(LAST_GUIDE_ID);
        useOnboardingStore.getState().closeCelebration();
      });

      test('THEN it stays closed with the progress kept', () => {
        expect(useOnboardingStore.getState().celebrating).toBe(false);
        expect(useOnboardingStore.getState().completedGuides).toHaveLength(GUIDES.length);
      });
    });
  });

  describe('GIVEN an account that already earned the badge', () => {
    beforeEach(() =>
      useOnboardingStore.getState().hydrate('user-1', {
        offerAnswered: true,
        completedGuides: GUIDES.map((guide) => guide.id),
      }),
    );

    describe('WHEN a finished guide is replayed to the end', () => {
      beforeEach(() => finishGuide(LAST_GUIDE_ID));

      test('THEN the picker opens instead of a second celebration', () => {
        expect(useOnboardingStore.getState()).toMatchObject({ celebrating: false, pickerOpen: true, run: null });
      });
    });
  });
});
