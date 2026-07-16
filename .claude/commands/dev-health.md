---
description: Check local dev environment health dashboard
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

> **📋 TEMPLATE**: This command is a template. See "Customization Guide" below to adapt for your infrastructure.

> **DEPRECATED**: This command is an alias to `/remote-health`. Use `/remote-health` directly.

This command calls `/remote-health` which is the canonical command for local health checks.

## Usage

```bash
/remote-health
```

## Why Deprecated?

Per EHT-445, we canonicalized around `/remote-*` and `/local-*` naming:

- `/remote-*` = local operations (staging-first, then dev)
- `/local-*` = Local machine operations

## Related Commands

- `/remote-health` - **Canonical** - Health dashboard for local
- `/remote-status` - Check if local needs update
- `/remote-deploy` - Deploy latest image to local
- `/remote-logs` - View local container logs

## Customization Guide

To adapt this command for your infrastructure, replace these placeholders:

| Placeholder       | Description                  | Example                           |
| ----------------- | ---------------------------- | --------------------------------- |
| `EHT` | Your Linear ticket prefix    | `WOR`, `PROJ`, `TASK`             |
| `local`   | Your remote dev machine name | `Pop OS`, `staging`, `dev-server` |
