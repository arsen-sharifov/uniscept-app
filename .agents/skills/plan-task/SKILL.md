---
name: plan-task
description: Turn a GitHub issue into an implementation plan that the person approves before any code is written. Use at the start of every task, given the issue number.
---

# Plan a task

Input: the issue number `N`.

1. Read issue #N with its labels and comments. When it is missing, closed, unclear or contradicts the product rules in `AGENTS.md`, stop and ask.
2. Check the branch. It must be `dev-N`. When it is not, switch to `dev-N` if it exists, otherwise create it from an up-to-date `main` (`git fetch origin`, then `git switch -c dev-N origin/main`). Ask when local changes are in the way.
3. Read what the change touches: the `AGENTS.md` sections and the linked Notion pages for those areas, the existing code and its tests. Look for code to reuse before planning new code.
4. Write the plan:
   - Goal: one or two sentences in the issue's own words.
   - Decisions for the person: each open question with the options and a recommendation.
   - Changes by area: the files to add or change and what changes in each.
   - Tests: the suites and the cases (see `test-changes`).
   - Locales, theme tokens, stories and visual baselines, migrations, grants and permissions: what is needed, or "none".
   - Version bump: patch or minor, by the type table in `AGENTS.md`.
   - Risks, and what stays out of scope.
5. Stop and present the plan. Write no code until the person approves it. When the person changes the plan, update it and present it again. Once it is approved, save it to `artifacts/plans/dev-N.md` (git-ignored), so later steps and fresh sessions read the same plan.
