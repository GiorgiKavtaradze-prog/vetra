@AGENTS.md

# CLAUDE.md — Claude Developer & Agent Reference

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

- **Framework:** Next.js 15+ (App Router with Server Actions & Server Components)
- **Auth & Tenancy:** Clerk (`@clerk/nextjs`) with multi-tenant organization scoping ([`lib/tenant.ts`](lib/tenant.ts))
- **Database & CMS:** Sanity.io (`@sanity/client`, `@sanity/context`) with GROQ queries
- **AI Copilot:** Vercel AI SDK 6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/mcp`) + Sanity Context MCP client ([`lib/mcp.ts`](lib/mcp.ts))
- **Monetization:** Clerk Billing with entitlement gating ([`lib/billing.ts`](lib/billing.ts))
- **Styling System:** Tailwind CSS v4 + Radix UI primitives + custom design tokens

---

## 3. High-Priority Conventions & Rules

1. **Multi-Tenancy Isolation:** Every database read/write query **MUST** be tenant-scoped using the active Clerk `orgId`. See [`lib/tenant.ts`](lib/tenant.ts).
2. **AI Accent Rules:** **Violet (`bg-ai`, `text-ai`)** is reserved **ONLY** for AI components (Ask Vetra dock, AI receipts, AI match scores). Do not use violet for standard UI controls.
3. **Primary Action Color:** Ink (near-black in light mode, near-white in dark mode) is for primary buttons.
4. **Form Pages:** Entity creation pages live as dedicated routes (e.g. `/jobs/new`) rather than heavy dialog modals.
5. **No AI Slop:** No gradient text in dashboard UI, no solid rainbow status badges, no heavy shadows. Use soft tinted status pills and hairline borders.

---

## 4. Key Documentation Index

- 📜 **Full Agent Guidelines:** [`AGENTS.md`](AGENTS.md)
- 🎨 **Design System & UI Spec:** [`docs/design-language.md`](docs/design-language.md)
- ⚖️ **License & Disclaimers:** [`LICENSE.md`](LICENSE.md)
- 📖 **Project README:** [`README.md`](README.md)
