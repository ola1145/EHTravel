#!/bin/sh
set -e
# Point the browser app at the deployed router (falls back to the baked-in localhost default).
if [ -n "$GRAPHQL_ENDPOINT" ]; then
  escaped_graphql_endpoint=$(printf '%s' "$GRAPHQL_ENDPOINT" | sed 's/[&|]/\\&/g')
  sed -i "s|content=\"http://localhost:4000/graphql\"|content=\"$escaped_graphql_endpoint\"|" /srv/index.html
  echo "web: graphql-endpoint set to $GRAPHQL_ENDPOINT"
fi
if [ -n "$ASSISTANT_UPLOAD_ENDPOINT" ]; then
  escaped_assistant_endpoint=$(printf '%s' "$ASSISTANT_UPLOAD_ENDPOINT" | sed 's/[&|]/\\&/g')
  sed -i "s|content=\"http://localhost:4100/v1/uploads\"|content=\"$escaped_assistant_endpoint\"|" /srv/index.html
  echo "web: assistant-upload-endpoint configured"
fi
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
