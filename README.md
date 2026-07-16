# EHTravel — AERIA

A glassmorphic travel-booking app for **flights, hotels, and cars**. The React UI is powered by
a **federated GraphQL supergraph** that orchestrates the **Duffel** API through **Apollo
Connectors** on the **Apollo Router**. Built and run under the **SAFe Agentic Workflow** harness.

```
Browser React UI  ──GraphQL──►  Apollo Router  ──@connect──►  Duffel REST API
       │                              │
       └── multipart upload ──► assistant middleware ──► multimodal model
                                      └── owned, read-only order lookup
```

## Quick start

```bash
bash scripts/install-mcp.sh        # one-time: installs rover + apollo-mcp-server
cp .env.example .env               # set DUFFEL_API_TOKEN (test token from app.duffel.com)

npm run router                     # composes + serves the supergraph on :4000  (rover dev)
npm run assistant                  # assistant/upload middleware on :4100
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
| `src/floating-chat.{jsx,css}` | Persistent text, file, recorded voice, and recorded video assistant UI. |
| `src/search-shared.jsx`, `src/screen-search-{hotels,cars}.jsx` | Additive hotel/car search panels + overlays. |
| `graphql/duffel.graphql` | Apollo Connectors SDL: flights (offer requests → offers → orders) + stays. |
| `graphql/cars.graphql` | Cars subgraph — **mock** (Duffel has no cars API; provider-ready contract). |
| `graphql/assistant.graphql`, `services/assistant/` | Authenticated assistant connector and middleware; uploads and owned order tools stay server-side. |
| `graphql/{supergraph,router,apollo-mcp}.yaml` | Composition, router, and MCP server config. |
| `graphql/operations/*.graphql` | Saved query/mutation documents (frontend + MCP tools). |
| `ui-tokens.json` | Design tokens — the source of truth for all UI. |
| `docs/duffel-api/*.md` | Extracted Duffel API docs. `docs/duffel-graphql-*` — integration notes. |
| `.claude/`, `AGENTS.md`, `CLAUDE.md`, `specs/`, `src/safe-agentic-workflow/` | SAFe harness: 11 agents, skills, commands, hooks, specs. |

## Commands

```bash
npm run compose        # rover supergraph compose → graphql/supergraph.graphql
npm run router         # run the Apollo Router locally (rover dev)
npm run assistant      # run multimodal assistant middleware locally
npm run assistant:token -- demo-user demo-tenant  # print a one-hour local JWT
npm run dev            # serve the static front end
npm run lint           # JSX parse + JSON/GraphQL sanity + secret scan
npm test               # supergraph composes + exposes expected fields + wiring
npm run ci             # lint + test  (run before every PR)
```

## GraphQL API

`searchFlights`, `flightOffer`, `searchStays`, `searchCars`, `myFlightOrders` (queries) ·
`sendTravelAssistantMessage` (mutation). The formerly public booking-write mutations were removed
because they could spend the shared provider balance without authenticating a traveller. See
`specs/EHT-002-multimodal-travel-assistant-spec.md` and `docs/DEPLOYMENT.md`.

## Notes

- The Duffel token lives only in the router env (`$env.DUFFEL_API_TOKEN`) — never in the browser.
- Cars are mock until a real car-rental provider is wired into `graphql/cars.graphql`.
- Order queries never accept a guessed order ID as authorization. A verified JWT subject must be
  mapped to the order through `ORDER_ACCESS_JSON` (development) or the production ownership store.
- Deploy: **Railway** — `web`, `router`, and `assistant` services. See `docs/DEPLOYMENT.md`.
