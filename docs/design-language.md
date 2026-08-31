# Vetra Design Language Specification

> **The Craft ATS Standard** — An authoritative guide to the UI/UX design system, visual hierarchy, color semantics, typography, and density rules for **Vetra**.

---

## 1. Core Axiom: Color Means Something

In Vetra, color is never used for generic decoration. Every hue carries precise semantic meaning to ensure visual clarity and lower cognitive load.

| Token Group      | Palette Target                                   | Exclusive Purpose                           | Rules & Constraints                                                                                      |
| :--------------- | :----------------------------------------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------- |
| **Ink**          | `primary` / `primary-foreground`                 | Actions, key buttons, primary text emphasis | Near-black in light mode, near-white in dark mode. Standard actions never wear saturated colors.         |
| **Violet (AI)**  | `bg-ai`, `text-ai`, `bg-ai-soft`, `border-ai/30` | Reserved **EXCLUSIVELY** for AI features    | Used ONLY for the _Ask Vetra_ floating dock, tool receipts, candidate match scores, and AI upsell cards. |
| **Stage Ramp**   | `stage-applied` … `stage-rejected`               | Candidate pipeline stage status             | Never decorate arbitrary components with stage colors.                                                   |
| **Status Pills** | Soft same-hue pastel tint                        | Semantic status badges                      | Pastel same-hue background + darker same-hue text (`text-xs font-medium`). NEVER solid saturated badges. |
| **Achromatic**   | `background`, `card`, `muted`                    | Surfaces, structural containers, cards      | Page background is warm near-white (`#fcfcfc`); cards are pure white (`#ffffff`) with hairline borders.  |

---

## 2. Typography Architecture

### A. Font Families & Roles

- **Landing Display Font:** `font-display` (Bricolage Grotesque) — Reserved strictly for marketing landing headlines, major hero statements, and stat numbers. Always `tracking-tight`.
- **Application Body & UI Font:** Instrument Sans — Used across all dashboard pages, forms, tables, sidebars, and dialogs.
- **Data & Code Font:** Monospace (`font-mono`) — Reserved for system IDs, GROQ query strings, dates, aligned table counts, and AI tool receipts (`text-xs tabular-nums`).

### B. Type Scale & Hierarchy

- **App Page Titles:** 16–20px (`text-lg` to `text-xl`), `font-semibold`, `tracking-tight` in a compact single-row header.
- **Table & Card Body:** 13–14px (`text-sm`), `font-normal text-foreground`.
- **Table Column Headers:** 11–12px (`text-xs`), `font-medium text-muted-foreground uppercase tracking-wider`.
- **Metadata & Eyebrows:** 11–12px (`text-xs`), `text-muted-foreground` at 60% opacity for low-priority metadata.

---

## 3. Surface & Depth System

- **Dual-World Theme Split:**
  - **Dark Rail World (`#131120`):** Pinned left sidebar carrying the brand identity, white text, subtle active fill (`bg-white/10`).
  - **Warm Light Surface World (`#fcfcfc` / `#ffffff`):** Main application workspace optimized for high-density reading and scanning.
- **Depth Mechanics:**
  - Depth is defined by **hairline borders (`border-border`)** and **surface steps (`bg-muted/50`)**, NOT heavy drop shadows.
  - Drop shadows (`shadow-xs` / `shadow-md`) are reserved strictly for floating overlays, popovers, context menus, and modal drawers.

---

## 4. UI Primitives & Key Patterns

### A. Header & Navigation Structure

- **Single-Row Compact Header:** Back button (if nested) → `font-semibold text-lg` title + status badge → inline metadata line → right-aligned primary actions.
- **App Sidebar (`components/app-sidebar.tsx`):** Light surface step (`bg-muted/50`), 220–240px width, 13px labels, 28–32px item height, subtle active background fill. Includes Workspace Switcher at top and user profile pinned at bottom.

### B. Form Pages Over Modals (`.../new`)

- Entity creation (Jobs, Candidates, Companies) lives on dedicated `/new` routes rather than heavy modal dialogs.
- Form layout: `max-w-2xl` focused column, grouped fields, clear labels, helper text beneath complex fields, sticky footer with `Cancel` (link back) and Ink primary submit button.
- Dialog modals are reserved strictly for quick pickers and AI chat drawer overlays.

### C. Signature Design Primitives

- **`StageMixBar` (`components/stage-mix-bar.tsx`):** Stacked visual distribution bar rendering candidate pipeline proportions across pipeline stages.
- **`InitialsChip` (`components/initials-chip.tsx`):** Deterministic identity chip rendering candidate/company initials with background tints.

### D. AI Copilot Dock & Receipts

- **Ask Vetra Dock:** Floating violet pill fixed at bottom-right of every dashboard screen. This is the **ONLY** floating element permitted in the application layout. Main layout container maintains `pb-24` padding to prevent dock overlapping.
- **AI Tool Receipts:** Rendered with `bg-ai-soft`, `border-ai/30`, and monospace text (`font-mono text-xs`).

---

## 6. v4 Research-Committed Anti-Pattern Kill-List

The following anti-patterns are explicitly prohibited across all app surfaces:

1. ❌ **No Display Font In-App:** Do NOT use Bricolage Grotesque or display typography inside dashboard pages. Keep display type exclusively for marketing landing heroes.
2. ❌ **No Non-AI Violet:** Do NOT use violet (`#8b5cf6`, `#7c3aed`) for non-AI buttons, badges, links, or borders. Violet means AI.
3. ❌ **No Gradient Text:** Never use `bg-gradient-to-r text-transparent bg-clip-text` on dashboard UI surfaces.
4. ❌ **No Solid Rainbow Badges:** Status badges must be soft pastel tints (`pastel bg` + `dark text`), never solid saturated colors.
5. ❌ **No Heavy Drop Shadows:** Do not apply heavy elevation shadows to static cards or table rows; use hairline borders (`border-border`).
6. ❌ **No Red Alarmism:** Destructive actions (archive, close job) use `outline` style with plain text. Solid red buttons are restricted to irreversible data destruction.
