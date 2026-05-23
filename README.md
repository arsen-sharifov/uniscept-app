# Uniscept

[![CI](https://github.com/arsen-sharifov/uniscept-app/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/arsen-sharifov/uniscept-app/actions/workflows/ci.yml)

A tool that structures complex thinking and discussions into a clear logical system instead of a chaotic flow of messages. Reasoning becomes a canvas of nodes and directional connections; teams mark logical paths as valid or invalid; conclusions are reusable across canvases through structured references.

## Tech stack

| Layer     | Tooling                                                                                 |
| --------- | --------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router) · React 19 · TypeScript 5 (strict + `noUncheckedIndexedAccess`) |
| UI        | Tailwind CSS 4 (CSS variable tokens) · Lucide icons · `@dnd-kit`                        |
| Canvas    | React Flow (`@xyflow/react`) 12 · Zustand 5 + Zundo                                     |
| i18n      | `next-intl` 4 — 6 locales (`en, uk, ro, fr, es, pt`)                                    |
| Backend   | Supabase (Postgres + Auth + Realtime + Storage)                                         |
| Docs      | Storybook 10                                                                            |
| Hosting   | Vercel + Umami analytics                                                                |
| Quality   | ESLint 9 · Prettier 3 · Husky 9 · commitlint · lint-staged                              |

## Quick start

```bash
corepack enable
pnpm install
cp .env.example .env.local   # fill in Supabase keys + INVITE_CODE
pnpm db:start                # local Supabase (Docker required)
pnpm dev                     # http://localhost:3000
```

Node version is pinned in [`.nvmrc`](./.nvmrc). pnpm is pinned via the `packageManager` field in `package.json`.

## Path aliases

| Alias               | Resolves to               |
| ------------------- | ------------------------- |
| `@/*`               | `./src/*`                 |
| `@interfaces`       | `./src/lib/interfaces`    |
| `@constants`        | `./src/lib/constants`     |
| `@hooks`            | `./src/lib/hooks`         |
| `@api`              | `./src/api`               |
| `@story-interfaces` | `./.storybook/interfaces` |

Never reach into `src/lib/` via relative paths. ESLint enforces these via `no-restricted-imports`.

## Conventions

Source of truth: Notion → **Uniscept Tech → Conventions** (internal). The toolchain enforces a large subset:

- **ESLint** (`eslint.config.mjs`) — arrow functions, 4-group import order, naming prefixes (`I`/`T`/`E`), banned deep imports past barrels.
- **Prettier** (`.prettierrc`) — single quotes, semis, 2-space indent, 120-char width, Tailwind class sorting.
- **commitlint** (`commitlint.config.mjs`) — `<type>(dev-<n>): <description>` enforced. Body and footer line lengths capped at 100.
- **Husky** (`.husky/`) — `pre-commit` runs `lint-staged` + `type-check`; `commit-msg` runs commitlint; `pre-push` runs `pnpm validate` and validates branch name (`main` or `dev-<n>`).
- **CI** (`.github/workflows/ci.yml`) — `validate`, `audit`, `build`, `build-storybook` jobs on every PR to `main`. `version-check.yml` enforces semver bump on `package.json` changes.

## License

Proprietary. See [LICENSE](./LICENSE).
