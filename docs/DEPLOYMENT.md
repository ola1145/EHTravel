# EHTravel — Deployment

Two deployable units: the **static front end** and the **GraphQL router**. The front end
works standalone (it falls back to client-side mock data), and becomes live the moment it
can reach a router that has a `DUFFEL_API_TOKEN`.

```
┌────────────────────┐        GraphQL         ┌──────────────────────┐   @connect   ┌────────────┐
│  Front end (static)│ ─────────────────────► │  Apollo Router       │ ───────────► │  Duffel    │
│  Amplify Hosting   │  GRAPHQL_ENDPOINT      │  (container)         │  Bearer token │  api.duffel│
└────────────────────┘                        └──────────────────────┘              └────────────┘
```

## 1. Front end → AWS Amplify Hosting

Already configured in `amplify.yml` (static: `index.html`, `src/**`, `ui-tokens.json`).
Amplify auto-builds on push to `main`.

**Point the browser at your router:** the app reads the endpoint from
`<meta name="graphql-endpoint">` in `index.html` (or `window.GRAPHQL_ENDPOINT`). For
production, set it to your deployed router URL. Until then the app runs in graceful
**mock mode** — fully browsable, no live Duffel calls.

## 2. Router → container

```bash
cp .env.example .env            # set DUFFEL_API_TOKEN
npm run compose                 # graphql/supergraph.yaml → graphql/supergraph.graphql
docker build -f graphql/Dockerfile -t ehtravel-router .
docker run -p 4000:4000 -e DUFFEL_API_TOKEN="$DUFFEL_API_TOKEN" ehtravel-router
```

Deploy that image to any container host (Fly.io, Cloud Run, ECS/Fargate, Render, Railway).
Set two things in the host:
- `DUFFEL_API_TOKEN` (secret) on the router service.
- The front-end `graphql-endpoint` meta → the router's public URL, and add that origin to
  `cors.origins` in `graphql/router.yaml`.

## Local dev (no Docker)

```bash
bash scripts/install-mcp.sh     # installs rover + apollo-mcp-server (one time)
export DUFFEL_API_TOKEN=duffel_test_xxx
npm run router                  # rover dev — composes + serves the router on :4000
npm run dev                     # static front end on :3000
```

## CI

`npm run ci` (lint + supergraph composition + wiring checks) must pass before a PR.
Composition accepts the Elastic License v2 (`APOLLO_ELV2_LICENSE=accept`), required by
Apollo Federation.

## ⚠️ Cars

Cars are a **mock subgraph** — Duffel has no car-rental API. The GraphQL contract and UI are
provider-ready; wire a real aggregator by replacing the `cars_mock` `@source` in
`graphql/cars.graphql`. Until then, car results come from the client-side fallback.
