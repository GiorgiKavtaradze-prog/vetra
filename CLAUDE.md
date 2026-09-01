@AGENTS.md

# CLAUDE.md - Claude Developer & Agent Reference

> Operational guide and quick reference for **Claude Code** and Anthropic AI models working on the **Vetra CRM** repository.

---

## 1. Quick Commands Cheatsheet

Always use `pnpm` as the package manager for this workspace:

| Action          | Command           | Purpose                                                |
| :-------------- | :---------------- | :----------------------------------------------------- |
| **Development** | `pnpm dev`        | Launch Next.js local development server                |
| **Type Check**  | `pnpm typecheck`  | Run `tsc --noEmit` to validate TypeScript strict types |
| **Linting**     | `pnpm lint`       | Run ESLint across Next.js app, components, and lib     |
| **Seed Data**   | `pnpm seed`       | Seed Sanity Studio with synthetic recruitment CRM data |
| **Reset Data**  | `pnpm seed:reset` | Wipe existing demo dataset and re-seed Sanity content  |
| **Build Check** | `pnpm build`      | Test production build bundle                           |

---

## 2. Core Technical Architecture

### Technology Stack

- **Framework:** Next.js 15+ (App Router with Server Actions & Server Components)
- **Auth & Tenancy:** Clerk (`@clerk/nextjs`) with multi-tenant organization scoping ([`lib/tenant.ts`](lib/tenant.ts))
- **Database & CMS:** Sanity.io (`@sanity/client`, `@sanity/context`) with GROQ queries
- **AI Copilot:** Vercel AI SDK 6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/mcp`) + Sanity Context MCP client ([`lib/mcp.ts`](lib/mcp.ts))
- **Monetization:** Clerk Billing with entitlement gating ([`lib/billing.ts`](lib/billing.ts))
- **Styling System:** Tailwind CSS v4 + Radix UI primitives + custom design tokens

### Data Flow Overview

```
Client (Browser)
  |--- React Server Components
  |--- Client Components
  |--- AI Chat UI
         |
         v
Next.js App Router (Server)
  |--- Server Actions
  |--- API Routes
  |--- Middleware
  |--- Auth Guards
         |
         v
External Services
  |--- Sanity CMS
  |--- Clerk Auth
  |--- Clerk Billing
  |--- Anthropic API
```

---

## 3. High-Priority Conventions & Rules

1. **Multi-Tenancy Isolation:** Every database read/write query **MUST** be tenant-scoped using the active Clerk `orgId`. See [`lib/tenant.ts`](lib/tenant.ts).
2. **AI Accent Rules:** **Violet (`bg-ai`, `text-ai`)** is reserved **ONLY** for AI components (Ask Vetra dock, AI receipts, AI match scores). Do not use violet for standard UI controls.
3. **Primary Action Color:** Ink (near-black in light mode, near-white in dark mode) is for primary buttons.
4. **Form Pages:** Entity creation pages live as dedicated routes (e.g. `/jobs/new`) rather than heavy dialog modals.
5. **No AI Slop:** No gradient text in dashboard UI, no solid rainbow status badges, no heavy shadows. Use soft tinted status pills and hairline borders.
6. **Server Components by Default:** Do not add `"use client"` unless the component uses hooks, browser APIs, or client-side interactivity.
7. **Parameterized Queries:** Always use parameterized GROQ queries to prevent injection vulnerabilities.

---

## 4. Key Documentation Index

- **Full Agent Guidelines:** [`AGENTS.md`](AGENTS.md)
- **Design System & UI Spec:** [`docs/design-language.md`](docs/design-language.md)
- **License & Disclaimers:** [`LICENSE.md`](LICENSE.md)
- **Project README:** [`README.md`](README.md)

---

## 5. Common Development Patterns

### Creating a New Server Action

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";
import { sanityMutation } from "@/lib/sanity/client-with-token";

export async function createEntity(formData: FormData) {
  const { orgId, userId } = await getTenantContext();
  if (!orgId) redirect("/onboarding");

  const name = formData.get("name") as string;

  const entity = await sanityMutation({
    create: {
      _type: "entity",
      name,
      organization: { _type: "reference", _ref: orgId },
      createdBy: userId,
      createdAt: new Date().toISOString(),
    },
  });

  revalidatePath("/entities");
  redirect(`/entities/${entity._id}`);
}
```

### Fetching Tenant-Scoped Data in Server Components

```typescript
import { getTenantContext } from "@/lib/tenant";
import { sanityFetch } from "@/lib/sanity/client";

export async function getOrgJobs() {
  const { orgId } = await getTenantContext();
  if (!orgId) return [];

  return sanityFetch({
    query: `*[_type == "job" && organization._ref == $orgId] | order(_createdAt desc)`,
    params: { orgId },
  });
}
```

---

## 6. Debugging Tips

| Symptom                    | Likely Cause                     | Solution                                                            |
| :------------------------- | :------------------------------- | :------------------------------------------------------------------ |
| `orgId is undefined`       | Missing Clerk session            | Ensure user is signed in and has an active organization             |
| `Insufficient permissions` | Missing Clerk permission         | Check `has()` call matches the permission string in Clerk dashboard |
| `Document not found`       | Wrong org scoping                | Verify query includes `organization._ref == $orgId`                 |
| `GROQ query returns empty` | Wrong dataset or schema mismatch | Check Sanity dataset and field names match schema                   |
| Hydration mismatch         | Client/server timezone mismatch  | Use consistent date formatting                                      |

---

## 7. Environment Setup Checklist

- [ ] `pnpm install` - Install dependencies
- [ ] `cp .env.example .env.local` - Create local environment file
- [ ] Add Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- [ ] Add Sanity config (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`)
- [ ] Add Sanity write token (`SANITY_API_WRITE_TOKEN`) for mutations
- [ ] Add Anthropic key (`ANTHROPIC_API_KEY`) for AI Copilot
- [ ] `pnpm seed` - Populate Sanity with demo data
- [ ] `pnpm dev` - Start development server at http://localhost:3000
