# AGENTS.md — EHTravel

The SAFe "Round Table" team (11 specialist agents) governs work in this repo. Full role
definitions live in `.claude/agents/*.md`; the upstream reference is
`src/safe-agentic-workflow/AGENTS.md`. This file is the project‑specific quick map.

## The team

| Agent | File | On EHTravel, owns… |
|-------|------|--------------------|
| Business Systems Analyst (BSA) | `.claude/agents/bsa.md` | Specs in `specs/` for flight/hotel/car features |
| System Architect | `.claude/agents/system-architect.md` | GraphQL supergraph shape, Connectors design, Duffel mapping |
| FE Developer | `.claude/agents/fe-developer.md` | `src/*.jsx` — additive hotels/cars UI, `src/api.jsx` |
| BE Developer | `.claude/agents/be-developer.md` | `graphql/*.graphql`, `router.yaml`, Duffel connectors |
| QA Specialist (QAS) | `.claude/agents/qas.md` | `scripts/test.mjs`, composition + smoke checks |
| Security Engineer | `.claude/agents/security-engineer.md` | Token handling, CORS, no‑secret‑in‑client review |
| Tech Writer | `.claude/agents/tech-writer.md` | `docs/`, README, ADRs |
| Data Engineer / Provisioning | `.claude/agents/data-engineer.md`, `data-provisioning-eng.md` | Duffel test data, fixtures |
| TDM / RTE | `.claude/agents/tdm.md`, `.claude/agents/rte.md` | Coordination, PR flow, releases |

## How work flows

1. **BSA** writes a spec (`specs/EHT-XXX-*.md`) — use the `spec-creation` skill.
2. **System Architect** validates the GraphQL/Connectors approach (`apollo-*` skills).
3. **FE/BE Developers** implement, pattern‑first (`pattern-discovery` skill). UI changes are
   **additive only** — never modify the existing flight flow.
4. **QAS** validates against acceptance criteria; **Security** reviews token/CORS.
5. Evidence attached, PR opened via `.github/`, "Rebase and merge" only.

## Invocation

Use the Claude Code Agent tool with the matching role, or the `agent-coordination` /
`orchestration-patterns` skills for multi‑agent work. Every agent has "stop‑the‑line"
authority for architectural or security concerns.
