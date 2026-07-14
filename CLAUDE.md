# CLAUDE.md — EHTravel

> AI assistant context for the **EHTravel** (AERIA) travel‑booking app.
> Methodology: **SAFe Agentic Workflow** (see `src/safe-agentic-workflow/` and `.claude/`).
> Philosophy: "Round Table" — equal voice, evidence‑based delivery, search‑first / reuse‑always.

---

## What this project is

EHTravel is a glassmorphic travel‑booking front end (brand name **AERIA**) that lets users
**search and book flights, hotels (stays), and cars**. The React UI is powered by a
**federated GraphQL supergraph** that orchestrates the **Duffel** REST API through
**Apollo Connectors** running on the **Apollo Router**.

```
Browser React UI  ──GraphQL──►  Apollo Router  ──@connect──►  Duffel REST API
 (index.html + src/*.jsx)        (graphql/*.graphql, router.yaml)   (api.duffel.com)
```

- **Flights** → Duffel Air (`/air/offer_requests` → `/air/offers` → `/air/orders`)
- **Hotels/Stays** → Duffel Stays (`/stays/search` → rates → quote → `/stays/bookings`)
- **Cars** → **MOCK subgraph** (Duffel has **no** car‑rental API; the schema + UI contract
  are real and provider‑ready, the resolver is a stub — see `graphql/cars.graphql`).

## Golden rules for this repo

1. **Do not rewrite the UI.** The flight flow (`src/screen-*.jsx`) is finished and must keep
   working. Hotels & cars are **additive** — new tabs/components only. Never delete or restyle
   the existing flight search panel.
2. **Design tokens are the source of truth.** Reuse the values in `ui-tokens.json` /
   `index.html :root`. No new color/spacing/type systems.
3. **Search first, reuse always.** Check `patterns_library/`, `.claude/skills/` (Apollo +
   SAFe), and existing `src/*.jsx` before writing anything new.
4. Secrets live in `.env` (git‑ignored). Never hardcode the Duffel token.

---

## Architecture

### Front end (no build step)
`index.html` loads React 18 UMD + `@babel/standalone` from a CDN, then loads `src/*.jsx`
as `<script type="text/babel">`. Each file attaches components to `window` (no ES modules,
no bundler). Data helpers live in `src/data.jsx`; shared primitives in `src/components.jsx`.
The GraphQL client is `src/api.jsx` (`window.EHT_API`), a thin `fetch` wrapper over the router.

Screens/state machine (`src/app.jsx`): `search → results → seats → passenger → confirm`.
`ScreenSearch` (`src/screen-search-glass.jsx`) hosts a **Flights / Hotels / Cars** mode
switcher; Flights renders the original panel unchanged.

### GraphQL layer (`graphql/`)
- `duffel.graphql` — Apollo Connectors SDL for flights + stays (`@source` "duffel",
  `@connect` per operation, Duffel token + `Duffel-Version: v2` headers injected from config).
- `cars.graphql` — cars schema with a MOCK connector/stub.
- `supergraph.yaml` — `rover supergraph compose` input.
- `router.yaml` — Apollo Router config (CORS for the browser, health check, Duffel token via env).
- `operations/` — the exact query/mutation documents the front end sends.

---

## Development commands

```bash
# GraphQL supergraph (compose + run the router locally on :4000)
npm run compose          # rover supergraph compose --config graphql/supergraph.yaml > graphql/supergraph.graphql
npm run router           # ./router --config graphql/router.yaml --supergraph graphql/supergraph.graphql
npm run graphql:check    # rover subgraph check / composition lint

# Front end (static — served straight from repo root)
npm run dev              # npx serve . -l 3000  (open http://localhost:3000)

# Quality / CI
npm run lint             # lint jsx + yaml + graphql
npm run test             # schema composition + smoke checks
npm run ci               # lint + test + compose  (REQUIRED before PR)
```

> First run: `cp .env.example .env` and set `DUFFEL_API_TOKEN` (test token from
> the Duffel dashboard). Live flight/stay results require this token.

---

## SAFe workflow (short form)

Work follows Epic → Feature → Story → Enabler with specs in `specs/`. Branch as
`EHT-<n>-<slug>`, commit `type(scope): description [EHT-<n>]`, run `npm run ci`, open a PR
from `.github/`. Full detail: `src/safe-agentic-workflow/CONTRIBUTING.md`,
`.claude/agents/` (11 specialist roles), and the `safe-workflow` skill.

Metacognitive tags in specs: `#PATH_DECISION`, `#PLAN_UNCERTAINTY`, `#EXPORT_CRITICAL`.

## MCP servers & skills

- `.mcp.json` configures the **Apollo MCP Server** (exposes the GraphQL operations as agent
  tools once the router is up) and **context7** (live library docs — already global).
- Apollo skills: `apollo-connectors`, `apollo-router`, `apollo-federation`, `apollo-server`,
  `apollo-client`, `graphql-schema`, `graphql-operations`, `rover` (in `.claude/skills/`).
- SAFe skills: `safe-workflow`, `spec-creation`, `pattern-discovery`, `testing-patterns`,
  `security-audit`, `agent-coordination`, and more (copied to `.claude/skills/`).

## Deploy

- **Front end** → AWS Amplify Hosting (`amplify.yml`, static: `index.html` + `src/**`).
- **Router** → a container runtime (see `graphql/Dockerfile` + `docs/DEPLOYMENT.md`);
  set `DUFFEL_API_TOKEN` and the front‑end `GRAPHQL_ENDPOINT` in the host env.
