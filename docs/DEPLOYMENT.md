# EHTravel — Deployment (Railway)

Deployed as **two Railway services in one project** (`ehtravel`):

| Service | What | Public URL |
|---------|------|-----------|
| `router` | Apollo Router over Duffel (`graphql/Dockerfile`) | https://router-production-7bc2.up.railway.app/graphql |
| `web` | Static AERIA front end via Caddy (`web.Dockerfile`) | https://web-production-11001.up.railway.app |

```
web (Caddy, static) ──GraphQL──► router (Apollo Router) ──@connect──► Duffel REST API
 GRAPHQL_ENDPOINT env             DUFFEL_API_TOKEN env      Bearer token (server-side only)
```

## How it's wired

- **router** — builds `graphql/Dockerfile` (Apollo Router **v2.16.0**, which supports
  Connectors `connect/v0.3`; v2.0.0 does not). Listens on Railway's `$PORT`
  (`router.yaml`: `listen: 0.0.0.0:${env.PORT:-4000}`). CORS is `allow_any_origin`
  (public gateway, no cookies). Requires the `DUFFEL_API_TOKEN` variable.
- **web** — builds `web.Dockerfile` (Caddy). `web-entrypoint.sh` rewrites the
  `graphql-endpoint` meta in `index.html` from the `GRAPHQL_ENDPOINT` variable at start,
  then serves on `$PORT`.
- Each service selects its Dockerfile via the `RAILWAY_DOCKERFILE_PATH` variable.

## Reproduce / redeploy from scratch

```bash
railway init --name ehtravel

# --- router ---
railway add --service router
printf '%s' "$DUFFEL_API_TOKEN" | railway variable --set-from-stdin DUFFEL_API_TOKEN --service router
railway variable --set "RAILWAY_DOCKERFILE_PATH=graphql/Dockerfile" --service router
npm run compose                       # regenerate graphql/supergraph.graphql (committed; Dockerfile COPYs it)
railway up --service router --detach
railway domain --service router       # generate a public URL

# --- web ---  (use the router URL from the previous step)
railway add --service web
railway variable --set "RAILWAY_DOCKERFILE_PATH=web.Dockerfile" --service web
railway variable --set "GRAPHQL_ENDPOINT=https://<router-domain>/graphql" --service web
railway up --service web --detach
railway domain --service web
```

Redeploy after changes: `railway up --service <router|web> --detach`. Watch:
`railway logs --service <svc> --lines 100`. Status: `railway deployment list --service <svc> --json`.

## Updating the supergraph

Change `graphql/duffel.graphql` (or `cars.graphql`) → `npm run compose` (regenerates
`graphql/supergraph.graphql`, which the router image bakes in) → `railway up --service router --detach`.

## Local dev (no cloud)

```bash
bash scripts/install-mcp.sh           # rover + apollo-mcp-server (once)
cp .env.example .env                  # set DUFFEL_API_TOKEN
npm run router                        # rover dev on :4000
npm run dev                           # static front end on :3000
```

## Notes

- **Secrets**: `DUFFEL_API_TOKEN` lives only in the router's Railway variables; the browser
  never sees it. Set it via stdin (`--set-from-stdin`) so it never lands in shell history.
- **Cars** remain a mock subgraph (Duffel has no car API) — see `graphql/cars.graphql`.
- **Amplify** (`amplify.yml`) is retained as an optional static-only front-end alternative,
  but the supported path is Railway (both services).
