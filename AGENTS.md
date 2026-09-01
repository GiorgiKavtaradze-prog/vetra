<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Autonomous Agent Instructions for Vetra

> **System Blueprint & Operational Standards** for AI coding assistants (Cursor, Antigravity, Claude Code, GitHub Copilot) working in the **Vetra CRM** codebase.

---

### 🏗️ Vetra — Multi-Tenant Recruitment CRM & AI Copilot

_Where intelligent sourcing meets pipeline precision_

[![Next.js](https://img.shields.io/badge/Next.js-15.3+-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-v3%2Fv6-f03e2f?style=flat-square&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth%20%26%20Billing-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6-000000?style=flat-square&logo=vercel&logoColor=white)](https://sdk.vercel.ai/)

---

## Table of Contents

1. [Project Overview & Tech Stack](#1-project-overview--tech-stack-architecture)
2. [Repository Directory Map](#2-repository-directory-map)
3. [Strict Non-Negotiable Agent Guardrails](#3-strict-non-negotiable-agent-guardrails)
4. [Code Conventions & Patterns](#4-code-conventions--patterns)
5. [Developer Workflows & Terminal Commands](#5-developer-workflows--terminal-commands)
6. [Testing & Quality Assurance](#6-testing--quality-assurance)
7. [Error Handling Patterns](#7-error-handling-patterns)
8. [Performance Guidelines](#8-performance-guidelines)
9. [Verification Checklist for Agents](#9-verification-checklist-for-agents)

---

## 1. Project Overview & Tech Stack Architecture

**Vetra** is a multi-tenant recruitment CRM featuring an embedded AI Sourcing & Pipeline Copilot, Sanity Context MCP integration, and Clerk Auth & Billing. It is engineered as a reference architecture for modern full-stack applications.

### Core Technology Stack

| Layer                      | Technology                                                                                | Purpose                                                           |
| :------------------------- | :---------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| **Framework**              | Next.js 15+ (App Router, Server Actions, Dynamic Routes)                                  | Application foundation with RSC, streaming, and edge capabilities |
| **Language**               | TypeScript (Strict mode enabled)                                                          | Type safety across the entire codebase                            |
| **UI & Styling**           | Tailwind CSS v4, Radix UI primitives (`@base-ui/react`, `cmdk`), `lucide-react`, `motion` | Design system implementation with accessible primitives           |
| **CMS & Content Engine**   | Sanity v3/v6 (`sanity`, `next-sanity`, `@sanity/client`, `@sanity/context`)               | Structured content management with real-time collaboration        |
| **Auth & Multi-Tenancy**   | Clerk (`@clerk/nextjs` with Organizations & RBAC)                                         | Authentication, organization management, and role-based access    |
| **Billing & Monetization** | Clerk Billing (Pricing tables, checkout drawers, `has()` entitlements)                    | Subscription management and feature gating                        |
| **AI Copilot & SDK**       | Vercel AI SDK 6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/mcp`)                                | AI-powered sourcing assistant with tool calling                   |

### Architectural Principles

- **Server-First:** Leverage React Server Components by default; mark client components explicitly
- **Edge-Ready:** Design for edge deployment where possible; minimize Node.js-specific APIs
- **Type-End-to-End:** Shared types between server and client boundaries
- **Tenant-Isolated:** Every data access scoped to organization context
- **AI-Native:** AI features are first-class citizens, not bolted-on afterthoughts

---

## 2. Repository Directory Map

```text
vetra/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Clerk authentication pages (sign-in, sign-up)
│   ├── (dashboard)/              # Multi-tenant dashboard routes
│   │   ├── jobs/                 # Job management (list, detail, create)
│   │   ├── candidates/           # Candidate pipeline & profiles
│   │   ├── companies/            # Client company directory
│   │   └── ledger/               # Financial/placement tracking
│   ├── api/                      # API endpoints
│   │   ├── sanity-webhook/       # Sanity CMS webhooks
│   │   ├── agent-chat/           # AI Copilot chat endpoint
│   │   └── clerk-webhooks/       # Clerk event webhooks
│   └── studio/                   # Embedded Sanity Studio route
├── components/                   # UI Component Library
│   ├── agent/                    # AI Copilot sheet, floating dock, receipts
│   ├── billing/                  # Pricing tables, plan limit banners
│   ├── candidates/               # Candidate lists, CV drawers, matching UI
│   ├── jobs/                     # Job cards, Kanban boards, Gantt timeline
│   ├── ui/                       # Primitive UI components (shadcn/Radix)
│   ├── initials-chip.tsx         # Deterministic identity avatar component
│   └── stage-mix-bar.tsx         # Stacked pipeline stage distribution
├── lib/                          # Core Business Logic & Infrastructure
│   ├── actions/                  # Server Actions (mutations, stage moves)
│   ├── agent-prompt.ts           # System prompt for Vetra AI Copilot
│   ├── agent-tools.ts            # AI Copilot tools (GROQ search, match, notes)
│   ├── billing.ts                # Clerk Billing entitlement helpers
│   ├── mcp.ts                    # Sanity Context MCP client setup
│   ├── tenant.ts                 # Multi-tenant organization scoping
│   ├── utils.ts                  # Shared utility functions
│   └── sanity/                   # Sanity client configs, queries, mutations
│       ├── client.ts             # Read-only Sanity client
│       ├── client-with-token.ts  # Write-enabled Sanity client
│       ├── queries.ts            # Reusable GROQ query definitions
│       └── mutations.ts          # Sanity document mutations
├── sanity/                       # Sanity CMS Studio configuration
│   └── schemas/                  # Document schemas
│       ├── job.ts                # Job posting schema
│       ├── candidate.ts          # Candidate profile schema
│       ├── company.ts            # Company schema
│       ├── application.ts        # Job application schema
│       └── ledger.ts             # Financial ledger schema
├── docs/                         # Architectural specifications
│   └── design-language.md        # Vetra UI/UX Design System & Color Rules
├── scripts/                      # Data seeding & setup utilities
│   └── seed.mts                  # Synthetic recruitment data seeder
├── .env.example                  # Environment variable template
├── .env.local                    # Local environment (git-ignored)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS design tokens
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 3. Strict Non-Negotiable Agent Guardrails

### A. Multi-Tenancy & Data Isolation (`lib/tenant.ts`)

> ⚠️ **CRITICAL:** Tenant isolation is the most important security property in this application. Violating it can expose sensitive recruitment data across organizations.

1. **Never leak tenant data:** Every Sanity query or database mutation fetching user-generated records **MUST** be scoped by the current active Clerk organization ID (`orgId`).
2. Always resolve organization context using `getTenantContext()` from [`lib/tenant.ts`](lib/tenant.ts) in Server Components and Server Actions.
3. If `orgId` is missing, deny access or redirect to organization selection (`/onboarding` / Clerk Org Switcher).

**Example — Correct tenant-scoped query:**

```typescript
// ✅ CORRECT: Always scope by orgId
import { getTenantContext } from "@/lib/tenant";

export async function getCandidates() {
  const { orgId } = await getTenantContext();
  if (!orgId) redirect("/onboarding");

  return sanityFetch({
    query: `*[_type == "candidate" && organization._ref == $orgId]`,
    params: { orgId },
  });
}
```

**Example — Incorrect (DANGEROUS):**

```typescript
// ❌ WRONG: No tenant scoping — leaks data across organizations
export async function getCandidates() {
  return sanityFetch({ query: `*[_type == "candidate"]` });
}
```

### B. Auth & Entitlements (`@clerk/nextjs`)

1. Use `auth()` or `currentUser()` from `@clerk/nextjs/server` in Server Components and API routes.
2. Gates for paid tier features (e.g. AI Deep Match, Export Ledger) **MUST** check entitlements using `has({ permission: ... })` or `has({ entitlement: ... })` via `lib/billing.ts`.

**Example — Feature gating:**

```typescript
import { has } from "@clerk/nextjs/server";

export function AIDeepMatch() {
  const canUseAI = has({ permission: "org:ai:deep_match" });

  if (!canUseAI) {
    return <PlanUpgradeBanner feature="AI Deep Match" />;
  }

  return <DeepMatchInterface />;
}
```

### C. Sanity CMS & GROQ Queries (`lib/sanity/`)

1. **No direct schema guesswork:** Inspect [`sanity/schemas/`](sanity/schemas/) before writing GROQ queries.
2. Use parameterized GROQ queries (e.g. `*[_type == "job" && references($orgId)]`) to prevent injection vulnerabilities.
3. Server-side mutations **MUST** use the write-token client (`clientWithToken`), while public reads use the read-only client.

**Example — Correct client usage:**

```typescript
import { sanityFetch } from "@/lib/sanity/client"; // Read operations
import { sanityMutation } from "@/lib/sanity/client-with-token"; // Write operations

// Reading data (public)
const jobs = await sanityFetch({ query: `*[_type == "job"]` });

// Writing data (requires auth + write token)
await sanityMutation({
  create: { _type: "job", title: "Senior Engineer" },
});
```

### D. Design System Adherence (`docs/design-language.md`)

- **Color Axiom:** _"Color Means Something."_
  - **Violet (`bg-ai`, `text-ai`, `border-ai`)** is reserved **EXCLUSIVELY for AI features** (Ask Vetra dock, tool receipts, candidate match scores). NEVER use violet for non-AI UI elements.
  - **Ink (`primary`)** is for primary buttons and essential actions.
  - **Stage Ramp** (soft tinted pills) is for pipeline status ONLY.
  - **NO** gradient text in application dashboard surfaces.
  - **NO** heavy dropshadows; use hairline borders (`border-border`) and surface steps (`bg-muted/50`).

## 4. Developer Workflows & Terminal Commands

When requested to run or test the codebase, use standard `pnpm` script invocations:

```bash
# Start local development server (Next.js App Router with Turbopack)
pnpm dev

# Perform TypeScript type checking without emitting files
pnpm typecheck

# Run ESLint validation across the repository
pnpm lint

# Seed Sanity dataset with synthetic recruitment demo data
pnpm seed

# Reset and re-seed Sanity dataset (wipes existing demo data)
pnpm seed:reset

# Production build validation
pnpm build

# Start production server (after build)
pnpm start
```

---

## 4. Code Conventions & Patterns

### A. File Naming Conventions

| Type           | Convention       | Example                                |
| :------------- | :--------------- | :------------------------------------- |
| Components     | `kebab-case.tsx` | `job-card.tsx`, `candidate-drawer.tsx` |
| Server Actions | `kebab-case.ts`  | `create-job.ts`, `move-stage.ts`       |
| Utilities      | `kebab-case.ts`  | `format-date.ts`, `slugify.ts`         |
| Types          | `kebab-case.ts`  | `job-types.ts`, `candidate-types.ts`   |
| Tests          | `*.test.ts(x)`   | `job-card.test.tsx`                    |

### B. Component Patterns

**Server Component (default):**

```typescript
import { getJobs } from "@/lib/actions/get-jobs";

export default async function JobsPage() {
  const jobs = await getJobs();
  return <JobList jobs={jobs} />;
}
```

**Client Component (explicit):**

```typescript
"use client";

import { useState } from "react";

export function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="border-border rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{job.title}</h3>
    </article>
  );
}
```

### C. Server Action Patterns

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";
import { sanityMutation } from "@/lib/sanity/client-with-token";

export async function createJob(formData: FormData) {
  const { orgId, userId } = await getTenantContext();
  if (!orgId) redirect("/onboarding");

  const title = formData.get("title") as string;

  const job = await sanityMutation({
    create: {
      _type: "job",
      title,
      organization: { _type: "reference", _ref: orgId },
      createdBy: userId,
      createdAt: new Date().toISOString(),
    },
  });

  revalidatePath("/jobs");
  redirect(`/jobs/${job._id}`);
}
```

### D. Import Ordering

```typescript
import { notFound, redirect } from "next/navigation"; // 1. Next.js
import { Suspense } from "react"; // 2. React
import { eq } from "drizzle-orm"; // 3. Third-party
import { getTenantContext } from "@/lib/tenant"; // 4. @/ aliases
import { JobCard } from "./job-card"; // 5. Relative
import type { Job } from "@/lib/sanity/types"; // 6. Types
```

---

## 5. Developer Workflows & Terminal Commands

### Development Workflow

```bash
git clone https://github.com/GiorgiKavtaradze-prog/vetra.git
cd vetra
pnpm install
cp .env.example .env.local
pnpm seed
pnpm dev
# → http://localhost:3000
```

---

## 6. Testing & Quality Assurance

```bash
pnpm typecheck       # Full type check — expect zero errors
pnpm lint            # Run ESLint
pnpm lint --fix      # Fix auto-fixable issues
```

### Pre-Commit Checklist

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero warnings
- [ ] No `console.log` statements in production code
- [ ] No hardcoded secrets or API keys
- [ ] All new files have proper imports and exports
- [ ] Server Components are not marked `"use client"` unnecessarily
- [ ] All data-fetching is tenant-scoped
- [ ] UI changes follow the design language specification
- [ ] UI changes follow the design language specification

---

## 7. Error Handling Patterns

### Server Actions

```typescript
"use server";

import { AuthError } from "@/lib/errors";

export async function updateCandidate(id: string, data: CandidateInput) {
  try {
    const { orgId } = await getTenantContext();
    if (!orgId) throw new AuthError("No organization context");

    const result = await sanityMutation({
      patch: { id, set: { ...data } },
    });

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Unauthorized" };
    }
    console.error("Failed to update candidate:", error);
    return { success: false, error: "Internal server error" };
  }
}
```

### Client Components

```typescript
"use client";

import { useState } from "react";

export function CandidateForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await updateCandidate(formData);

    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit}>
      {error && (
        <div className="text-destructive text-sm" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
```

---

## 8. Performance Guidelines

### A. Data Fetching

- **Parallel fetching:** Use `Promise.all()` for independent requests
- **Streaming:** Use `<Suspense>` boundaries for progressive loading
- **Caching:** Leverage Next.js fetch caching with appropriate `revalidate` periods

```typescript
// ✅ CORRECT: Parallel fetching
export async function JobDetailPage({ jobId }: { jobId: string }) {
  const [job, candidates, activities] = await Promise.all([
    getJob(jobId),
    getJobCandidates(jobId),
    getJobActivities(jobId),
  ]);
  return <JobDetail job={job} candidates={candidates} activities={activities} />;
}
```

### B. Image Optimization

- Use `next/image` for all images
- Prefer SVG for icons and logos
- Use `priority` prop for above-the-fold images

### C. Bundle Size

- Use dynamic imports for heavy components
- Avoid barrel imports from large libraries
- Prefer `lucide-react` icons (tree-shakeable)

```typescript
const GanttChart = dynamic(() => import("@/components/gantt-chart"), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false,
});
```

---

## 9. Verification Checklist for Agents

Before completing any task or proposing changes, verify ALL of the following:

- [ ] **Type Safety:** `pnpm typecheck` passes with zero TypeScript compilation errors
- [ ] **Code Style:** `pnpm lint` passes with zero ESLint warnings or errors
- [ ] **Tenant Isolation:** All data queries are scoped by `orgId` via `getTenantContext()`
- [ ] **Auth Checks:** Server Components and Actions verify authentication before proceeding
- [ ] **Design Compliance:** UI changes follow [`docs/design-language.md`](docs/design-language.md)
- [ ] **No Secrets:** No API keys, tokens, or credentials exposed in client-side code
- [ ] **Import Hygiene:** All imports use `@/` aliases; no unused imports remain
- [ ] **Error Handling:** Server actions wrap mutations in try/catch with proper error types
- [ ] **Revalidation:** Mutations call `revalidatePath()` or `revalidateTag()` as appropriate
- [ ] **Accessibility:** Interactive elements have proper ARIA labels and keyboard support
- [ ] **Performance:** No unnecessary client components; data fetching is parallelized where possible
- [ ] **Documentation:** New components include JSDoc comments for props and usage

---

**Built with precision by [GiorgiKavtaradze-prog](https://github.com/GiorgiKavtaradze-prog)** · _Part of the [Vetra](README.md) Ecosystem_
