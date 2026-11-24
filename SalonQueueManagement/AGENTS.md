# AGENTS.md — Agent & Developer Operational Guide

Welcome to **The Style Atelier** Salon Queue Management System codebase. This guide provides AI agents and human developers with architectural context, code organization, and development guidelines.

---

## 1. System Overview

**The Style Atelier** is a modern salon queue website designed for live queue management across multiple form factors:
- **Customer Mobile**: Queue joining, real-time ticket tracking, and wait time alerts.
- **Receptionist Tablet**: Barber status overview, queue monitoring (>60m wait alerts), walk-in registration, and client calling.
- **Barber Station Mobile**: Barber service timer, start/done actions, break toggle, and next eligible customer preview.
- **Waiting Area TV Display**: High-contrast, large-format board with visual call pulses.
- **Owner Admin Console**: Service catalog, barber duty roster, queue controls, and daily analytics.

---

## 2. Documentation Links

Detailed design and business documentation is located in the `docs/` directory:
- [01-brief.md](docs/01-brief.md) — Product goal, target users, must-have scope, and explicit non-goals.
- [02-screens.md](docs/02-screens.md) — Comprehensive screen specs, layout rules, and responsive design guidelines.
- [03-flows-rules.md](docs/03-flows-rules.md) — Queue state transitions, barber preference logic, and wait time algorithms.
- [prompts.md](prompts.md) — Record of prompt history and optional future refinement prompts.

---

## 3. Directory Layout

```
SalonQueueManagement/
├── public/                 # Static assets (SVG logo, favicon)
├── src/
│   ├── components/         # Reusable UI components (Navbar, Footer, Modals)
│   ├── context/            # React Context (QueueContext) with cross-tab BroadcastChannel sync
│   ├── data/               # Realistic initial seed data for demo environment
│   ├── pages/              # Screen implementations (Home, Join, Status, Reception, Barber, Display, Admin)
│   ├── services/           # Pure queue engine business logic (queueLogic.ts)
│   ├── types/              # TypeScript models and interfaces (queue.ts)
│   ├── App.tsx             # Root router and layout shell
│   ├── main.tsx            # Application entry point
│   └── index.css           # Tailwind base styles and custom theme rules
├── docs/                   # Product & architectural specs
├── AGENTS.md               # This guide
├── prompts.md              # Build prompts and future prompt recipes
├── test-queue-rules.ts     # Automated queue business rules test suite
└── package.json            # Scripts & dependencies
```

---

## 4. Engineering Principles & Invariants

1. **Pure Queue Engine (`src/services/queueLogic.ts`)**:
   - Keep business rules pure, deterministic, and free of side effects.
   - Respect barber preferences: Customers choosing a specific barber MUST never be assigned to another barber.
   - Respect FCFS order for eligible customers.
   - Single customer in chair per barber.
   - 30-minute online cutoff before closing time.
2. **Client-Side Storage & Same-Browser Tab Sync**:
   - Handled via `BroadcastChannel('style_atelier_broadcast_sync')` backed by `localStorage` persistence.
   - Synced across open tabs in the same browser session. Does not synchronize across separate physical devices.
3. **Aesthetics & Tone**:
   - Modern classic, calm sage green (`#52675A`, `#829581`, `#E7ECE5`) and warm beige (`#F4EFE5`, `#FBF9F4`).
   - No leaves, plant icons, or botanical illustrations. Interface icons from Lucide only.
   - Minimum 44px tap targets for mobile usability.
