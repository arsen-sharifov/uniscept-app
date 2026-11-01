---
name: verify-changes
description: Check the changes by hand in the browser before the person reviews them. Build a checklist from the issue, the plan and the diff, let a fresh verifier agent work through it on the local app, fix what it reports and run it again until everything passes. Use after review-changes for any changes people can see or use.
---

# Verify the changes

Preconditions: the `review-changes` fixes are applied, and `pnpm validate` and the relevant suites pass. Changes nobody can see or use (tests only, tooling, docs, a refactor with no visible effect) skip this skill: say so and stop.

1. Checklist: write `artifacts/verify/checklist.md` with numbered items. Each item names the page or surface, the steps from a fresh page load and the expected result, and points to its source: an issue criterion, a plan step (`artifacts/plans/dev-N.md`) or a changed file. Cover:
   - every acceptance criterion of the issue and every visible step of the plan; for a `fix`, the original reproduction steps;
   - the states the changes touch: empty, loading, error, offline, long text, and a role without the permission;
   - for visual changes a light theme, a dark theme and `graphite`; new copy in `uk` as well as `en`;
   - the keyboard: new controls are reachable and usable, and focus comes back after a dialog closes;
   - no errors in the browser console on the pages the changes touch.
2. Environment: Google Chrome installed (the verifier's browser), Docker running, `pnpm db:start`, `pnpm dev` in the background (reuse one that runs), then `pnpm verify:account` for a confirmed local account. Run it again for every other person an item needs; an existing account accepts a workspace invitation in the app. The accounts start empty, so the verifier creates workspaces, threads and nodes through the app.
3. Verifier: start the `verifier` agent, a fresh agent that did not write the changes (`.claude/agents/verifier.md` in Claude Code, `.codex/agents/verifier.toml` in Codex). Give it the text of `.agents/skills/verify-changes/verifier.md` and of the checklist, `http://localhost:3000` and the accounts, but not the diff or your explanation of the changes. It cannot open files. Wait for its full report.
4. Fix: find the cause of every failed item and fix it, with a test that fails without the fix when the cause is a logic error (`test-changes`), then run `pnpm validate` and the relevant suites. When a fix needs a decision the plan did not make, stop and ask the person. Unblock a blocked item (start what is missing, create another account) or ask the person. When an item expected the wrong thing, correct the item and say why in the report; never drop or loosen an item to make it pass.
5. Run the verifier again with the whole checklist. After the third run that still has failures, stop and hand the open items to the person.
6. Report every item with its final status, the runs and what each fix changed, the screenshots in `artifacts/verify/`, and what could not be checked. The person reviews the diff next.
