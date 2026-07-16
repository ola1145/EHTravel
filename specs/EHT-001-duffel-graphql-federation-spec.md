# EHT-001 — Duffel GraphQL Federation + Multi-Product Search

**Type:** Feature (Epic: EHTravel booking platform)
**Owner:** System Architect / BE + FE Developers
**Status:** Implemented

## Summary

Wrap the **Duffel** REST API in a federated GraphQL supergraph (Apollo Connectors + Apollo
Router) and extend the existing AERIA flight UI with **hotels** and **cars** search & booking —
without modifying the finished flight experience.

## Context / #PATH_DECISION

- **GraphQL over REST via Apollo Connectors**, not a hand-written resolver server. The whole
  Duffel integration is declarative SDL (`graphql/duffel.graphql`) executed by the Router — no
  backend service code to maintain. Federation (`@source`/`@connect`, fed v2.12 + connect v0.3)
  keeps flights, stays, and cars as composable subgraphs ("federally").
- **Additive UI only.** The flight flow (`src/screen-*.jsx`, `app.jsx` state machine) is
  untouched except one logic hook so flights resolve through GraphQL with a mock fallback.
  Hotels/cars are a new mode switcher + self-contained panels that portal their own
  results/booking overlays — the flight stages never change.
- **Design tokens are law.** All new UI reads `ui-tokens.json` / `index.html :root`
  (sun=flights, sky=hotels, grass=cars). No new design system.

## #PLAN_UNCERTAINTY / Constraints

- **Cars have no Duffel product.** Implemented as a mock subgraph with a real, provider-ready
  schema; the browser uses a client-side fallback until an aggregator is wired. `#EXPORT_CRITICAL`
  to communicate "demo" state in the UI (done via "demo" price labels + a schema note).
- **Live results need `DUFFEL_API_TOKEN`** (test token) in the router env. Without it (or the
  router), every surface degrades gracefully to deterministic mock data.
- Existing flight UI uses decorative (non-ISO) dates; live flight search derives near-future
  ISO dates. A future story should add real date pickers to the flight panel.

## Scope

| Area | Files |
|------|-------|
| Supergraph | `graphql/duffel.graphql`, `graphql/cars.graphql`, `graphql/supergraph.yaml`, `graphql/router.yaml`, `graphql/operations/*` |
| Front end | `src/api.jsx`, `src/search-shared.jsx`, `src/screen-search-hotels.jsx`, `src/screen-search-cars.jsx`; edits to `src/screen-search-glass.jsx`, `src/app.jsx`, `index.html` |
| Tooling | `package.json`, `scripts/lint.mjs`, `scripts/test.mjs`, `scripts/install-mcp.sh`, `.mcp.json`, `graphql/apollo-mcp.yaml` |
| Deploy/Docs | `graphql/Dockerfile`, `docs/DEPLOYMENT.md`, `docs/duffel-graphql-*`, `amplify.yml` |

## GraphQL contract

- `Query.searchFlights(input) → [FlightOffer]` — Duffel `POST /air/offer_requests?return_offers=true`
- `Query.flightOffer(id) → FlightOffer` — `GET /air/offers/{id}`
- `Query.searchStays(input) → [StayResult]` — `POST /stays/search`
- `Query.searchCars(input) → [CarResult]` — mock subgraph
- `Mutation.createFlightOrder(input) → FlightOrder` — `POST /air/orders`
- `Mutation.createStayBooking(input) → StayBooking` — `POST /stays/bookings`

## Acceptance criteria

- [x] `npm run ci` passes: JSX parses, supergraph composes, all 6 root fields exposed, wiring OK.
- [x] App loads with **no console errors**; existing flight search → results → seats →
      passenger → confirm flow unchanged.
- [x] Search bar exposes **Flights / Hotels / Cars**; Flights renders the original panel verbatim.
- [x] Hotels: search → results overlay (photos, rating, price) → Reserve → guest form → booking.
- [x] Cars: search → results overlay → Reserve → booking (mock inventory, labelled).
- [x] No Duffel token committed; token injected via `$env.DUFFEL_API_TOKEN` at the router.
- [x] Verified in a real browser (render + interaction) via automated drive.

## Demo script

1. `bash scripts/install-mcp.sh` → `cp .env.example .env` (add token) → `npm run router` → `npm run dev`.
2. Open `http://localhost:3000`. Toggle Hotels → search Tokyo → Reserve. Toggle Cars → search → Reserve.
3. Flights: run a search; with the router live + token, results are real Duffel offers; otherwise mock.
