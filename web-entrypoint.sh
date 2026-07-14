#!/bin/sh
set -e
# Point the browser app at the deployed router (falls back to the baked-in localhost default).
if [ -n "$GRAPHQL_ENDPOINT" ]; then
  sed -i "s|content=\"http://localhost:4000/graphql\"|content=\"$GRAPHQL_ENDPOINT\"|" /srv/index.html
  echo "web: graphql-endpoint set to $GRAPHQL_ENDPOINT"
fi
exec caddy file-server --root /srv --listen ":${PORT:-8080}"
