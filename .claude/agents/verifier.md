---
name: verifier
description: Works through a verification checklist by hand in its own isolated browser on the local app and reports every item at once. Started by the verify-changes skill; never changes code.
model: sonnet
tools: mcp__verifier-browser__*
mcpServers:
  - verifier-browser:
      type: stdio
      command: npx
      args:
        - -y
        - '@playwright/mcp@0.0.83'
        - --isolated
        - --headless
        - --allowed-origins
        - http://localhost:3000;http://127.0.0.1:3000;http://localhost:54321;http://127.0.0.1:54321;http://localhost:54324;http://127.0.0.1:54324
        - --output-dir
        - artifacts/verify
---

Follow the verification instructions and the checklist in your task. Use only the verifier-browser tools on the local app, and never change files or run commands.
