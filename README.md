# Uniscept

A web platform for structured discussions in the form of an argument graph.
Instead of chaotic message threads, Uniscept helps users visualize reasoning, build logical connections between arguments, and move toward consensus.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styles | Tailwind CSS |
| Linting | ESLint |

> Updated as new technologies are added to the project.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Git Conventions

### Branch Naming

All branches follow the format `dev-{issue_number}`, where the number matches the GitHub issue.

```
dev-1
dev-2
dev-15
```

### Commit Messages

Format: `type(prefix-number): description`

Types:

- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance, setup
- `docs` — documentation changes
- `refactor` — code restructuring without behavior change
- `test` — adding or updating tests

Examples:

```
feat(dev-3): add discussion creation page
fix(dev-7): prevent duplicate edges between nodes
docs(dev-1): add project description and conventions to README
chore(dev-2): initialize Next.js project
```

### Issue Naming

Format: `PREFIX: Description`

- `DEV:` — development tasks

### Labels

`task`, `feature`, `bug`, `documentation`

## License

Proprietary. See [LICENSE](./LICENSE).
