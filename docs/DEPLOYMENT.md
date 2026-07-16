# EHTravel — Deployment (Railway)

Deployed as **three Railway services in one project** (`ehtravel`):

| Service | What | Public URL |
|---------|------|-----------|
| `router` | Apollo Router over Duffel (`graphql/Dockerfile`) | https://router-production-7bc2.up.railway.app/graphql |
| `web` | Static AERIA front end via Caddy (`web.Dockerfile`) | https://web-production-11001.up.railway.app |
| `assistant` | Upload, model orchestration, and owned-order middleware (`services/assistant/Dockerfile`) | Generate a private/public Railway URL |

```
web (Caddy, static) ──GraphQL──► router (Apollo Router) ──@connect──► Duffel REST API
       │                              │
       └──file upload──► assistant ◄──┘
                         │ model API + authenticated, ownership-scoped Duffel order reads
```

## How it's wired

- **router** — builds `graphql/Dockerfile` (Apollo Router **v2.16.0**, which supports
  Connectors `connect/v0.3`; v2.0.0 does not). Listens on Railway's `$PORT`
  (`router.yaml`: `listen: 0.0.0.0:${env.PORT:-4000}`). CORS allowlists the web origins and
  forwards the access token/session header. Requires `DUFFEL_API_TOKEN`, `ASSISTANT_SERVICE_URL`,
  and the same `ASSISTANT_SERVICE_KEY` configured on the assistant service.
- **web** — builds `web.Dockerfile` (Caddy). `web-entrypoint.sh` rewrites the
  `graphql-endpoint` meta in `index.html` from the `GRAPHQL_ENDPOINT` variable at start,
  rewrites `assistant-upload-endpoint` from `ASSISTANT_UPLOAD_ENDPOINT`, then serves on `$PORT`
  with CSP, camera/microphone Permissions-Policy, anti-framing, and MIME-sniffing headers.
- **assistant** — builds `services/assistant/Dockerfile`. It validates and owner-scopes uploads,
  calls the multimodal/transcription APIs, and performs read-only Duffel requests only after JWT
  identity and order ownership are established. Production requires `ASSISTANT_SERVICE_KEY` and
  `EHT_AUTH_SECRET`; set `OPENAI_API_KEY`, `DUFFEL_API_TOKEN`, and the ownership adapter as needed.
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

# --- assistant ---
railway add --service assistant
railway variable --set "RAILWAY_DOCKERFILE_PATH=services/assistant/Dockerfile" --service assistant
printf '%s' "$ASSISTANT_SERVICE_KEY" | railway variable --set-from-stdin ASSISTANT_SERVICE_KEY --service assistant
printf '%s' "$EHT_AUTH_SECRET" | railway variable --set-from-stdin EHT_AUTH_SECRET --service assistant
printf '%s' "$OPENAI_API_KEY" | railway variable --set-from-stdin OPENAI_API_KEY --service assistant
printf '%s' "$DUFFEL_API_TOKEN" | railway variable --set-from-stdin DUFFEL_API_TOKEN --service assistant
railway variable --set "ASSISTANT_ALLOWED_ORIGINS=https://<web-domain>" --service assistant
railway up --service assistant --detach
railway domain --service assistant

# Configure router after assistant has a URL.
railway variable --set "ASSISTANT_SERVICE_URL=https://<assistant-domain>" --service router
printf '%s' "$ASSISTANT_SERVICE_KEY" | railway variable --set-from-stdin ASSISTANT_SERVICE_KEY --service router

# --- web ---  (use the router and assistant URLs)
railway add --service web
railway variable --set "RAILWAY_DOCKERFILE_PATH=web.Dockerfile" --service web
railway variable --set "GRAPHQL_ENDPOINT=https://<router-domain>/graphql" --service web
railway variable --set "ASSISTANT_UPLOAD_ENDPOINT=https://<assistant-domain>/v1/uploads" --service web
railway up --service web --detach
railway domain --service web
```

Redeploy after changes: `railway up --service <router|assistant|web> --detach`. Watch:
`railway logs --service <svc> --lines 100`. Status: `railway deployment list --service <svc> --json`.

## Updating the supergraph

Change any schema under `graphql/` → `npm run compose` (regenerates
`graphql/supergraph.graphql`, which the router image bakes in) → `railway up --service router --detach`.

## Local dev (no cloud)

```bash
bash scripts/install-mcp.sh           # rover + apollo-mcp-server (once)
cp .env.example .env                  # set DUFFEL_API_TOKEN
npm run router                        # rover dev on :4000
npm run assistant                     # assistant middleware on :4100
npm run dev                           # static front end on :3000
```

## Notes

- **Secrets**: `DUFFEL_API_TOKEN` lives only in the server-side router and assistant Railway
  variables; the browser never sees it. Keep model, signing,
  and service keys server-side and set them via stdin so they never land in shell history.
- **Authentication**: local HS256 tokens support development. Connect the host's short-lived token
  through `window.EHT_GET_AUTH_TOKEN`; production should use the approved IdP/ownership datastore.
- **Uploads**: the included in-memory, consume-after-processing store is appropriate for local or
  single-instance staging. Production rollout should use the quarantined object-storage and malware
  scanning lifecycle in `specs/EHT-002-multimodal-travel-assistant-spec.md`.
- **Cars** remain a mock subgraph (Duffel has no car API) — see `graphql/cars.graphql`.
- **Amplify** (`amplify.yml`) is retained as an optional static-only front-end alternative,
  but the supported path is Railway (both services).
