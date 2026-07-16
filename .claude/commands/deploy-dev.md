---
description: Deploy latest Docker image to local dev environment
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

> **📋 TEMPLATE**: This command is a template. See "Customization Guide" below to adapt for your infrastructure.

> **DEPRECATED**: This command is an alias to `/remote-deploy`. Use `/remote-deploy` directly.

This command calls `/remote-deploy` which is the canonical command for deploying to local.

## Usage

```bash
/remote-deploy
```

## Why Deprecated?

Per EHT-445, we canonicalized around `/remote-*` and `/local-*` naming:

- `/remote-*` = local operations (staging-first, then dev)
- `/local-*` = Local machine operations

## Related Commands

- `/remote-deploy` - **Canonical** - Deploy latest image to local
- `/remote-status` - Check if local needs update
- `/remote-health` - Health dashboard for local
- `/remote-logs` - View local container logs
- `/remote-rollback` - Rollback local to previous image

## Customization Guide

To adapt this command for your infrastructure, replace these placeholders:

| Placeholder       | Description                  | Example                           |
| ----------------- | ---------------------------- | --------------------------------- |
| `EHT` | Your Linear ticket prefix    | `WOR`, `PROJ`, `TASK`             |
| `local`   | Your remote dev machine name | `Pop OS`, `staging`, `dev-server` |
