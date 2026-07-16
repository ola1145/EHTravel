---
description: View local dev container logs
argument-hint: [--follow] [--tail N]
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

> **📋 TEMPLATE**: This command is a template. See "Customization Guide" below to adapt for your infrastructure.

> **DEPRECATED**: This command is an alias to `/remote-logs`. Use `/remote-logs` directly.

This command calls `/remote-logs` which is the canonical command for viewing local container logs.

## Usage

```bash
/remote-logs
/remote-logs --follow
/remote-logs --tail 500
```

## Why Deprecated?

Per EHT-445, we canonicalized around `/remote-*` and `/local-*` naming:

- `/remote-*` = local operations (staging-first, then dev)
- `/local-*` = Local machine operations

## Related Commands

- `/remote-logs` - **Canonical** - View local container logs
- `/remote-health` - Health dashboard for local
- `/remote-status` - Check if local needs update
- `/remote-deploy` - Deploy latest image to local

## Customization Guide

To adapt this command for your infrastructure, replace these placeholders:

| Placeholder       | Description                  | Example                           |
| ----------------- | ---------------------------- | --------------------------------- |
| `EHT` | Your Linear ticket prefix    | `WOR`, `PROJ`, `TASK`             |
| `local`   | Your remote dev machine name | `Pop OS`, `staging`, `dev-server` |
