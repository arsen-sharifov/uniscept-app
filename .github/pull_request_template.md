## Description

<!-- 1-2 sentences: what and why -->

## Related Issue

Closes #

## Changes

-
-

## Notes for reviewer

<!-- Optional: screenshots, deploy steps, migration filename, follow-ups -->

## Checklist

<!-- Project conventions live in Notion → Uniscept Tech → Conventions. -->

- [ ] Self-review done; diff focused on a single concern
- [ ] No `console.log` / debug code left
- [ ] No `types.ts` files; shared types in `src/lib/interfaces/`
- [ ] Imports through barrels and aliases (`@interfaces`, `@constants`, `@hooks`, `@api`)
- [ ] New i18n keys added to **every** locale in `src/locales/*`
- [ ] No hardcoded hex colors; new tokens added to **every** theme block in `themes.css`
- [ ] Storybook story added/updated for new or changed visual components
- [ ] Accessibility considered (focus, keyboard, ARIA, contrast)
- [ ] `package.json` version bumped (semver)
- [ ] `pnpm validate` passes (type-check, lint, format)
- [ ] `pnpm build` passes (if shipping production code)
- [ ] `pnpm build-storybook` passes (if touched UI)
