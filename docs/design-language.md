# Vetra design language

One rule above all: **color means something.**

- **Ink** (`primary`) — actions and emphasis. Buttons are near-black in light mode, near-white in dark. Never colored buttons for ordinary actions.
- **The stage ramp** (`stage-applied … stage-rejected`) — pipeline status ONLY. Never decorate with stage colors.
- **Violet** (`ai`, `ai-foreground`, `ai-soft`) — reserved EXCLUSIVELY for AI: the Ask Vetra button, tool receipts, sourcing matches, AI upsell cards. If a feature isn't AI, it never wears violet. This is how users learn "violet = the intelligent part".
- Semantic status (destructive, `stage-hired` green for success text) stays separate from all of the above.

## Type

- Display: `font-display` (Bricolage Grotesque) — page titles, stat numbers, card titles that headline a surface. Always `font-bold tracking-tight`.
- Body/UI: Instrument Sans (default). Labels/eyebrows: `text-xs font-medium uppercase tracking-wider text-muted-foreground`.
- Data (ids, GROQ, counts in tables): `font-mono text-xs`, `tabular-nums` for aligned numbers.

## Surfaces

- Page background is the warm near-white `background`; cards are pure white (`card`) with `border` + `shadow-xs`. No heavy shadows, no gradients.
- Radius: `rounded-lg` for cards/dialogs, `rounded-md` for inputs/buttons/chips. Nothing pill-shaped except tiny status chips.
- Density: tables are compact (`text-sm`, `py-2.5` cells), generous page padding (`p-6`+). Wide content scrolls in its own container.

## Patterns

- **Page header**: back link (optional) → `font-display text-2xl font-bold tracking-tight` title + inline status badge → one-line muted description → actions aligned right. Every dashboard page uses this shape.
- **Forms are pages, not modals.** Entity creation lives at `…/new` routes: max-w-2xl form column, grouped fields with clear labels, helper text under complex fields, sticky-feeling footer with `Cancel` (link back) + primary submit. Big textareas (CV, description) get `min-h-48` and monospace-off. Only _pickers_ and the chat sheet may overlay.
- **Empty states**: dashed border card, one sentence inviting the action, primary button. Never a bare "No data".
- **Tables**: header row `text-xs uppercase tracking-wider text-muted-foreground`; row hover `hover:bg-muted/50`; the row's primary cell is a medium-weight link.
- **AI surfaces**: violet accents — `bg-ai text-ai-foreground` for the Ask Vetra button and primary AI CTAs, `bg-ai-soft` tints for receipts/badges, `border-ai/30` for upsell cards. Tool receipts stay `font-mono text-xs`.
- **Stat cards**: label (eyebrow style) over `font-display text-3xl font-bold tabular-nums` number. No icons needed.
- Buttons: `default` (ink) for the page's one primary action, `outline` for secondary, `ghost` for tertiary/inline. Destructive-ish actions (archive, close) are `outline` with plain language — no red unless it truly destroys.

## Voice

Sentence case everywhere. Buttons say exactly what happens ("Add company", then a state that says "Added"). Empty states invite ("No companies yet — add your first client."). No emoji, no exclamation marks in UI chrome.

## The overhaul (v2)

- **Two worlds**: the dark ink-violet rail (`#131120`, white text, white/10 actives) carries the brand; the warm light surface carries the work. The landing page hero and closing band live in the dark world with aurora glows + grain.
- **The AI dock**: "Ask Vetra" is a floating violet pill, fixed bottom-right on every dashboard screen. It is the ONLY floating element. Pages must keep bottom-right clear (`pb-24` on main handles it).
- **Cards over tables when scanning wins**: jobs are a card grid (title, company, StageMixBar, stale count, app count). Tables remain for dense reference lists (candidates, companies) but rows lead with an InitialsChip and a medium-weight name link.
- **New primitives**: `components/stage-mix-bar.tsx` (StageMixBar — stacked stage distribution) and `components/initials-chip.tsx` (InitialsChip — deterministic identity avatar). Use them everywhere a pipeline or a person appears in a list.
- **Page headers get bigger**: `text-3xl` display titles, generous top padding, meta line beneath; detail pages may use a header block with the InitialsChip (lg) beside the title.
- Section labels may use the landing's `font-mono text-xs tracking-[0.25em] uppercase` eyebrow style for rhythm.

## v4 — research-committed rules (do not regress)

Sources: Linear/Stripe/Vercel/Attio teardowns, Attio+Linear DESIGN.md, Mobbin screens (folk, Homerun, Wrangle, Juicebox), AI-slop kill lists. These override anything above where they conflict.

**Landing**: display type = large + LIGHT + tight (semibold max, tracking −0.02/−0.03em) — never extrabold shouting. One accent per viewport. No gradient text, no aurora blobs (ring hairlines + one faint radial only), no italic-serif accent words, no stat banners. Real-product visuals only. Copy: headlines ≤6 words, subheads ≤22 words, sections ≤40 words.

**App surfaces (dashboard)** — the crafted-ATS spec:

- NO display font in-app; page titles 16–20px font-semibold tracking-tight in a compact single-row header. No mono uppercase eyebrows in-app; mono is only for numbers/dates/ids at 11–12px muted.
- Type scale: 13–14px body in tables/lists/cards; column headers 11–12px medium muted; tabular-nums on all aligned numbers.
- Density: rows 36–44px (py-2 to py-2.5), buttons h-8 (size="sm") in-app, controls radius 4–6px, cards 8px.
- Depth = hairline borders + surface steps, NOT shadows (shadows only on popovers/modals/drawers).
- Sidebar: LIGHT surface step (bg-muted/50-ish vs white content), 220–240px, 13px labels, 28–32px items, subtle bg-fill active state; workspace switcher at top, user pinned at bottom; no dark rail, no top strip.
- Status = soft tinted pill (pastel same-hue bg + darker same-hue text, 12px medium) — never solid saturated badges, never thick colored border strips or gradient rails on cards/heroes (kill-list #10). The StageRail glyph (tiny dot rail) survives as the one compact pipeline indicator.
- 3-tier text ladder: foreground / muted-foreground / muted-foreground at 60% — metadata visibly quieter.
- Row hover: 2–4% tint + hover-revealed inline actions; motion 120–200ms ease-out; detail peeks may slide over.
- Violet stays EXCLUSIVELY the AI accent (dock, receipts, sourcing) — everything else near-achromatic.
