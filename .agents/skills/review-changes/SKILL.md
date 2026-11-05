---
name: review-changes
description: Review the current changes against main for correctness, the project conventions and scope, and report ranked findings without changing code. Use before the person reviews the changes, or when asked to review a branch or a pull request.
---

# Review the changes

Review in a fresh context: a new session or a subagent that did not write the changes. Judge the diff against the issue and the plan, not against the author's explanation.

1. Collect the changes: `git fetch origin`, then `git diff origin/main...HEAD` plus uncommitted work (`git status`, `git diff`). For a pull request, read its diff and its description.
2. Read the issue they close and the approved plan in `artifacts/plans/dev-N.md` when it exists. The changes must deliver what the issue asks for and nothing unrelated.
3. Correctness first: logic errors, edge cases (empty, loading, error, offline, permission denied), async races, lost updates, undo and sync paths, data limits, security (RLS, grants, secrets, same-origin checks).
4. Changes that can hide problems, each named in the report even when it looks fine: deleted, skipped or loosened tests and coverage thresholds; `pnpm-lock.yaml` and new dependencies; scripts in `package.json`; lint and TypeScript settings; the assistant setup and CI (the list under "Needs the person's approval" in `AGENTS.md`).
5. Conventions next, line by line against `AGENTS.md`: comments, names, loops, nested ternaries, `void`, catch style, `'use client'`, folder layout, barrels and imports, where types live, store selectors, error reporting, tokens, locales, stories, test grammar, migrations.
6. Completeness: tests for new logic, a failing-first test for a fix, every locale, every theme block, stories and visual baselines, the version bump, the pull request checklist.
7. Run `pnpm validate`, and the suites that cover the changes when the environment allows. Name the ones you could not run.
8. Report findings ranked by severity, each with `file:line`, the problem and the fix. Separate "must fix" from "worth considering", and report only real problems and gaps against the issue, not speculative improvements. Say plainly when nothing was found. Change no code unless the person asks for it: the session that implements the task applies the fixes.
