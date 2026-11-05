---
name: prepare-release
description: Check that main is ready to ship to production and summarize what the release contains. The owner starts the Release workflow. Use only when the owner asks to prepare a release.
---

# Prepare a release

Notion page: Release and Infrastructure, https://app.notion.com/p/3fd666ffe876812caf23dabb39882e4e

This skill only reads and reports. Production changes only through the Release workflow (`.github/workflows/release.yml`), which the owner starts.

1. Sync: `git fetch origin --tags` and work from `origin/main`.
2. CI: the latest `main` commit has a green CI run (the Release workflow refuses otherwise).
3. Version: the release tags `v<version>` from `package.json` on `main`. That tag does not exist yet, or it points at this commit after a stopped run (`git tag --list "v*"`).
4. Changes since the last release (`gh release list --limit 1`): list the squash commits (`git log --format=%s <release tag>..origin/main`) and group them by type.
5. Migrations since the last release: list the new files in `supabase/migrations`. Each must be newer than the last released one, leave released files untouched, and stay backward compatible with the code that is live until the deploy finishes.
6. Settings: list changes to `supabase/config.toml`, `supabase/templates/`, `vercel.json`, `next.config.ts` and new environment variables. Name every value the owner must add to the `production` environment before the release; never read or write those values.
7. Recommend a dry run (the workflow's `dry-run` input) when migrations, `config.toml` or settings changed.
8. Summarize for the owner what users get, the migrations and the follow-ups. The Release workflow writes the GitHub release notes itself.
9. Hand over: the owner starts the Release workflow, the dry run first when recommended.
