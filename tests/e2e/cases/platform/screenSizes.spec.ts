import type { Locator } from '@playwright/test';

import type { IScreenPoint } from '@interfaces';

import {
  CENTER_TOLERANCE_PX,
  COPY,
  LANDING_WORLD_SELECTOR,
  LAPTOP_WINDOW,
  LONG_THREAD_LIST,
  NARROWED_WINDOW,
  OPEN_CLAIM,
  OVERLAY_TOP_PX,
  RAIL_EDGE_GAP_PX,
  READABLE_CANVAS_ZOOM,
  SCREEN_SIZE_QUESTION,
  SCREEN_SIZES,
  SETTINGS_SECTION_KEYS,
  SHORT_LAPTOP_WINDOW,
  SHORT_WINDOW,
  SMALL_LAPTOP_WINDOW,
  TRANSLATIONS,
  VALID_CLAIM,
} from '../../consts';
import { expect, guestTest, test } from '../../fixtures';
import {
  answerOnboardingOffer,
  canScrollSideways,
  countCoveredPoints,
  countNodesUnderTourCard,
  getNavRow,
  getNode,
  getPane,
  getQuestionNode,
  getSettingsModal,
  getSidebar,
  getToolbar,
  getToolbarButton,
  getUserMenuTrigger,
  measureCanvasWidth,
  measureDistance,
  measureOffsetFromCanvasCenter,
  openExportMenu,
  openNodeMenu,
  openPaneMenu,
  openReferenceSearch,
  openSection,
  openSettings,
  readCanvasZoom,
  readClippedTexts,
  seedEdge,
  seedNodes,
  seedThread,
  selectTool,
  waitForCanvas,
  watchExampleUntil,
} from '../../utils';

SCREEN_SIZES.forEach(({ name, viewport }) => {
  guestTest.describe(`public pages on ${name}`, () => {
    guestTest.use({ viewport });

    guestTest.describe('GIVEN a visitor without a session', () => {
      guestTest.describe('WHEN the landing page opens', () => {
        guestTest.beforeEach(async ({ page }) => {
          await page.goto('/');
          await expect(page.getByRole('heading', { name: COPY.landing.hero.title })).toBeVisible();
        });

        guestTest('THEN the page cannot be scrolled sideways', async ({ page }) => {
          await expect.poll(() => canScrollSideways(page.locator(LANDING_WORLD_SELECTOR))).toBe(false);
        });
      });

      guestTest.describe('WHEN the sign-in page opens', () => {
        guestTest.beforeEach(async ({ page }) => {
          await page.goto('/login');
          await expect(page.getByRole('heading', { name: COPY.auth.signIn.heading })).toBeVisible();
        });

        guestTest('THEN the page cannot be scrolled sideways', async ({ page }) => {
          await expect.poll(() => canScrollSideways(page.locator('html'))).toBe(false);
        });
      });
    });
  });

  test.describe(`the platform on ${name}`, () => {
    test.use({ viewport });

    test.describe('GIVEN a thread canvas', () => {
      test.beforeEach(async ({ page, workspace, account }) => {
        const thread = await seedThread(workspace.id, 'Screen sizes', account.id, { question: SCREEN_SIZE_QUESTION });
        await page.goto(`/platform/${workspace.id}/${thread.id}`);
        await waitForCanvas(page);
      });

      test.describe('WHEN it opens', () => {
        test('THEN the sidebar, the canvas and the toolbar all fit inside the window', async ({ page }) => {
          await expect(getSidebar(page)).toBeInViewport({ ratio: 1 });
          await expect(getPane(page)).toBeInViewport({ ratio: 1 });
          await expect(getToolbar(page)).toBeInViewport({ ratio: 1 });
        });
      });
    });
  });
});

test.describe('the platform on a short window', () => {
  test.use({ viewport: SHORT_WINDOW });

  test.describe('GIVEN a thread canvas', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Short window', account.id, { question: SCREEN_SIZE_QUESTION });
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN the last tool of the rail is picked', () => {
      test.beforeEach(async ({ page }) => {
        await selectTool(page, COPY.platform.canvas.tools.items.crossReference.label);
      });

      test('THEN the tool scrolls into reach and the help button stays in the window', async ({ page }) => {
        await expect(getToolbarButton(page, COPY.platform.canvas.tools.items.crossReference.label)).toHaveAttribute(
          'aria-pressed',
          'true',
        );
        await expect(getToolbarButton(page, COPY.platform.onboarding.menuLabel)).toBeInViewport({ ratio: 1 });
      });
    });

    test.describe('WHEN the export menu opens', () => {
      let menu: Locator;

      test.beforeEach(async ({ page }) => {
        menu = await openExportMenu(page);
      });

      test('THEN the whole menu fits inside the window', async () => {
        await expect(menu).toBeInViewport({ ratio: 1 });
      });
    });

    test.describe('WHEN the account menu opens', () => {
      test.beforeEach(async ({ page }) => {
        await getUserMenuTrigger(page).click();
      });

      test('THEN the whole menu fits inside the window', async ({ page }) => {
        await expect(page.getByRole('dialog')).toBeInViewport({ ratio: 1 });
      });
    });

    test.describe('WHEN the settings dialog opens', () => {
      test.beforeEach(async ({ page }) => {
        await openSettings(page);
      });

      test('THEN the whole dialog fits inside the window', async ({ page }) => {
        await expect(getSettingsModal(page)).toBeInViewport({ ratio: 1 });
      });
    });

    test.describe('WHEN the settings dialog is scrolled to the end of its section', () => {
      test.beforeEach(async ({ page }) => {
        await openSettings(page);
        await getSettingsModal(page)
          .getByRole('button', { name: COPY.platform.settings.profile.save, exact: true })
          .scrollIntoViewIfNeeded();
      });

      test('THEN its last action comes into view inside the dialog', async ({ page }) => {
        await expect(
          getSettingsModal(page).getByRole('button', { name: COPY.platform.settings.profile.save, exact: true }),
        ).toBeInViewport({ ratio: 1 });
        await expect(getSettingsModal(page)).toBeInViewport({ ratio: 1 });
      });
    });
  });
});

TRANSLATIONS.forEach(({ name, locale, copy }) => {
  guestTest.describe(`the landing page in ${name} on a small laptop`, () => {
    guestTest.use({ viewport: SMALL_LAPTOP_WINDOW, locale });

    guestTest.describe('GIVEN a visitor without a session', () => {
      guestTest.describe('WHEN the landing page opens', () => {
        guestTest.beforeEach(async ({ page }) => {
          await page.goto('/');
          await expect(page.getByRole('heading', { name: copy.landing.hero.title })).toBeVisible();
        });

        guestTest('THEN no label on it is cut off', async ({ page }) => {
          await expect.poll(() => readClippedTexts(page.locator(LANDING_WORLD_SELECTOR))).toEqual([]);
        });
      });
    });
  });

  test.describe(`the platform in ${name} on a small laptop`, () => {
    test.use({ viewport: SMALL_LAPTOP_WINDOW, locale });

    test.describe('GIVEN a thread canvas', () => {
      test.beforeEach(async ({ page, workspace, account }) => {
        const thread = await seedThread(workspace.id, 'Translations', account.id, { question: SCREEN_SIZE_QUESTION });
        await page.goto(`/platform/${workspace.id}/${thread.id}`);
        await waitForCanvas(page);
      });

      test.describe('WHEN every section of the settings dialog is opened in turn', () => {
        let clipped: string[];

        test.beforeEach(async ({ page }) => {
          const modal = await openSettings(page, copy);
          clipped = await SETTINGS_SECTION_KEYS.reduce<Promise<string[]>>(async (previous, key) => {
            const found = await previous;
            await openSection(modal, copy.platform.settings.sections[key]);

            return [...found, ...(await readClippedTexts(modal))];
          }, Promise.resolve([]));
        });

        test('THEN no label in any section is cut off', () => {
          expect(clipped).toEqual([]);
        });
      });
    });

    test.describe('GIVEN a thread with one claim marked valid and one not marked yet', () => {
      test.beforeEach(async ({ page, workspace, account }) => {
        const thread = await seedThread(workspace.id, 'Translations', account.id, { question: SCREEN_SIZE_QUESTION });
        const [validClaimId] = await seedNodes(thread.id, account.id, [VALID_CLAIM, OPEN_CLAIM]);
        await seedEdge(thread.id, thread.questionNodeId, validClaimId ?? '');
        await page.goto(`/platform/${workspace.id}/${thread.id}`);
        await waitForCanvas(page);
      });

      test.describe('WHEN the menu of the valid claim opens', () => {
        let menu: Locator;

        test.beforeEach(async ({ page }) => {
          menu = await openNodeMenu(page, getNode(page, VALID_CLAIM.label), copy);
        });

        test('THEN no item in it is cut off', async () => {
          await expect.poll(() => readClippedTexts(menu)).toEqual([]);
        });
      });

      test.describe('WHEN the menu of the claim not marked yet opens', () => {
        let menu: Locator;

        test.beforeEach(async ({ page }) => {
          menu = await openNodeMenu(page, getNode(page, OPEN_CLAIM.label), copy);
        });

        test('THEN no item or hint in it is cut off', async () => {
          await expect.poll(() => readClippedTexts(menu)).toEqual([]);
        });
      });
    });
  });
});

test.describe('the example guide on a short laptop window', () => {
  test.use({ viewport: SHORT_LAPTOP_WINDOW });

  test.describe('GIVEN an account that has finished the first run', () => {
    test.beforeEach(async ({ page, account, workspace }) => {
      test.slow();
      await answerOnboardingOffer(account.id, ['base']);
      await page.goto('/platform');
      await expect(getSidebar(page)).toContainText(workspace.name);
    });

    test.describe('WHEN the example has grown its third branch', () => {
      test.beforeEach(async ({ page }) => {
        await watchExampleUntil(page, 'exampleFilter');
      });

      test('THEN the example is drawn at a readable size, clear of the tour card', async ({ page }) => {
        await expect.poll(() => countNodesUnderTourCard(page)).toBe(0);
        await expect.poll(() => readCanvasZoom(page)).toBeGreaterThanOrEqual(READABLE_CANVAS_ZOOM);
      });
    });

    test.describe('WHEN the example reaches the check in the sidebar', () => {
      test.beforeEach(async ({ page }) => {
        await watchExampleUntil(page, 'exampleResolved');
      });

      test('THEN every node of the example stays clear of the card beside the sidebar', async ({ page }) => {
        await expect.poll(() => countNodesUnderTourCard(page)).toBe(0);
      });
    });

    test.describe('WHEN the example wraps up after the check in the sidebar', () => {
      test.beforeEach(async ({ page }) => {
        await watchExampleUntil(page, 'exampleWrap');
      });

      test('THEN the example is drawn at a readable size again, clear of the tour card', async ({ page }) => {
        await expect.poll(() => countNodesUnderTourCard(page)).toBe(0);
        await expect.poll(() => readCanvasZoom(page)).toBeGreaterThanOrEqual(READABLE_CANVAS_ZOOM);
      });
    });
  });

  test.describe('GIVEN an account that has finished the first run and keeps a long list of threads', () => {
    test.beforeEach(async ({ page, account, workspace }) => {
      test.slow();
      await Promise.all([
        answerOnboardingOffer(account.id, ['base']),
        ...LONG_THREAD_LIST.map((name, position) => seedThread(workspace.id, name, account.id, { position })),
      ]);
      await page.goto('/platform');
      await expect(getSidebar(page)).toContainText(LONG_THREAD_LIST[0] ?? '');
    });

    test.describe('WHEN the example reaches the check in the sidebar', () => {
      test.beforeEach(async ({ page }) => {
        await watchExampleUntil(page, 'exampleResolved');
      });

      test('THEN the check on the example thread is scrolled into view in the sidebar', async ({ page }) => {
        await expect(
          getNavRow(page, COPY.platform.onboarding.example.threadName).getByLabel(COPY.platform.sidebar.resolved),
        ).toBeInViewport({ ratio: 1 });
      });
    });
  });
});

test.describe('the canvas overlays next to the tool rail on a small laptop', () => {
  test.use({ viewport: SMALL_LAPTOP_WINDOW });

  test.describe('GIVEN a thread canvas', () => {
    let besideRail: IScreenPoint;

    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Overlays', account.id, { question: SCREEN_SIZE_QUESTION });
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
      const pane = await getPane(page).boundingBox();
      besideRail = { x: (pane?.width ?? 0) - RAIL_EDGE_GAP_PX, y: OVERLAY_TOP_PX };
    });

    test.describe('WHEN the canvas menu opens right beside the tool rail', () => {
      let menu: Locator;

      test.beforeEach(async ({ page }) => {
        menu = await openPaneMenu(page, besideRail);
      });

      test('THEN the tool rail covers no part of it', async () => {
        await expect.poll(() => countCoveredPoints(menu)).toBe(0);
      });
    });

    test.describe('WHEN the reference search opens right beside the tool rail', () => {
      let panel: Locator;

      test.beforeEach(async ({ page }) => {
        panel = await openReferenceSearch(page, besideRail);
      });

      test('THEN the tool rail covers no part of it', async () => {
        await expect.poll(() => countCoveredPoints(panel)).toBe(0);
      });
    });
  });
});

test.describe('the canvas when the window is resized', () => {
  test.use({ viewport: LAPTOP_WINDOW });

  test.describe('GIVEN a thread canvas on a laptop window', () => {
    let offsetBefore: IScreenPoint;
    let canvasWidthBefore: number;

    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Resized window', account.id, { question: SCREEN_SIZE_QUESTION });
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
      [offsetBefore, canvasWidthBefore] = await Promise.all([
        measureOffsetFromCanvasCenter(page, getQuestionNode(page)),
        measureCanvasWidth(page),
      ]);
    });

    test.describe('WHEN the window gets narrower and shorter', () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(NARROWED_WINDOW);
        await expect.poll(() => measureCanvasWidth(page)).toBeLessThan(canvasWidthBefore);
      });

      test('THEN the question keeps its place relative to the centre of the canvas', async ({ page }) => {
        await expect
          .poll(async () =>
            measureDistance(offsetBefore, await measureOffsetFromCanvasCenter(page, getQuestionNode(page))),
          )
          .toBeLessThanOrEqual(CENTER_TOLERANCE_PX);
      });
    });
  });
});
