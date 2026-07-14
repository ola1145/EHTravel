# EHTravel — AERIA

A glassmorphic travel-booking app for **flights, hotels, and cars**. The React UI is powered by
a **federated GraphQL supergraph** that orchestrates the **Duffel** API through **Apollo
Connectors** on the **Apollo Router**. Built and run under the **SAFe Agentic Workflow** harness.

```
Browser React UI  ──GraphQL──►  Apollo Router  ──@connect──►  Duffel REST API
 (index.html + src/*.jsx)        (graphql/*.graphql)            (api.duffel.com)
```

## Quick start

```bash
bash scripts/install-mcp.sh        # one-time: installs rover + apollo-mcp-server
cp .env.example .env               # set DUFFEL_API_TOKEN (test token from app.duffel.com)

npm run router                     # composes + serves the supergraph on :4000  (rover dev)
npm run dev                        # static front end on :3000
# open http://localhost:3000
```

No token or router? The UI still runs — every surface **falls back to mock data**, so it's
always demoable and goes live automatically when the router + token are present.

## What's where

| Path | Purpose |
|------|---------|
| `index.html`, `src/*.jsx` | No-build React UI (React 18 + Babel standalone via CDN). Flight flow is finished; hotels/cars added additively. |
| `src/api.jsx` | `EHT_API` — GraphQL client with graceful mock fallback + Duffel→UI mappers. |
| `src/search-shared.jsx`, `src/screen-search-{hotels,cars}.jsx` | Additive hotel/car search panels + overlays. |
| `graphql/duffel.graphql` | Apollo Connectors SDL: flights (offer requests → offers → orders) + stays. |
| `graphql/cars.graphql` | Cars subgraph — **mock** (Duffel has no cars API; provider-ready contract). |
| `graphql/{supergraph,router,apollo-mcp}.yaml` | Composition, router, and MCP server config. |
| `graphql/operations/*.graphql` | Saved query/mutation documents (frontend + MCP tools). |
| `ui-tokens.json` | Design tokens — the source of truth for all UI. |
| `docs/duffel-api/*.md` | Extracted Duffel API docs. `docs/duffel-graphql-*` — integration notes. |
| `.claude/`, `AGENTS.md`, `CLAUDE.md`, `specs/`, `src/safe-agentic-workflow/` | SAFe harness: 11 agents, skills, commands, hooks, specs. |

## Commands

```bash
npm run compose        # rover supergraph compose → graphql/supergraph.graphql
npm run router         # run the Apollo Router locally (rover dev)
npm run dev            # serve the static front end
npm run lint           # JSX parse + JSON/GraphQL sanity + secret scan
npm test               # supergraph composes + exposes expected fields + wiring
npm run ci             # lint + test  (run before every PR)
```

## GraphQL API

`searchFlights`, `flightOffer`, `searchStays`, `searchCars` (queries) ·
`createFlightOrder`, `createStayBooking` (mutations). See
`specs/EHT-001-duffel-graphql-federation-spec.md` and `docs/DEPLOYMENT.md`.

## Notes

- The Duffel token lives only in the router env (`$env.DUFFEL_API_TOKEN`) — never in the browser.
- Cars are mock until a real car-rental provider is wired into `graphql/cars.graphql`.
- Deploy: **Railway** — `web` (Caddy static, `web.Dockerfile`) + `router` (Apollo Router
  v2.16.0, `graphql/Dockerfile`). Live: web → https://web-production-11001.up.railway.app,
  router → https://router-production-7bc2.up.railway.app/graphql. See `docs/DEPLOYMENT.md`.
