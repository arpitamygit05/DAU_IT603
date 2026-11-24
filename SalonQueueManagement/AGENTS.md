# AGENTS.md — Agent & Developer Operational Guide

Welcome to **The Style Atelier** Salon Queue Management System codebase. This guide provides future coding agents with essential architectural context, operational rules, and development guidelines.

---

## 1. Project Summary

**The Style Atelier** is a self-contained, client-side salon queue management web application designed for contemporary grooming lounges. It streamlines customer arrivals, eliminates waiting room congestion, and provides dedicated, synchronized interfaces for customers, receptionists, barbers, waiting area displays, and salon owners.

The application operates completely self-contained with **zero external backend or database dependencies**:
- Bundled services, barbers, pricing, and salon settings are bundled in the application code (`src/data/initialData.ts`).
- State changes persist in the user's browser `localStorage` (`style_atelier_queue_state_v1`).
- Same-browser tab synchronization is handled via the native `BroadcastChannel` API (`style_atelier_broadcast_sync`).
- **Limitation:** Cross-device synchronization is not supported because there is no remote database or server. State is local to the active browser instance.

---

## 2. Stack & Run Commands

- **Framework:** React 19, TypeScript, Vite, Tailwind CSS (v3.4.17)
- **Icons:** Lucide React (`lucide-react`)
- **Routing:** React Router DOM v7 (HTML5 client-side routing with Vercel rewrites)

### Commands (run from inside the `SalonQueueManagement` directory):
```bash
# Start local development server
pnpm run dev

# Run automated queue logic verification test suite
pnpm run test:rules

# Run production build (typecheck + vite build)
pnpm run build

# Preview production build locally
pnpm run preview
```

---

## 3. Read the Documentation First

Before making structural or algorithmic changes, read the documents in `docs/`:
- [01-brief.md](docs/01-brief.md) — Problem statement, target users, must-have features, exclusions, and look and feel.
- [02-screens.md](docs/02-screens.md) — Screen specifications, layout structure, actions, responsive behavior, and empty/error states for all 7 screens.
- [03-flows-rules.md](docs/03-flows-rules.md) — Customer and walk-in flows, lifecycle states, barber matching rules, wait time formulas, closing cutoff, and verification test checklist.
- [prompts.md](prompts.md) — Chronological history of build and refinement prompts.

---

## 4. Design & Brand Rules

- **Salon Brand Name:** **The Style Atelier** (consistently used across title, headers, footers, and cards).
- **Color Palette:**
  - Sage Deep: `#52675A`
  - Sage Pale: `#E7ECE5`
  - Sage Medium: `#829581`
  - Cream Background: `#FBF9F4`
  - Warm Beige: `#F4EFE5`
  - Terracotta Accent / Alert: `#C26D53`
  - Gold Accent: `#C5A059`
- **Typography:** Serif headings (`Playfair Display`), clean sans-serif body text (`Plus Jakarta Sans`), monospace timers.
- **Language:** English only.
- **Design Etiquette:**
  - Strict exclusion of plant leaves, floral graphics, or botanical illustrations. Use clean interface icons from Lucide only.
  - Touch targets must be at least 44px by 44px on interactive controls for mobile usability.
  - No visible "Demo" or "Sample" labels on customer-facing or staff-facing screens.
  - No invented salon street address or business telephone numbers.

---

## 5. Centralized Queue Logic Invariants

All queue business rules are centralized in pure functions inside `src/services/queueLogic.ts`. Never disperse queue transition rules across individual UI components.

1. **Deterministic Lifecycle:** `WAITING` → `CALLED` → `IN_CHAIR` → `DONE`. Waiting entries may be cancelled; called entries may be marked as no-show.
2. **Terminal Invariance:** `DONE`, `CANCELLED`, and `NO_SHOW` are terminal states; they can never be re-opened or moved back into the active queue.
3. **Barber Exclusivity:** If a client selects a specific barber, they must **never** be dispatched to a different barber.
4. **First-Come, First-Served (FCFS):** Barbers calling next customer always serve the earliest waiting customer matching their station (either specific or `"ANY"`).
5. **Barber Availability Constraints:**
   - A barber marked `ON_BREAK` or off duty (`onDuty: false`) must **never** be able to call the next customer.
   - Both the UI buttons (disabled with explanatory label) and underlying actions (`canBarberCallNext()` / `callNext()`) enforce this constraint.
6. **Active Phone Duplicate Check:** A phone number may hold only one active token (`WAITING`, `CALLED`, `IN_CHAIR`) at a time.
7. **30-Minute Online Cutoff:** Online joining automatically closes 30 minutes before salon closing time (`settings.closeTime`). In-person walk-ins remain accepted at reception.
8. **Initial State:** The app starts with an empty queue (`INITIAL_ENTRIES = []`). Known seeded sample IDs are automatically purged on load while preserving real user entries.
