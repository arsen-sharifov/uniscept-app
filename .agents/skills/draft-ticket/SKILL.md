---
name: draft-ticket
description: Draft a GitHub issue in the project's format for the person to review and create. Use when the person asks for a ticket, an issue, or a follow-up to be written down.
---

# Draft a ticket

1. Type: pick `feat`, `fix`, `refactor`, `test`, `chore` or `docs`, or `product` for a product issue. The type is the label and picks the form in `.github/ISSUE_TEMPLATE/`. Fill its sections as their descriptions ask.
2. Title: `DEV: <Description>`, or `PROD: <Description>` for a product issue. Use the verb the person used. When their request is vague, ask what they mean instead of inventing it.
3. Body: describe the result, what people will see or be able to do once the work is done. How it gets built belongs in the pull request.
   - Describe behaviour, not code: no file or migration names, no technical approach, no number of tests or files.
   - Write decisions as rules for everyone, not as the story behind the request.
   - Write one idea per bullet as one short sentence without a final period or semicolons. Two ideas make two bullets.
4. Show the title, the label and the body. Creating the issue is a write to GitHub, so do it only when the person asks, or leave it to them.
