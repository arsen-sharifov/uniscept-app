# Uniscept

[![CI](https://github.com/arsen-sharifov/uniscept-app/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/arsen-sharifov/uniscept-app/actions/workflows/ci.yml)

A tool that structures complex thinking and discussions into a clear logical system instead of a chaotic flow of messages. Reasoning becomes a canvas of nodes and directional connections; teams mark logical paths as valid or invalid; conclusions are reusable across canvases through structured references.

## Quick start

```bash
corepack enable
pnpm install
cp .env.example .env.local   # fill in Supabase keys + INVITE_CODE
pnpm db:start                # local Supabase (Docker required)
pnpm dev                     # http://localhost:3000
```

Node version is pinned in [`.nvmrc`](./.nvmrc). pnpm is pinned via the `packageManager` field in `package.json`.

## Conventions

Conventions, the tech stack and the CI and release process: Notion → **Uniscept Tech** (internal).

## License

Proprietary. See [LICENSE](./LICENSE).
