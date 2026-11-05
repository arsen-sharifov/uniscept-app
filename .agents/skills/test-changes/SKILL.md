---
name: test-changes
description: Decide which test suites the changes need, write the tests by the project's Testing conventions and run them. Use whenever tests are added or changed, and for test tickets.
---

# Test the changes

Notion page: Testing, https://app.notion.com/p/39b666ffe87681868a74f91835867c26

## Pick the suite

- `tests/unit`: Vitest in jsdom with Supabase mocked: logic, hooks, stores, components and the api client.
- `tests/integration`: Vitest in node against the real local Supabase. Needs the database but no browser: RLS, RPCs, grants, triggers.
- `tests/e2e`: Playwright with a browser and the real backend. User journeys.
- `tests/visual`: Playwright screenshots of the built Storybook in a pinned Linux container.
- Every pull request adds unit tests for the logic and components it adds or changes. Every bug fix ships a test that fails without it.

## Layout

- Each suite keeps cases under `cases/` and only infrastructure at its root; a suite never imports from another suite.
- Unit cases mirror the source path without `src/` and without a leading dot: `src/lib/x.ts` is tested in `tests/unit/cases/lib/x.test.ts`, `.agents/hooks/guard.mjs` in `tests/unit/cases/agents/hooks/guard.test.ts`; `.test.tsx` when rendering JSX. Integration files are `.test.ts`, Playwright files `.spec.ts`. Never place tests next to sources.
- Every fake and fixture constant lives in `tests/unit/mocks/<domain>.ts`, imported through `@mocks/*`, named for what it represents; reuse before adding. Integration and e2e keep fixtures in their suite's `consts.ts` and never import `@mocks`.
- A test file holds only describes, file-level listener spies (`const onSelect = vi.fn()`), handoff `let`s and small priming or locating helpers.

## Grammar

- `describe(<subject>)` > `describe('GIVEN ...')` > `describe('WHEN ...')` > `test('THEN ...')`. Keywords uppercase, `test` never `it`, THEN in lowercase present tense without "should", no WHEN inside WHEN, no `test.each` (the guard and pull request check tables run `describe.each` over one object per case).
- Arrange in the GIVEN `beforeEach`, act in the WHEN `beforeEach`; `test` bodies hold only `expect`. Only `tests/unit/cases/api/client/` may prime and await inside the THEN.
- No step helpers. A `let` only hands a hook value forward and is assigned in `beforeEach`.
- A file-level `afterEach` restores everything the file touched (listeners, globals, timers, `vi.unstubAllGlobals()`, `vi.restoreAllMocks()`).

## Unit specifics

- Wire module doubles in one line: `vi.mock('@api/client', () => import('@mocks/canvasApi'))`; compose several slices by spreading inside the factory.
- Assert errors through `vi.mock('@/lib/events', () => import('@mocks/events'))`, never by spying on `console`.
- Components: query `screen` by role, name, text or placeholder (never test ids), interact with `fireEvent`, mock `@/i18n` with `@mocks/i18n`, and read copy as `TRANSLATIONS.<full.path>`.
- Rich text: `stubEditorLayout()`, focus with `editor.view.focus()`, `await preloadRichTextEditor()` in `beforeAll`; mock `@/components/RichTextEditor` with `@mocks/richTextEditor` when the editor is not under test.
- New environment stubs restore themselves (`stubProperty` with `onTestFinished`); stub `new`-ed browser APIs with a small class through `vi.stubGlobal`.
- Keep `mockReset: true` in `vitest.config.ts`. Coverage thresholds only go up.

## Integration specifics

- Create actors once per file in `beforeAll` (admin `createUser` with `email_confirm: true`), reuse signed-in clients through `getUserClient`, delete them with `deleteAccounts`; seed rows with an explicit `created_by` through `utils/seed.ts`.
- Expected answers: a denied INSERT is `42501`; a denied UPDATE or DELETE returns no error and 0 rows (re-read with the service role); RPCs answer `42501`, `P0002`, `22023`, `54000` or `23514`.

## E2E specifics

- Use `test` (signed-in worker account, one seeded workspace per test) or `guestTest`. A journey that ends the session or deletes the account makes its own throwaway account.
- Seed through `tests/e2e/utils/admin.ts`; keep nodes inside x 350 to 1000 and y 150 to 700; marking a node valid or as the answer needs an edge from the question node.
- Await `expectSaved(page)` before a reload; arm `waitForPreferencesSave(page)` or `waitForOnboardingSave(page)` before the click; select rich text with `doubleClickWord`.
- Locate by role, accessible name, placeholder or the existing `data-*` hooks; every visible string comes from `COPY.<full.path>`. Scope toast lookups to the Toaster region.
- Do not edit `src/` while e2e runs: Fast Refresh breaks the canvas specs.

## Visual specifics

- Run only through `pnpm test:visual`; update baselines only with `pnpm test:visual:update` and review every changed PNG.
- Open modal stories through `urlArgs`, never clicks; add `data-visual-target` only when a crop needs it.
- `@playwright/test` stays an exact version; a bump regenerates and re-reviews every baseline in the same pull request.
- When `pnpm test:visual` stops at `pnpm install` inside the container, check the known issue on the Testing page before changing anything.

## Run and report

1. Run the suites you touched with the commands and prerequisites under Commands in `AGENTS.md`.
2. Report the commands with their results. Name failures and anything you could not run. In a `test` ticket, a defect in `src/` becomes a follow-up ticket, not a code change.
