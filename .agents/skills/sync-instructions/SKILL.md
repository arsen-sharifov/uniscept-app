---
name: sync-instructions
description: Compare AGENTS.md, the skills and the assistant limits with the matching Notion pages, and report or fix the drift. Use when a convention changed, before merging a pull request that changes one, or when the person asks to sync with Notion.
---

# Sync the instructions with Notion

The repository (`AGENTS.md`, `.agents/`, `.claude/`, `.codex/`, `.mcp.json`) and the linked Notion pages carry the same rules with equal weight. Neither side wins by default: the code shows what is real, and the person decides every difference.

1. Read the Notion pages linked from `AGENTS.md`.
2. Compare them with `AGENTS.md`, the skills and the limits, section by section. Where Notion and the code disagree, check the code on `main` to tell which side is stale.
3. Report each difference with both versions and the side you propose to change: "this file is behind Notion", "Notion is behind the code", or "the rule is new and missing on both".
4. Repository side: after the person agrees, edit the files in the current `dev-N` branch. Keep `AGENTS.md` a digest: imperative one-line rules with a link to their page, no rationale, no counts or dates that change with the code, and a version only when the setup depends on it.
5. Notion side: draft each page change as text and apply it only after the person approves that specific change; one approval covers only the write it names. Never write known security gaps into Notion. Re-read every page you changed and confirm the change landed.
6. Finish with a list of what changed where and what is still open.
