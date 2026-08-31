# ◆ V E T R A ◆

### A multi-tenant CRM for recruitment agencies — with an AI copilot that queries your real data, inside a tenant boundary tight enough to sell.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-087ea4?logo=react)](https://react.dev/)
[![Sanity](https://img.shields.io/badge/Sanity-v6%20%7C%20Content%20Lake-f03e2f?logo=sanity)](https://www.sanity.io/)
[![Clerk](https://img.shields.io/badge/Clerk-v7%20%7C%20Auth%20%7C%20Orgs%20%7C%20Billing-6c47ff?logo=clerk)](https://clerk.com/)
[![AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-v6-black?logo=vercel)](https://ai-sdk.dev/)
[![Claude](https://img.shields.io/badge/Claude-Sonnet%205-d97757?logo=anthropic)](https://www.anthropic.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11-CB3837?logo=pnpm)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-0064b7.svg)](./LICENSE.md)

**Authored & engineered by [GiorgiKavtaradze](https://github.com/GiorgiKavtaradze-prog)**

> [!IMPORTANT]
> Vetra is a **fictional, educational project**. The agencies, clients,
> candidates, CVs, interview debriefs and offer figures in the demo data are
> entirely synthetic. Sanity, Clerk, Anthropic, Vercel, Next.js, React and
> Tailwind CSS are trademarks of their respective owners, referenced here solely
> to identify the technologies demonstrated.

### 🌌 Overview

Vetra is three products fused into one:

- an **agency CRM** — clients, roles, candidates, a drag-and-drop pipeline,
  interview debriefs and offers;
- a **structured content backend** your whole team can edit in Sanity Studio;
- an **AI copilot**, **Ask Vetra**, that reads and writes through the exact same
  guards as the UI.

Ask it _"Who gave strong system-design answers in interviews recently?"_ and it
writes **one GROQ query** against your live Sanity dataset: a structural filter
for "in the last 60 days", combined with **semantic ranking** over your actual
interview debrief prose. Real people. Real feedback. Scoped, at the database
level, to the Clerk organization you signed in as.

### Who is this for?

Developers who want to see an AI agent wired into real structured content —
**no RAG pipeline, no vector database, no sync job** — _and_ who need it to be
safe in a **multi-tenant B2B product**, where "the AI answered from the wrong
customer's data" is a company-ending bug rather than a bad demo.

### What makes it different?

Most Sanity Context examples are single-tenant: one dataset, one audience. Vetra
rebuilds the same pattern for SaaS:

- The Sanity Context MCP URL is constructed **per request**, with a GROQ filter
  pinned to the signed-in organization.
- The stored fallback filter **denies everything** — the boundary fails closed.
- The agent's _write_ tools are thin wrappers around the exact same **Server
  Actions** the UI buttons call — so there is exactly **one** enforcement path
  for permissions, plan limits and business rules.

### Where this pattern applies

- 🧑‍💼 **Recruitment / staffing CRM** — this build
- 🏥 **Any B2B SaaS with an AI copilot** — swap the schema, keep the tenancy model
- 🎫 **Support desk** — tickets + macros, semantically searchable
- 🏗 **Field service / property** — jobs, sites, inspection notes

---

## 🧰 Accounts & Services

Three external services — that is the entire dependency footprint. Everything
else runs locally on Node and pnpm.

| Service       | What it does in this build                                                                                                                                   | Sign up                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **Clerk**     | Authentication, **organizations** (each agency is an org), B2B seat-based billing, and the org id that becomes the tenant key on every document              | [clerk.com](https://clerk.com/)                         |
| **Sanity**    | The entire datastore — clients, roles, candidates, applications, interviews — plus the embedded Studio and the Sanity Context MCP endpoint the agent queries | [sanity.io](https://www.sanity.io/)                     |
| **Anthropic** | Claude Sonnet 5 powers the Ask Vetra copilot                                                                                                                 | [console.anthropic.com](https://console.anthropic.com/) |

> [!TIP]
> There is no separate database. **Sanity _is_ the database** — and because it
> is, the same content the Studio edits is the content the AI queries, with no
> ETL in between.

---

## ✨ Features

### The CRM

- 📥 **Today queue** — server-side triage rules bucket every application into
  _Overdue_, _Due today_ and _Waiting on someone else_, with a right rail of
  stage mix, conversion rates and clients who need a word
- 🎯 **Pipeline kanban** — dnd-kit board with **optimistic** stage moves and
  per-card revert, across every client or scoped to one role
- 📖 **Ledger** — one expandable row per client with a computed relationship
  state (_Going quiet · Needs an update · Offer chasing reply · On track_),
  open searches, and "since you last spoke" activity
- 🗂 **Roles** — card grid or a pure-CSS **Gantt timeline** of every search
- 👥 **Talent pool** — URL-driven search by name, skill and source
- 💷 **Offers where you make them** — record or edit the figure and the note
  straight from the Offer lane; recording from an earlier stage moves the
  candidate to Offer for you
- ⌨ **⌘K** command palette, **⌘I** quick-ask, **⌘B** sidebar

> The candidate record is where the two semantic fields live: **`cvText`** (the
> CV as written) and, under each round, **`feedbackText`** (the debrief a human
> typed). Those two fields are the entire "search by meaning" surface —
> everything else the agent does is exact filtering and reference joins.

### Ask Vetra — the AI copilot

- 🧠 **Schema-aware from message one** — the Sanity Context `/initial-context`
  is fetched, cached per org, and injected into the system prompt (the
  `initial_context` tool is then stripped from the toolset as redundant)
- 🔍 **One-query answers** — structural filters + `text::semanticSimilarity()`
  ranking in a single GROQ query
- 🧾 **Transparent tool receipts** — every query the agent writes is visible in
  an expandable chip, labelled in plain English ("Searching your records")
- 🔗 **Real records, not prose** — the prompt forces citations as
  `[Name](/dashboard/candidates/<_id>)`, and the markdown renderer turns those
  into inline **entity pills** with avatars that navigate in-app
- ✍️ **It can act** — 8 write tools (create client, open role, add to pipeline,
  move stage, log interview, record status, archive…) that call the _same_
  Server Actions the UI buttons call
- 🧭 **It knows where you are** — two browser-executed tools
  (`get_current_page`, `navigate_to`) let it answer "is _this_ candidate a
  fit?" and take you there
- 🪟 **Non-modal dock** — no backdrop, no focus trap, always mounted, so the
  thread survives closing and route changes; expands into a full-height sidebar

### AI sourcing — embeddings, no LLM

Press **Help source candidates** on any role and Vetra scores your entire
available pool against the role brief using `text::semanticSimilarity` — pure
Sanity embeddings, **zero LLM calls**, one query. Percentages are
contrast-stretched across the pool because raw similarity scores cluster in a
narrow band.

> The copy is deliberate: _"Match strength is relative to your pool — a place to
> start, not a ranking of people."_ The system prompt also forbids the agent
> from scoring candidates or ranking people in order to reject them.

### Multi-tenant B2B billing

- 🏢 Every agency is a **Clerk organization**; there is no personal-account mode
- 💳 Plans are read **live** from the Clerk Backend API — no hardcoded plan ids
- 🔐 Feature-first gating with `has({ feature: "ai_agent" })`
- 🚧 Free tier caps at 1 role and 25 candidates, enforced in the Server Actions
  (so the agent hits the same wall the UI does)

---

## 🧠 The AI Layer — Sanity Context, Explained

This is the heart of the build. If you learn one thing from this repo, make it
this section — and especially **Part 4**, which is what makes it safe for SaaS.

### The problem it solves

Normally, connecting an AI to your data means: export your content → chunk it →
embed it into a vector database → keep that database in sync forever → and even
then the AI can only do fuzzy text matching. Ask it _"who's been stuck in
screening for over two weeks?"_ and a vector search has no idea what "two weeks"
means — dates are math, not vibes.

**Sanity Context flips this.** Instead of copying your data out to the AI, it
gives the AI structured access **in**: one endpoint that teaches any agent your
schema and lets it write real queries against your live dataset.

### Part 1 — The MCP endpoint

MCP (Model Context Protocol) is a standard way to hand an AI a set of tools.
Sanity Context exposes one MCP endpoint per dataset:

```
https://api.sanity.io/v2026-03-03/context/mcp/<projectId>/<dataset>/<slug>
```

In this repo the connection is ~10 lines in
[`app/api/agent/route.ts`](app/api/agent/route.ts):

```ts
const mcpClient = await createMCPClient({
  transport: {
    type: "http",
    url: orgScopedMcpUrl(orgId), // ← see Part 4
    headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` },
  },
});
const allTools = await mcpClient.tools();
const { initial_context: _omit, ...mcpTools } = allTools; // already in the prompt
const tools = { ...mcpTools, ...buildActionTools(), ...buildClientTools() };
```

### Part 2 — GROQ: exact filters AND semantic search in one query

GROQ is Sanity's query language. The magic of Sanity Context is that the agent
_writes GROQ for you_ — and can mix precise filters with meaning-based ranking.
This is the query Vetra generates for the canonical question:

```groq
*[_type == "interview"
   && defined(scheduledAt)
   && dateTime(scheduledAt) > dateTime(now()) - 60*60*24*60]
  | score(text::semanticSimilarity(
      "strong system design skills, architecture, scalability, distributed systems",
      feedbackText))
  | order(_score desc)[0...10] {
    _id, roundName, interviewer, scheduledAt, outcome, feedbackText, _score,
    "candidate": application->candidate->{_id, name},
    "job": application->job->{_id, title}
  }
```

Read it like a pipeline:

1. `*[...]` — **hard filters prune first.** "Last 60 days" is date math. No
   fuzzy matching here.
2. `score(text::semanticSimilarity(...))` — the survivors are **ranked by
   meaning** against the debrief prose. "Strong system design" matches
   _"control-plane/data-plane framing, backed by concrete Zalando metrics"_ even
   though none of those words appear in the question.
3. `->` — **reference joins** hop from the interview to the candidate and the
   role, so the answer can cite real records.

One request. No separate vector DB. And note what the agent _volunteers_: it
flags a candidate whose system-design round was explicitly **weak**, "included
here only for completeness". That is what reading the actual feedback buys you
over keyword search.

### Part 3 — Embeddings (what powers "strong system-design answers")

Semantic search needs **embeddings** — numeric fingerprints of meaning. Enable
them once per dataset:

```bash
npx sanity datasets embeddings enable production --wait
```

From then on it's automatic: **publish a document and Content Lake re-embeds it
in the background.** No webhooks, no re-index jobs, no sync code.

Vetra has exactly two semantic fields, both long-form prose by design:

| Field          | Document    | Why it's prose                                                                                            |
| -------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| `cvText`       | `candidate` | The CV as written — the thing "find me a React engineer with fintech experience" actually matches against |
| `feedbackText` | `interview` | The debrief a human typed after the round — hedged, specific, opinionated                                 |

The seed data leans into this: CVs and debriefs are novelistic, with
real-sounding domain detail and honest reservations, because that is what makes
semantic search produce interesting results instead of keyword-matching noise.

Two flags make it reachable: embeddings enabled on the dataset (above), and a
deployed Studio (Part 6). Indexing is not instant — check with
`npx sanity datasets embeddings status production`.

### Part 4 — The tenant boundary (the part most examples skip)

Vetra is **multi-tenant**: one Sanity dataset, many agencies, an `orgId` string
(the Clerk org id) on every document. The AI has to be inside that boundary, not
beside it.

The `<slug>` at the end of the MCP URL points to a **Sanity Context document**
(`sanity.agentContext`) created in the Studio. It has three fields:

| Field                             | What it does                                            | Ours                                        |
| --------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| **Slug**                          | Becomes the `:slug` in the MCP URL                      | `vetra`                                     |
| **Content Filter** (`groqFilter`) | A GROQ expression scoping what the agent can _ever_ see | `orgId == "__none__"` — **deny everything** |
| **Instructions**                  | Domain guidance injected into the agent's tools         | Editable in Studio, no deploy               |

That stored filter looks broken. It isn't — it's **fail-closed**. The real
filter is built per request in [`lib/mcp.ts`](lib/mcp.ts) and passed as a query
param, which Sanity Context wraps around _every_ query the agent writes:

```ts
export function orgScopedMcpUrl(orgId: string): string {
  assertValidOrgId(orgId); // /^org_[A-Za-z0-9]+$/
  const filter =
    `_type in ["company","job","candidate","application","interview"] ` +
    `&& orgId == "${orgId}" && !(_id in path("drafts.**"))`;
  const url = `${base}/vetra?groqFilter=${encodeURIComponent(filter)}`;
  if (!url.includes("groqFilter="))
    throw new Error("MCP URL is missing the tenant filter");
  return url;
}
```

Four things here are load-bearing, and all four are deliberate:

- **The filter is a hard security boundary.** The agent cannot see
  `organization` documents at all, cannot see drafts, and cannot see another
  agency's records even if a user pastes a rival's org id into the chat.
- **`orgId` is interpolated as a quoted GROQ literal**, because query-string
  filters can't bind `$params`. That makes `assertValidOrgId`'s regex real
  security, not decoration.
- **The MCP client is created per request and never hoisted to module scope.**
  The tenant filter lives _in the URL_, so a cached module-level client would
  pin the first org's filter onto everyone else on that server instance.
- **If the override is ever dropped**, the stored `orgId == "__none__"` filter
  means the agent sees nothing — rather than everything.

The same boundary covers reads (`orgId == $orgId` bound as a parameter on every
GROQ query, with `$orgId` from `auth()`) and writes (`assertOwned(id, orgId)`
before every patch, because Sanity mutations target an `_id` and carry no
filter). See [`lib/tenant.ts`](lib/tenant.ts).

---

### Part 5 — Initial context, cached per org

Without help, an agent burns its first tool call asking "what content do you
have?". Sanity Context exposes the schema overview over plain HTTP:

```
<your MCP URL>/initial-context?<the same query string>
```

Vetra fetches it server-side, caches it for 10 minutes, and injects it into the
system prompt — then removes the now-redundant `initial_context` tool.

The cache is keyed **by org id**, and that detail matters: document counts in
the initial context are computed _under the org filter_, so one shared cache
entry would leak one agency's totals into another agency's system prompt.

### Part 6 — A deployed Studio is required

Sanity Context serves your schema from Sanity's schema store, and it only does
so for datasets with a **deployed Studio application**. `npx sanity schema
deploy` alone is not enough — you also need `npx sanity deploy`. The embedded
Studio at `/studio` keeps working locally either way.

The Studio is also where Sanity Context adds its own furniture, via
`contextPlugin()` in [`sanity.config.ts`](sanity.config.ts): an **Agent
context** document type and a **Conversations** type, both surfaced under an
**AI** band in [`sanity/structure.ts`](sanity/structure.ts).

> [!WARNING]
> The embedded Studio is an **operator console**. It is guarded by Sanity's own
> login and project membership, and it sees **every tenant**. It is never an
> end-user surface — agency users only ever touch `/dashboard`.

### Part 7 — Action tools: one enforcement path

Retrieval is half the story. Vetra's agent can also _write_ — 8 tools in
[`lib/agent-tools.ts`](lib/agent-tools.ts): `create_company`, `create_job`,
`set_job_status`, `create_candidate`, `archive_candidate`, `add_to_pipeline`,
`move_application`, `log_interview`.

Every one is a thin wrapper around the **same exported Server Action the UI
button calls**:

```ts
move_application: tool({
  description: "Move an application to a different pipeline stage.",
  inputSchema: z.object({ applicationId: z.string().min(1), stage: z.enum(STAGES) }),
  execute: async ({ applicationId, stage }) => { /* → moveApplication(...) */ },
}),
```

So the agent inherits, with no second code path to keep in sync:

- `requireOrg()` — the org id always comes from `auth()`, never from tool input
- `assertOwned()` — on **every** id the model supplies (`add_to_pipeline`
  asserts both the job and the candidate)
- **Plan caps** — the agent hits the same 1-role / 25-candidate wall the UI
  does, and gets the same copy back
- **Business rules** — duplicate-application checks,
  interview↔application↔candidate consistency, cache revalidation

The `STAGES` enum in the tool's zod schema is imported from
`sanity/schemas/stages.ts` — literally the same constant the kanban board and
the Sanity schema use.

### Part 8 — Client-side tools (the agent touches the UI)

Two tools are defined **without** an `execute` function, so the model can call
them but they run in the browser via `useChat`'s `onToolCall`:

- `get_current_page` — reads the current route so "is _this one_ a fit?" works
- `navigate_to` — pushes the router, **rejecting any path outside `/dashboard`**

### Part 9 — Conversation Insights

The `streamText` call carries one integration:

```ts
experimental_telemetry: {
  isEnabled: true,
  integrations: [sanityInsightsIntegration({
    client: writeClient, agentId: "vetra", threadId: chatId ?? `org-${orgId}`,
  })],
}
```

Every conversation is saved to Sanity and viewable in the Studio under
**AI → Conversations**, with an **Agent Insights** dashboard from the plugin.
Raw transcripts are data; reading them tells you which questions your prompt is
still failing.

---

## 🏗 Architecture

### System diagram

```mermaid
flowchart TB
    Browser["Browser — Next.js 16 UI"]
    Clerk["Clerk — auth, orgs, billing"]
    Route["/api/agent — AI SDK v6 + Claude Sonnet 5"]
    MCP["Sanity Context MCP<br/>(org-scoped groqFilter)"]
    Lake["Sanity Content Lake + embeddings"]
    Actions["Server Actions<br/>requireOrg + assertOwned"]
    Studio["Sanity Studio (/studio) — operator console"]

    Browser -->|"ClerkProvider, OrganizationSwitcher"| Clerk
    Browser -->|"useChat stream"| Route
    Browser -->|"UI buttons"| Actions
    Route -->|"auth() → userId, orgId, has()"| Clerk
    Route -->|"groq_query, schema_explorer"| MCP
    Route -->|"8 action tools"| Actions
    Route -->|"save conversations"| Lake
    MCP --> Lake
    Actions --> Lake
    Studio --> Lake
```

### One question, one query

```mermaid
flowchart LR
    Q["Who gave strong system-design<br/>answers recently?"] --> A["Agent writes ONE GROQ query"]
    A --> T["Tenant filter wraps it:<br/>orgId == your org"]
    T --> F["Structural filter:<br/>scheduledAt > now - 60d"]
    F --> S["Semantic ranking:<br/>semanticSimilarity(feedbackText)"]
    S --> J["Reference joins:<br/>application->candidate, ->job"]
    J --> C["Answer with entity pills<br/>+ the query itself in a receipt"]
```

### Why the agent can't hurt you

```mermaid
flowchart LR
    Model["The model picks a tool"] --> Read{"Read or write?"}
    Read -->|read| MCPf["MCP groqFilter<br/>orgId == auth().orgId"]
    Read -->|write| SA["The same Server Action<br/>the UI button calls"]
    SA --> RO["requireOrg()"]
    RO --> AO["assertOwned(id, orgId)"]
    AO --> Caps["Plan caps via has()"]
    Caps --> Lake["Sanity"]
    MCPf --> Lake
```

---

## 🧬 Technology Stack

| Layer                 | Technology                             | Why it's here                                                                        |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| Framework             | Next.js 16.3 (App Router)              | Server Components, Server Actions, the `proxy.ts` middleware convention              |
| UI runtime            | React 19.2 + React Compiler            | Compiler-driven memoization; no manual `useMemo` gymnastics                          |
| Styling               | Tailwind CSS v4 · shadcn/ui (Base UI)  | Utility-first system with a strict design language ([docs](docs/design-language.md)) |
| Datastore             | Sanity v6 (Content Lake)               | Structured content, GROQ, dataset embeddings, embedded Studio — the whole backend    |
| AI retrieval          | Sanity Context MCP (`@sanity/context`) | Schema-aware agent access with an org-scoped `groqFilter`                            |
| Agent runtime         | Vercel AI SDK v6 + `@ai-sdk/mcp`       | Streaming UI, tool calls, MCP client, telemetry integrations                         |
| Model                 | Claude Sonnet 5 (`@ai-sdk/anthropic`)  | The copilot's reasoning engine                                                       |
| Auth · orgs · billing | Clerk v7 (Core 3)                      | Organizations as tenants, seat-based billing, feature flags via `has()`              |
| Drag & drop           | dnd-kit                                | The pipeline kanban board                                                            |
| Validation            | Zod v4                                 | Tool input schemas and Server Action payloads                                        |
| Language              | TypeScript (strict)                    | `pnpm typecheck` is clean                                                            |
| Package manager       | pnpm 11 (pinned via `packageManager`)  | Fast, strict installs                                                                |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 24+** — the seed script runs TypeScript directly via
  `--experimental-strip-types`
- **pnpm** (`pnpm@11.22.0` is pinned via `packageManager`)
- A **[Clerk account](https://clerk.com/)** and a
  **[Sanity account](https://www.sanity.io/)**
- An **[Anthropic API key](https://console.anthropic.com/)**
- The Clerk CLI: `pnpm add -g clerk`, then `clerk auth login`

### 1. Clone and install

```bash
git clone <this-repo>
cd crm-build-sanity-context
pnpm install
cp .env.example .env.local
```

### 2. Create the Sanity project

```bash
npx sanity login
npx sanity init --bare
```

Put the printed project id into `.env.local` as `NEXT_PUBLIC_SANITY_PROJECT_ID`,
and update `projectId` **and** `studioHost` in
[`sanity.cli.ts`](sanity.cli.ts) — `studioHost` is globally unique, so pick your
own.

### 3. Create the two API tokens

```bash
# Viewer — the app's reads AND the Sanity Context MCP connection
npx sanity tokens add "Vetra Context (viewer)" --role=viewer

# Editor — Server Actions, the seed script, and Insights transcripts
npx sanity tokens add "Vetra Writer (editor)"  --role=editor
```

Copy them into `SANITY_API_READ_TOKEN` and `SANITY_API_WRITE_TOKEN`.

> [!CAUTION]
> The write token is dataset-wide and has no idea what a tenant is. The only
> thing standing between it and a cross-tenant write is `assertOwned()`. That is
> why it is called before **every** patch.

### 4. Deploy the schema and the Studio

```bash
npx sanity schema deploy   # re-run after any schema change
npx sanity deploy          # REQUIRED by Sanity Context — pick a studio hostname
npx sanity cors add http://localhost:3000 --credentials
```

### 5. Enable embeddings

```bash
npx sanity datasets embeddings enable production --wait
npx sanity datasets embeddings status production   # wait for "ready"
```

### 6. Point the agent at the MCP endpoint

In `.env.local` — note there is **no slug** here; `lib/mcp.ts` appends `/vetra`:

```bash
SANITY_CONTEXT_MCP_BASE_URL=https://api.sanity.io/v2026-03-03/context/mcp/<PROJECT_ID>/production
```

### 7. Create the Sanity Context document

Open `/studio` → **AI → Agent context** and publish one document:

- **Slug:** `vetra`
- **Content Filter:** `orgId == "__none__"` (the fail-closed fallback — the app
  overrides it per request with the signed-in org)
- **Instructions:** your domain vocabulary — see
  [`lib/agent-prompt.ts`](lib/agent-prompt.ts) for the language the app already
  uses

### 8. Set up Clerk

```bash
clerk apps create "Vetra" --json      # note the application_id
clerk link --app <application_id>
clerk env pull                        # writes both keys into .env.local
clerk enable orgs
clerk enable billing --for orgs       # or Dashboard → Billing → Settings

# Create the Free / Pro / Scale org plans + features from the checked-in config
clerk config patch --file scripts/clerk-billing.json --dry-run
clerk config patch --file scripts/clerk-billing.json
```

One Dashboard-only step: **Billing → Plans**, switch **Pro** and **Scale** to
_seat-based_ (5 and 20 seats). Seat caps aren't settable via the config API.

### 9. Add your Anthropic key

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### 10. Run it, then seed your agency

```bash
pnpm dev
```

Sign up at [http://localhost:3000](http://localhost:3000), create your agency
(an organization), then grab the **organization id** — Clerk Dashboard →
Organizations, or `clerk api /organizations`:

```bash
pnpm seed org_XXXXXXXXXXXX          # 203 docs: 8 clients, 15 roles,
                                    # 60 candidates, 80 applications, 40 interviews
pnpm seed:reset org_XXXXXXXXXXXX    # removes ONLY seeded docs
```

The seeder is **idempotent** — every document has a deterministic
`vetra.seed.<orgId>.*` id and is `createOrReplace`d, so re-running never
duplicates, and the per-org namespace means seeding a second agency never steals
the first one's records. All dates are relative to _now_, so "stuck in screening
for 2+ weeks" demos work on any day.

### 11. Upgrade to Pro to unlock the AI

Ask Vetra is gated behind the `ai_agent` feature. Go to **Dashboard → Billing**
and upgrade with Clerk's dev checkout (test card `4242 4242 4242 4242`).

### First-Time Setup Checklist

- [ ] [Clerk](https://clerk.com/) and [Sanity](https://www.sanity.io/) accounts created
- [ ] Sanity project created; id + both tokens in `.env.local`; `sanity.cli.ts` updated
- [ ] `npx sanity schema deploy` **and** `npx sanity deploy` done
- [ ] Embeddings enabled and reporting `ready`
- [ ] `SANITY_CONTEXT_MCP_BASE_URL` set (no slug on the end)
- [ ] Sanity Context document published with slug `vetra`
- [ ] Clerk keys pulled, orgs + billing enabled, plans patched, seats set
- [ ] `ANTHROPIC_API_KEY` set
- [ ] Agency created, `pnpm seed <orgId>` run, upgraded to Pro
- [ ] Ask Vetra answers with entity pills and shows its GROQ

---

## 🎬 Demo Script

The seed data is engineered so every beat lands:

1. **Open Today** — 9 things ranked by what hurts first. Five candidates have
   been sitting in screening for 16–24 days. That isn't random: the seeder
   deliberately ages 5 of the 15 screening applications past the 14-day "stale"
   line the agent's prompt also uses.
2. **Drag a card** on the Pipeline board — the move is optimistic, and
   `moveApplication` deliberately skips `revalidatePath` so cards never jump
   mid-drag. Drop someone into **Offer** and record the figure right there; the
   note you add is what the agent reads back when you ask about the offer.
3. **Ask Vetra**: _"Who's stalled in screening?"_ — **structural**. Watch the
   tool receipt: a plain GROQ date filter, no embeddings.
4. **Ask**: _"Find me a React engineer with fintech experience"_ — **semantic**,
   over `cvText`.
5. **Ask**: _"Who gave strong system-design answers in interviews recently?"_ —
   **hybrid, the money shot.** One query: a 60-day date filter, semantic ranking
   over `feedbackText`, and reference joins out to the candidate and the role.
   Expand the receipt and read the GROQ it wrote.
6. **Ask it to act**: _"Move Priya Raghavan to offer and log that her final
   round passed"_ — it resolves the real `_id` first, then calls the same Server
   Action the UI uses.
7. **Open a role → Help source candidates** — the whole pool ranked against the
   brief by `text::semanticSimilarity`, no LLM call in the loop.
8. **Prove the tenancy**: create a second organization from the org switcher
   and seed it separately. Same deployment, same dataset, same agent — and it
   cannot see the first agency's candidates.
9. **Check Insights** in Studio: **AI → Conversations** has every transcript.

---

## 🛠 Troubleshooting

Every one of these was hit for real while building this:

| Problem                                                                       | Solution                                                                                                                                                  |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MCP returns _"Only datasets with deployed Studio applications are supported"_ | Run `npx sanity deploy`. A deployed **schema** alone is not enough.                                                                                       |
| GROQ error _"Embeddings are not enabled for this dataset"_                    | `npx sanity datasets embeddings enable production --wait`. There is **no dashboard toggle** — CLI/API only.                                               |
| Semantic search returns nothing useful right after seeding                    | Embedding indexing is asynchronous. Check `npx sanity datasets embeddings status production` for `ready` before demoing.                                  |
| The agent answers with another tenant's data                                  | You hoisted the MCP client to module scope. The tenant filter lives in the URL, so the client **must** be created per request.                            |
| Embedded `/studio` shows "Add CORS origin"                                    | `npx sanity cors add http://localhost:3000 --credentials` (match your exact dev origin).                                                                  |
| Ask Vetra returns 403 `upgrade_required`                                      | By design — the `ai_agent` feature is Pro/Scale. Upgrade in Dashboard → Billing.                                                                          |
| `/api/agent` returns 401                                                      | Not signed in, or signed in without an active organization. Vetra has no personal-account mode; `requireOrg()` bounces you to `/onboarding`.              |
| Closing a role doesn't free a slot on the free plan                           | Intentional. `countJobs` counts open **and** closed roles.                                                                                                |
| Kanban cards jump back after a drag                                           | Something added a `revalidatePath` to `moveApplication`. It's omitted on purpose — the board owns its optimistic state.                                   |
| Seat caps aren't enforced                                                     | They're a Clerk Dashboard setting (Billing → Plans → seat-based), not something the config API can patch.                                                 |
| `pnpm seed` can't find env vars                                               | The seed script parses `.env.local` itself (it can't import `lib/*`, which is `server-only`). Make sure the file exists and has `SANITY_API_WRITE_TOKEN`. |

---

## 📋 Quick Reference

### Commands

| Command                                                | What it does                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `pnpm dev`                                             | Start the app + embedded Studio                                                   |
| `pnpm seed <orgId>`                                    | Seed 203 realistic docs into one agency (idempotent)                              |
| `pnpm seed:reset <orgId>`                              | Delete only that agency's seeded docs                                             |
| `pnpm typecheck`                                       | `tsc --noEmit` — clean ✅                                                         |
| `pnpm lint`                                            | Passes; 8 `react-hooks` warnings are downgraded on purpose in `eslint.config.mjs` |
| `pnpm build`                                           | Production build                                                                  |
| `npx sanity schema deploy`                             | Push the schema to Sanity's schema store                                          |
| `npx sanity deploy`                                    | Deploy the Studio (required by Sanity Context)                                    |
| `npx sanity datasets embeddings status production`     | Check semantic-search indexing                                                    |
| `clerk config patch --file scripts/clerk-billing.json` | Create the plans + features                                                       |

### Concepts Worth Remembering

- **Schema-aware beats embedding-only** — filters are exact, semantics rank the
  survivors, one query does both
- **The `groqFilter` is the AI's security boundary** — built per request from
  `auth()`, fail-closed when stored
- **Never hoist the MCP client** — the tenant filter lives in the URL
- **Agent writes go through the UI's Server Actions** — one enforcement path for
  permissions, plan caps and business rules
- **Identity comes from Clerk, never from the model** — no tool accepts an
  `orgId`
- **Embeddings maintain themselves** — publish → re-embed, automatically
- **Violet means AI** — one colour, used nowhere else, so users learn what the
  intelligent parts are ([design language](docs/design-language.md))

---

## 🧭 Roadmap — Take It Further

Ideas deliberately left on the table, each a self-contained challenge:

- 📧 **Email ingest** — parse inbound applications into `candidate` +
  `application` docs, then let the agent triage them
- 📄 **Real CV parsing** — upload a PDF, extract to `cvText`, and it's instantly
  semantically searchable with zero index work
- 🔁 **Sanity Functions** — this repo has none; add a scheduled function that
  classifies conversations for sentiment and content gaps
- 📊 **Placement analytics** — time-to-fill and conversion by client, as a
  Studio dashboard
- 🧑‍⚖️ **Bias guardrails** — an eval suite that asserts the agent refuses to
  rank people for rejection (the prompt already forbids it — now prove it)
- 🌍 **Localization** — localized fields plus a `language ==` clause folded into
  the per-request `groqFilter`
- 🔔 **Proactive nudges** — turn the Today rules into scheduled notifications

---

## 🛡 Security, License & Notices

- **Synthetic data.** Vetra is a fictional agency CRM; all clients, candidates,
  CVs, debriefs and offers are generated demo content.
- **Secrets.** Never commit `.env.local`, Sanity tokens, Clerk keys or Anthropic
  keys. [`.env.example`](.env.example) documents every variable the app reads.
- **Billing.** Runs on Clerk's development checkout — no money moves.
- **Tenancy.** The security model is documented in
  [The AI Layer — Part 4](#part-4--the-tenant-boundary-the-part-most-examples-skip)
  and implemented in [`lib/tenant.ts`](lib/tenant.ts) and
  [`lib/mcp.ts`](lib/mcp.ts). If you fork this for production, audit both.
- **License.** Released under the [MIT License](LICENSE.md) — free to use,
  modify and build upon, with no warranty expressed or implied. The repository
  remains an educational reference implementation.

---

## 👤 About the Author

### **GiorgiKavtaradze**

_Full-stack engineer — Next.js · TypeScript · AI agents · multi-tenant SaaS_

[![GitHub](https://img.shields.io/badge/GitHub-GiorgiKavtaradze--prog-181717?logo=github&logoColor=white)](https://github.com/GiorgiKavtaradze-prog)
[![Email](https://img.shields.io/badge/Contact-Email-0064b7?style=flat-square)](mailto:giorgi.kavtaradze2000@mail.ru)

Vetra was designed and engineered end-to-end by **GiorgiKavtaradze** — the
multi-tenant Sanity Context architecture, the Ask Vetra agent and its
enforcement path, the CRM surface, the Clerk billing gates and the design
system. If this repository helped you understand how to wire an AI agent into
real structured content _safely_, consider leaving a ⭐.

---

**Vetra** — built to show what happens when your AI copilot stops guessing and
starts querying, inside a tenant boundary tight enough to sell. 🎯

<sub>Authored &amp; engineered by <a href="https://github.com/GiorgiKavtaradze-prog">GiorgiKavtaradze-prog</a> · Next.js 16 · Sanity Context · Clerk v7 · Vercel AI SDK v6 · <a href="./LICENSE.md">MIT Licensed</a></sub>
