---
description: Check if local Docker environment needs updating
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

> **📋 TEMPLATE**: This command is a template. See "Customization Guide" below to adapt for your infrastructure.

> **DEPRECATED**: This command is an alias to `/remote-status`. Use `/remote-status` directly.

This command calls `/remote-status` which is the canonical command for checking local Docker status.

## Usage

```bash
/remote-status
```

## Why Deprecated?

Per EHT-445, we canonicalized around `/remote-*` and `/local-*` naming:

- `/remote-*` = local operations (staging-first, then dev)
- `/local-*` = Local machine operations

## Related Commands

- `/remote-status` - **Canonical** - Check if local needs update
- `/remote-deploy` - Deploy latest image to local
- `/remote-health` - Health dashboard for local
- `/remote-logs` - View local container logs

## Customization Guide

To adapt this command for your infrastructure, replace these placeholders:

| Placeholder       | Description                  | Example                           |
| ----------------- | ---------------------------- | --------------------------------- |
| `EHT` | Your Linear ticket prefix    | `WOR`, `PROJ`, `TASK`             |
| `local`   | Your remote dev machine name | `Pop OS`, `staging`, `dev-server` |
