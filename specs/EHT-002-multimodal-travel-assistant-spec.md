# EHT-002 — Multimodal Travel Assistant + Owned Flight Orders

**Type:** Feature (Epic: EHTravel booking platform)
**Owner:** BSA / System Architect / FE + BE Developers
**Status:** Implementation baseline complete; production identity, durable storage, and security approvals pending

## Summary

Add a floating assistant for text, documents, images, recorded voice, and recorded video. A
server-side assistant middleware joins the GraphQL supergraph and may answer questions about the
signed-in user's flight orders. The completed flight search and booking stages remain unchanged.

## High-Level Objective

Let travellers get multimodal help without leaving the current EHTravel screen, ground booking
answers in authenticated user-owned data, and keep all provider credentials and authorization
decisions off the browser.

## User Stories

- **As a traveller, I want to** open a floating chat and send a message **so that** I can get help
  without interrupting my booking flow.
- **As a traveller, I want to** attach a document or image **so that** the assistant can use it
  as context.
- **As a traveller, I want to** record voice or video **so that** I can use a convenient modality.
- **As a signed-in traveller, I want to** ask about my flight orders **so that** I can confirm
  itinerary, booking reference, schedule, airline, and status.
- **As a traveller using assistive technology, I want** keyboard, transcript, caption, and
  screen-reader support **so that** every function remains usable.

## Scope

### In Scope

- Floating launcher; desktop panel/mobile bottom sheet; minimize/close; persistent session UI.
- Text messages, file picker, drag/drop/paste, audio recording, and video recording.
- Server-side extraction/OCR/transcription, multimodal orchestration, and streaming with fallback.
- Read-only queries over authenticated, user-owned live flight orders.
- Source labels for order/attachment/general context; upload status; cancel/retry; session delete.

### Out of Scope

- Live person-to-person audio/video calls, always-on recording, or background capture.
- Booking, changing, cancelling, refunding, or paying for an order through the assistant.
- Hotel/car order access, anonymous flight-order lookup, and claiming historical orders.
- Treating arbitrary executable/archive formats as processable documents.
- Changing any existing flight screen, stage transition, search behavior, mock fallback, or
  visual layout beyond mounting the independent assistant surface.

## #PATH_DECISION

- Add an **assistant middleware/subgraph** behind Apollo Router. It owns model calls, session
  state, tool execution, attachment processing, and authorization-aware order access.
- GraphQL is the control plane. File bytes upload directly to private object storage through a
  short-lived signed URL; bytes must not be base64-encoded into GraphQL requests.
- Voice/video in EHT-002 means user-initiated recorded messages. Real-time calling is deferred.
- The agent never receives a Duffel token or unrestricted GraphQL client. It receives typed,
  least-privilege server tools whose order lookup is scoped to the verified user subject.

## #EXPORT_CRITICAL

1. **Additive flight rule:** do not edit the flight state machine or existing `src/screen-*.jsx`
   flight behavior. Mount the assistant as an isolated sibling/portal and regression-test the
   original search → results → seats → passenger → confirm journey.
2. **Ownership before provider lookup:** an order ID or booking reference alone never grants
   access. Verify the request JWT and ownership record before fetching or disclosing an order.
3. **No fabricated booking answers:** when auth, ownership, middleware, Router, or Duffel is
   unavailable, say the order could not be verified. Never substitute mock order data.
4. **No secrets in the client:** Duffel, model, storage, transcription, and signing credentials
   remain server-side environment secrets and are redacted from logs/errors.

## GraphQL / API Contract Expectations

The System Architect must validate final names and federation directives. The composed
supergraph must expose equivalent typed capabilities:

```graphql
type Query {
  assistantSession(id: ID!): AssistantSession
  myFlightOrders(first: Int = 20, after: String): FlightOrderConnection!
  myFlightOrder(id: ID!): OwnedFlightOrder
}

type Mutation {
  createAssistantSession(input: CreateAssistantSessionInput!): AssistantSession!
  prepareAssistantUpload(input: PrepareUploadInput!): PreparedUpload!
  completeAssistantUpload(input: CompleteUploadInput!): AssistantAttachment!
  sendAssistantMessage(input: SendAssistantMessageInput!): AssistantRun!
  cancelAssistantRun(id: ID!): AssistantRun!
  deleteAssistantSession(id: ID!): Boolean!
}

type Subscription {
  assistantEvents(sessionId: ID!): AssistantEvent!
}
```

- `prepareAssistantUpload` returns an opaque attachment ID, signed URL, required headers, and
  expiry no greater than 10 minutes. The object key is server-generated and user-scoped.
- `completeAssistantUpload` returns `UPLOADED`, `SCANNING`, `PROCESSING`, `READY`, `REJECTED`,
  or `FAILED`; only `READY` attachment IDs may be sent to the agent.
- `sendAssistantMessage` accepts a session ID, client-generated idempotency key, text of 0–8,000
  characters, and at most five owned attachment IDs. Empty text is valid only with attachments.
- Session, attachment, run, and order resolvers derive user identity from the verified request
  context, never from a client-supplied `userId`.
- `myFlightOrders` is cursor-paginated and returns only the caller's ownership records.
  `myFlightOrder` returns the same non-enumerable not-found result for missing and foreign IDs.
- Assistant events include run state, text deltas/final text, safe error code, and source metadata.
  If subscriptions are unavailable, equivalent query polling must preserve behavior.
- New operation documents live under `graphql/operations/`; the assistant schema composes with
  the existing Duffel and cars subgraphs without changing their public search contract.

## Authentication and Order Ownership

- Protected operations require a valid OIDC/JWT access token; public travel search may remain public.
  Router verifies issuer, audience, expiry, and signature before forwarding a stable subject claim.
- Production CORS must use explicit trusted origins and only required headers/methods; the
  assistant must not ship with `allow_any_origin: true` for credentialed/protected operations.
- When a live flight order is created, persist an idempotent mapping of `subject_id` to provider
  order ID and booking reference. Do not store full payment card, passport, or model secrets.
- Ownership storage must enforce row/user isolation (RLS or an equivalent server-side policy).
  An ownership check must complete before the middleware calls Duffel.
- Pre-existing orders without a verified ownership mapping are not queryable in EHT-002.
- Agent order tools are read-only and allowlist safe fields. Responses may show booking reference,
  route, dates/times, carrier, traveller display names, amount/currency, and status, but must omit
  passport data, full date of birth, payment credentials, provider internals, and other passengers'
  data not authorized for the caller.
- Access attempts and tool calls log actor, action, result, and correlation ID without raw prompts,
  attachment contents, tokens, or unnecessary PII.

## Upload and Media Limits

Validate extension, declared MIME, and magic bytes; sanitize filenames; scan in quarantine; reject
password-protected, corrupt, malware-positive, archive-bomb, or polyglot content. Initial allowlist:

| Modality | Accepted formats | Per-file limit | Processing limit |
|---|---|---:|---:|
| Documents | PDF, DOCX | 20 MiB | 50 pages |
| Images | PNG, JPEG, WebP | 10 MiB | 25 megapixels |
| Text data | TXT, Markdown, CSV, JSON | 5 MiB | 100,000 extracted characters |
| Voice | MP3, WAV, M4A, OGG, WebM audio | 25 MiB | 10 minutes |
| Video | MP4, WebM | 100 MiB | 5 minutes / 1080p |

- Maximum five attachments and 120 MiB aggregate per message. Limits are enforced before signing,
  at storage upload, and during processing; client checks are advisory only.
- Executables, scripts, HTML/SVG, disk images, and archives (ZIP/RAR/7z/TAR) are rejected.
- Uploaded content is untrusted data, not agent instruction. Extractors run sandboxed with time,
  memory, decompression, and network limits; prompt-injection text cannot override system/tool rules.
- Default proposal is encrypted storage with 30-day retention and user deletion; Security/legal
  must approve retention and model-provider data handling before release.

## Accessibility and UX Requirements

- Meet WCAG 2.1 AA: visible focus, 4.5:1 normal-text contrast, semantic buttons/labels, and no
  color-only status. Respect `prefers-reduced-motion`.
- Launcher is keyboard reachable, has an accessible name and expanded state, and does not cover
  existing primary controls at 320 px width or desktop breakpoints.
- Opening moves focus into the panel; Tab stays within an open modal surface; Escape minimizes;
  closing returns focus to the launcher. Background content behavior must match the chosen panel
  semantics.
- Announce upload/run status through a polite live region without announcing every streamed token.
  Messages use readable author/time/status semantics.
- Recording always requires an explicit action and visible timer/stop control. Provide transcript
  review/edit for voice and captions/transcript for video before or after send. Never autoplay audio.
- Keyboard/file-upload alternatives remain available when drag/drop, camera, or microphone cannot
  be used. Touch targets are at least 44×44 CSS pixels.

## Graceful Fallbacks

- Permission denied or unsupported `MediaRecorder`: keep text/file controls usable and explain how
  to upload a prerecorded file.
- Upload/transcription/extraction failure: retain the draft, identify the failed attachment, and
  offer retry/remove; do not send partial hidden content.
- Subscription failure: continue through bounded polling; model timeout/rate limit: preserve the
  sent message and provide retry with the same idempotency key.
- Order service failure: answer only general questions and visibly state that live booking details
  could not be verified. A source badge must never label attachment/mock content as an order.
- JavaScript or assistant load failure must not block or alter the existing flight experience.

## Pattern References

- `api/user-context-api.md`: authenticated, user-scoped session/order data access.
- `security/input-sanitization.md`, `rate-limiting.md`, `secrets-management.md`: boundary validation,
  resource-abuse controls, and server-only credentials.
- `testing/api-integration-test.md`, `testing/e2e-user-flow.md`: ownership isolation and full-flow
  regression evidence. No existing multimodal/streaming pattern exists; the System Architect must
  approve that new pattern before implementation.

## Acceptance Criteria

- [ ] The floating launcher/panel works on all existing stages and the EHT-001 flight journey is
      behaviorally and visually unchanged when the assistant is closed.
- [ ] A user can send text, see pending/streaming/final/error states, cancel a run, retry safely,
      minimize/reopen the panel, and delete their session.
- [ ] Every allowlisted format at its boundary is accepted; over-limit, spoofed, malware-positive,
      password-protected, archive, and executable fixtures are rejected with safe messages.
- [ ] Voice and video record only after permission, display an active timer/stop control, produce a
      transcript/caption path, and degrade to text/file upload when unavailable or denied.
- [ ] Unauthenticated protected operations return `UNAUTHENTICATED`; a user can access only their
      own sessions, attachments, runs, and orders.
- [ ] Cross-user session/attachment/order ID tests disclose neither resource data nor whether a
      foreign resource exists, and no provider call occurs before ownership succeeds.
- [ ] Questions about an owned test order return only allowlisted, provider-grounded fields with an
      order source; outages return an explicit unable-to-verify response and no fabricated data.
- [ ] Requests to cancel/change/pay explain that the assistant is read-only and do not execute a
      mutation or provider write.
- [ ] Signed URLs expire within 10 minutes, cannot change MIME/size/user scope, and raw bytes do not traverse GraphQL or logs.
- [ ] Keyboard-only and screen-reader tests cover launch, focus, messaging, upload, record, status,
      cancel, retry, minimize, and close; automated accessibility checks have no serious/critical
      violations at desktop and 320 px mobile widths.
- [ ] Assistant shell opens within 300 ms p95 after lazy-load; send acknowledgement and signed-upload
      preparation complete within 1 second p95, excluding model/provider processing.
- [ ] Per-user/IP rate, concurrent-run, upload-byte, and model-budget limits return retry metadata and
      do not degrade the existing public flight search.
- [ ] `npm run ci` passes, the supergraph composes, and browser E2E evidence covers happy paths,
      permission denial, unsupported file, provider outage, expired auth, and cross-user denial.

## Testing Strategy

- **Unit:** launcher/reducer states, message validation, MIME/limit matrix, source rendering,
  transcript controls, ownership filters, redaction, and model tool allowlist.
- **Integration:** Router auth propagation; assistant subgraph composition; signed-upload lifecycle;
  scan/extract/transcribe pipeline; subscription/polling; Duffel order retrieval after ownership;
  idempotency, rate limits, foreign-resource denial, and provider/model failures.
- **E2E:** original flight regression plus text, PDF/PNG, voice, video, owned-order Q&A, keyboard,
  screen-reader, mobile, permission-denied, offline/timeout, cancel/retry, and deletion flows.
- **Security/performance:** malicious files, prompt injection, XSS, GraphQL depth/cost, IDOR, CORS,
  JWT tampering, expired signed URLs, log/secret scans, concurrent uploads, and time-to-first-response.

## #PLAN_UNCERTAINTY / Dependencies

- System Architect must select the assistant runtime, model/transcription provider, private object
  store, session/ownership datastore, streaming transport, and verified identity provider.
- Security/legal must approve accepted formats, malware service, geographic data handling, model
  training opt-out, retention/deletion policy, and consent copy.
- Historical order claiming and current anonymous/demo bookings need a later approved workflow; they
  must not weaken EHT-002 ownership controls.

## Definition of Done

- [ ] Architecture and Security approve the contract, threat model, retention, and new patterns.
- [ ] All acceptance criteria and tests pass with evidence; supergraph composition is reproducible.
- [ ] Existing flight-flow regression and additive-only code review pass.
- [ ] Auth/RLS-equivalent, IDOR, upload, CORS, secret, prompt-injection, and redaction reviews pass.
- [ ] Accessibility review and supported browser/device checks pass.
- [ ] Operational dashboards/alerts cover errors, latency, upload rejection, tool calls, and cost
      without logging raw sensitive content.
- [ ] User and operator documentation covers permissions, limits, data use/deletion, fallbacks,
      deployment variables, and incident response.
- [ ] PR includes test, browser, security, performance, and accessibility evidence; EHT-002 is updated
      with session ID and validation results and merged by the repository's rebase-and-merge policy.
