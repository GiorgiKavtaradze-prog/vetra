<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Autonomous Agent Instructions for Vetra

> **System Blueprint & Operational Standards** for AI coding assistants (Cursor, Antigravity, Claude Code, GitHub Copilot) working in the **Vetra CRM** codebase.

---

## 1. Project Overview & Tech Stack Architecture

**Vetra** is a multi-tenant recruitment CRM featuring an embedded AI Sourcing & Pipeline Copilot, Sanity Context MCP integration, and Clerk Auth & Billing.

- **Framework:** Next.js 15+ (App Router, Server Actions, Dynamic Routes)
- **Language:** TypeScript (Strict mode enabled)
- **UI & Styling:** Tailwind CSS v4, Radix UI primitives (`@base-ui/react`, `cmdk`), `lucide-react`, `motion`
- **CMS & Content Engine:** Sanity v3/v6 (`sanity`, `next-sanity`, `@sanity/client`, `@sanity/context`)
- **Auth & Multi-Tenancy:** Clerk (`@clerk/nextjs` with Organizations & RBAC)
- **Billing & Monetization:** Clerk Billing (Pricing tables, checkout drawers, `has()` entitlements)
- **AI Copilot & SDK:** Vercel AI SDK 6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/mcp`)

---

## 2. Repository Directory Map

```text
├── app/                  # Next.js App Router (Dashboard routes, API routes, Studio)
│   ├── (auth)/           # Sign-in / Sign-up Clerk pages
│   ├── (dashboard)/      # Multi-tenant dashboard (/jobs, /candidates, /companies, /ledger)
│   ├── api/              # API endpoints (Sanity webhook, Agent chat API, Clerk webhooks)
│   └── studio/           # Embedded Sanity Studio route
├── components/           # UI Components
│   ├── agent/            # AI Copilot sheet, floating dock, receipts
│   ├── billing/          # Pricing tables, plan limit banners
│   ├── candidates/       # Candidate lists, CV drawers, matching UI
│   ├── jobs/             # Job cards, Kanban boards, Gantt timeline
│   ├── ui/               # Primitive UI components (shadcn/Radix)
│   ├── initials-chip.tsx # Deterministic identity avatar component
│   └── stage-mix-bar.tsx # Stacked pipeline stage distribution component
├── lib/                  # Core Business Logic & Infrastructure
│   ├── actions/          # Server Actions (Mutations, candidate updates, stage moves)
│   ├── agent-prompt.ts   # System prompt definition for Vetra AI Copilot
│   ├── agent-tools.ts    # AI Copilot tools (GROQ search, candidate match, note add)
│   ├── billing.ts        # Clerk Billing entitlement helpers & feature checks
│   ├── mcp.ts            # Sanity Context MCP client setup & query proxying
│   ├── tenant.ts         # Multi-tenant organization scoping & isolation helpers
│   └── sanity/           # Sanity client configurations, queries, and mutations
├── sanity/               # Sanity CMS Studio configuration & Schemas
│   └── schemas/          # Document schemas (job, candidate, company, application, ledger)
├── docs/                 # Architectural specifications
│   └── design-language.md# Vetra UI/UX Design System & Color Rules
└── scripts/              # Data seeding & setup utilities (seed.mts)
```

---

## 3. Strict Non-Negotiable Agent Guardrails

### A. Multi-Tenancy & Data Isolation (`lib/tenant.ts`)

1. **Never leak tenant data:** Every Sanity query or database mutation fetching user-generated records **MUST** be scoped by the current active Clerk organization ID (`orgId`).
2. Always resolve organization context using `getTenantContext()` from [`lib/tenant.ts`](lib/tenant.ts) in Server Components and Server Actions.
3. If `orgId` is missing, deny access or redirect to organization selection (`/onboarding` / Clerk Org Switcher).

### B. Auth & Entitlements (`@clerk/nextjs`)

1. Use `auth()` or `currentUser()` from `@clerk/nextjs/server` in Server Components and API routes.
2. Gates for paid tier features (e.g. AI Deep Match, Export Ledger) **MUST** check entitlements using `has({ permission: ... })` or `has({ entitlement: ... })` via `lib/billing.ts`.

### C. Sanity CMS & GROQ Queries (`lib/sanity/`)

1. **No direct schema guesswork:** Inspect [`sanity/schemas/`](sanity/schemas/) before writing GROQ queries.
2. Use parameterized GROQ queries (e.g. `*[_type == "job" && references($orgId)]`) to prevent injection vulnerabilities.
3. Server-side mutations **MUST** use the write-token client (`clientWithToken`), while public reads use the read-only client.

### D. Design System Adherence (`docs/design-language.md`)

- **Color Axiom:** _"Color Means Something."_
  - **Violet (`bg-ai`, `text-ai`, `border-ai`)** is reserved **EXCLUSIVELY for AI features** (Ask Vetra dock, tool receipts, candidate match scores). NEVER use violet for non-AI UI elements.
  - **Ink (`primary`)** is for primary buttons and essential actions.
  - **Stage Ramp** (soft tinted pills) is for pipeline status ONLY.
  - **NO** gradient text in application dashboard surfaces.
  - **NO** heavy dropshadows; use hairline borders (`border-border`) and surface steps (`bg-muted/50`).

---

## 4. Developer Workflows & Terminal Commands

When requested to run or test the codebase, use standard `pnpm` script invocations:

```bash
# Start local development server (Next.js App Router)
pnpm dev

# Perform TypeScript type checking without emitting files
pnpm typecheck

# Run ESLint validation across the repository
pnpm lint

# Seed Sanity dataset with synthetic recruitment demo data
pnpm seed

# Reset and re-seed Sanity dataset
pnpm seed:reset

# Production build validation
pnpm build
```

---

## 5. Verification Checklist for Agents

Before completing any task or proposing changes:

- [ ] Run `pnpm typecheck` to confirm zero TypeScript compilation errors.
- [ ] Run `pnpm lint` to ensure strict code style compliance.
- [ ] Verify that all added or modified files include proper imports and relative file links.
- [ ] Confirm no secret keys or environment variables are exposed in client-side components.
- [ ] Cross-reference UI modifications against [`docs/design-language.md`](docs/design-language.md).
