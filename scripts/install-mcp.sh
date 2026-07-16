#!/usr/bin/env bash
# Install the Apollo MCP Server + Rover (composition) for EHTravel.
set -euo pipefail

echo "→ Installing Apollo MCP Server…"
if command -v apollo-mcp-server >/dev/null 2>&1; then
  echo "  already installed: $(command -v apollo-mcp-server)"
else
  curl -sSL https://mcp.apollo.dev/download/nix/latest | sh
fi

echo "→ Installing Rover (supergraph composition)…"
if command -v rover >/dev/null 2>&1; then
  echo "  already installed: $(command -v rover)"
else
  curl -sSL https://rover.apollo.dev/nix/latest | sh
fi

echo "✓ Done. Restart your shell (or source your profile) so the binaries are on PATH."
echo "  Then: npm run compose && npm run router"
