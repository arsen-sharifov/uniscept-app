---
name: implement-task
description: Implement an approved plan on the dev-N branch by the project conventions, with tests, and stop before committing. Use after the person has approved a plan.
---

# Implement a task

Preconditions: the person approved the plan (saved in `artifacts/plans/dev-N.md`, or in this conversation) and the current branch is `dev-N`. Without both, run `plan-task` first.

1. Work through the plan step by step and keep to its scope. Anything else you notice goes to the follow-up list.
2. Follow `AGENTS.md` in every file you touch and meet the "Must hold" column of its type table.
3. When the code needs a decision the plan did not make, stop and ask instead of choosing silently.
4. Write and run the tests with `test-changes`, then run `pnpm validate` and fix what fails.
5. Do not commit. Report what changed per area, the commands you ran with their results, what you could not run or verify, and the follow-ups. Suggest `review-changes` as the next step.
