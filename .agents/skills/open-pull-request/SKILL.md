---
name: open-pull-request
description: Report which workflow steps the changes went through, bump the version and check the metadata, then prepare the commit, the push and the pull request, each run only after the person approves it. Use only when the person asks to open a pull request.
---

# Open a pull request

The commit, the push and the pull request each run through the setup's approval prompt, which is where the person agrees or declines. When the assistant cannot ask, hand the command to the person instead.

1. Status: before anything else, report each workflow step from `AGENTS.md` for this branch as done, not done or unknown, with what shows it:
   - Plan: the person approved it, and where.
   - Implement: every step of the plan is done.
   - Tests (`test-changes`): the suites that cover the changes ran after the last edit, with their results.
   - Review (`review-changes`): it ran in a fresh context after the last edit, and its findings are fixed.
   - Verify (`verify-changes`): every checklist item passes, or the skill was skipped and why.
   - Checks: run `pnpm validate` now and give the result.
   - The person reviewed the diff.

   Count a step as done only when you ran or saw it in this session or the person confirms it; otherwise it is unknown. For every step that is not done or unknown, say what is missing and ask whether to run it first or go on. Do not run missing steps unasked.

2. Version: `git fetch origin`, read the version on `main` (`git show origin/main:package.json`) and set `version` in `package.json` above it by the type table in `AGENTS.md`.
3. Metadata: check and report each item. The branch is `dev-N`; issue #N exists and is open; the base is `main`; every commit subject on the branch (`git log --no-merges --format=%s origin/main..HEAD`) has the scope `dev-N`; the version is above `main`. Never take the number from the branch name alone, compare it with the issue.
4. Commit: draft `<type>(dev-N): <Description>` (imperative, starts with a capital letter, no trailing period) and a body only when it adds context. Show the files and the message, stage those files by name and commit.
5. Push: `git push -u origin dev-N`.
6. Pull request: the title equals the commit subject. The body follows `.github/pull_request_template.md`: Description (one or two sentences), `Closes #N`, Type of Change, Changes (implementation details belong here, not in the issue), Screenshots for UI changes, Notes for reviewer (migrations, settings, follow-ups), and the Checklist ticked honestly. Check the draft as the Conventions job does: the title scope is `dev-N`, and the body closes #N and no other issue. Show the draft. Write the body to a temporary file outside the repository and pass it with `gh pr create --body-file` (a shell runs backticks inside a quoted `--body`), or use the GitHub integration, then report the link. The person attaches screenshots from `artifacts/verify/` on GitHub.
7. The merge stays with the person, after every CI job and the SonarQube Cloud gate are green.
