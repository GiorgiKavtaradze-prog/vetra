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

## 5. Animation & Motion Guidelines

Motion in Vetra serves a purpose: it provides feedback, guides attention, and delights without distracting. All animations must feel intentional and refined.

### A. Motion Principles

| Principle      | Description                                       | Implementation                                                            |
| :------------- | :------------------------------------------------ | :------------------------------------------------------------------------ |
| **Purposeful** | Every animation must serve a functional purpose   | Feedback, transition, or attention guidance                               |
| **Performant** | Animations must never cause jank or layout shifts | Use `transform` and `opacity` only (GPU-accelerated)                      |
| **Respectful** | Honor user preferences for reduced motion         | Always wrap in `@media (prefers-reduced-motion: reduce)`                  |
| **Subtle**     | Animations should enhance, not dominate           | Keep durations short (150-300ms for UI, up to 500ms for page transitions) |

### B. Animation Timing Scale

```
micro-interaction  150ms   →  Button hovers, focus rings, toggles
ui-transition      200ms   →  Dropdowns, tooltips, popovers
page-transition    300ms   →  Route changes, sheet drawers
attention-drawing  500ms   →  Success states, celebrations, onboarding
```

### C. Approved Animation Patterns

```css
/* Hover lift — subtle scale on interactive elements */
.hover-lift {
  transition: transform 200ms ease-out;
}
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Fade in — for content appearing */
.fade-in {
  animation: fadeIn 300ms ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide up — for drawers, sheets, modals */
.slide-up {
  animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

### D. Micro-Interaction Components

The following components in `components/ui/` provide ready-made animations:

| Component                | Effect                           | Use Case                         |
| :----------------------- | :------------------------------- | :------------------------------- |
| `Confetti`               | Canvas confetti burst            | Celebrations, success milestones |
| `CoolMode`               | Particle trail following pointer | Interactive text/buttons         |
| `Globe`                  | Interactive 3D rotating globe    | Landing page, dashboard hero     |
| `InteractiveHoverButton` | Expanding dot + sliding label    | CTAs, primary actions            |
| `Lens`                   | Magnifying glass zoom effect     | Image previews, portfolios       |
| `NumberTicker`           | Animated count-up/down           | Statistics, KPIs, counters       |
| `PixelImage`             | Staggered pixel reveal           | Hero images, featured content    |

---

## 6. Accessibility Requirements

### A. WCAG 2.1 AA Compliance

All UI components must meet WCAG 2.1 Level AA standards:

- **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators:** Visible focus rings on all interactive elements (`ring-2 ring-primary`)
- **Keyboard Navigation:** All interactive elements must be reachable and operable via keyboard
- **Screen Reader Support:** Proper ARIA labels, roles, and live regions for dynamic content

### B. Reduced Motion

Always respect the user's motion preferences:

```typescript
"use client";

import { motion } from "motion/react";

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### C. Focus Management

- **Focus Trap:** Modals and drawers must trap focus within their container
- **Focus Restoration:** When closing modals, return focus to the triggering element
- **Skip Links:** Provide skip-to-content links for keyboard users

---

## 7. Responsive Design Rules

### A. Breakpoint System

| Breakpoint | Width  | Target Devices |
| :--------- | :----- | :------------- |
| `sm`       | 640px  | Large phones   |
| `md`       | 768px  | Tablets        |
| `lg`       | 1024px | Laptops        |
| `xl`       | 1280px | Desktops       |
| `2xl`      | 1536px | Large monitors |

### B. Touch Targets

- Minimum touch target size: 44x44px on mobile
- Adequate spacing between interactive elements (minimum 8px)
- Swipe gestures for mobile tables and carousels
- Swipe gestures for mobile tables and carousels

---

## 8. Component Catalog

### A. Layout Components

| Component         | Location      | Purpose                          |
| :---------------- | :------------ | :------------------------------- |
| `app-sidebar.tsx` | `components/` | Main navigation sidebar          |
| `page-header.tsx` | `components/` | Compact page header with actions |

### B. Data Display Components

| Component              | Location                 | Purpose                        |
| :--------------------- | :----------------------- | :----------------------------- |
| `job-card.tsx`         | `components/jobs/`       | Job posting preview card       |
| `candidate-drawer.tsx` | `components/candidates/` | Candidate profile slide-over   |
| `stage-mix-bar.tsx`    | `components/`            | Pipeline stage distribution    |
| `initials-chip.tsx`    | `components/`            | Deterministic identity avatar  |
| `kanban-board.tsx`     | `components/jobs/`       | Drag-and-drop Kanban board     |
| `gantt-timeline.tsx`   | `components/jobs/`       | Project timeline visualization |

### C. AI Components

| Component                 | Location              | Purpose                          |
| :------------------------ | :-------------------- | :------------------------------- |
| `agent-sheet.tsx`         | `components/agent/`   | AI chat slide-over panel         |
| `floating-dock.tsx`       | `components/agent/`   | Ask Vetra floating action button |
| `tool-receipt.tsx`        | `components/agent/`   | AI tool execution result card    |
| `plan-upgrade-banner.tsx` | `components/billing/` | Feature upgrade prompt           |

### D. Visual Effect Components

| Component                      | Location         | Purpose                      |
| :----------------------------- | :--------------- | :--------------------------- |
| `confetti.tsx`                 | `components/ui/` | Celebration confetti effect  |
| `cool-mode.tsx`                | `components/ui/` | Pointer-following particles  |
| `globe.tsx`                    | `components/ui/` | Interactive 3D globe         |
| `interactive-hover-button.tsx` | `components/ui/` | Animated CTA button          |
| `lens.tsx`                     | `components/ui/` | Magnifying glass effect      |
| `number-ticker.tsx`            | `components/ui/` | Animated number counter      |
| `pixel-image.tsx`              | `components/ui/` | Staggered pixel image reveal |

---

## 9. Design Token Reference

### A. Color Tokens

```css
/* Primary actions */
--primary: #1a1a1a; /* Ink — near-black in light mode */
--primary-foreground: #ffffff; /* White text on primary */

/* Surfaces */
--background: #fcfcfc; /* Warm near-white page background */
--card: #ffffff; /* Pure white card surface */
--muted: #f5f5f5; /* Subtle surface step */

/* Semantic */
--border: #e5e5e5; /* Hairline borders */
--destructive: #ef4444; /* Error/danger actions */

/* AI Accent */
--ai: #8b5cf6; /* Violet — AI features only */
--ai-soft: #ede9fe; /* Soft violet background */
```

### B. Spacing Scale

```
4px   (0.25rem)  →  xs  — Tight gaps, icon padding
8px   (0.5rem)   →  sm  — Inline spacing, small gaps
16px  (1rem)     →  md  — Standard spacing, card padding
24px  (1.5rem)   →  lg  → Section spacing, card margins
32px  (2rem)     →  xl  → Large section spacing
48px  (3rem)     →  2xl → Page section separation
```

### C. Border Radius

```
2px   (0.125rem) →  subtle — Input fields, small elements
6px   (0.375rem) →  sm     — Buttons, cards, badges
8px   (0.5rem)   →  md     — Modals, drawers, large cards
12px  (0.75rem)  →  lg     — Hero cards, feature sections
16px  (1rem)     →  xl     — Very large rounded elements
9999px           →  full   — Pills, avatars, buttons
```

---

<div align="center">

**Vetra Design Language** · _Crafting pixel-perfect recruitment experiences_

</div>

## 6. v4 Research-Committed Anti-Pattern Kill-List

The following anti-patterns are explicitly prohibited across all app surfaces:

1. ❌ **No Display Font In-App:** Do NOT use Bricolage Grotesque or display typography inside dashboard pages. Keep display type exclusively for marketing landing heroes.
2. ❌ **No Non-AI Violet:** Do NOT use violet (`#8b5cf6`, `#7c3aed`) for non-AI buttons, badges, links, or borders. Violet means AI.
3. ❌ **No Gradient Text:** Never use `bg-gradient-to-r text-transparent bg-clip-text` on dashboard UI surfaces.
4. ❌ **No Solid Rainbow Badges:** Status badges must be soft pastel tints (`pastel bg` + `dark text`), never solid saturated colors.
5. ❌ **No Heavy Drop Shadows:** Do not apply heavy elevation shadows to static cards or table rows; use hairline borders (`border-border`).
6. ❌ **No Red Alarmism:** Destructive actions (archive, close job) use `outline` style with plain text. Solid red buttons are restricted to irreversible data destruction.
