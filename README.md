# The Style Atelier — Salon Queue Management System

**Live Website:** https://the-style-atelier.vercel.app  
**Hosting Platform:** Vercel  
**Staff Access Details:** No login, password, or PIN is required to access staff screens (Reception, Barber, Waiting Area Display, and Owner Settings); all views are openly accessible for direct evaluation.

---

## About

**The Style Atelier** is a modern, self-contained salon queue management web application designed for contemporary grooming lounges. It streamlines client arrivals, eliminates physical waiting room congestion, and provides synchronized, dedicated interfaces across mobile, tablet, and desktop form factors.

Built with **React 19, TypeScript, Vite, and Tailwind CSS**, the application features a modern classic visual design with a calming sage-green and warm beige palette, clear typographic hierarchy (`Playfair Display` and `Plus Jakarta Sans`), and comfortable tap targets (minimum 44px).

---

## Key Features

- **Customer Home (`/`):** Real-time salon opening status, current waiting counter, approximate wait time, live barber availability strip (`Available`, `In Chair`, `On Break`), token/phone lookup, and curated services showcase.
- **Join Queue Form (`/join`):** Online queue registration with validated 10-digit phone number, multi-service selection (1–3 services), and barber preference (*"Any Available Barber"* or a specific stylist). Enforces a single active spot per phone number and automatically shuts down online registration 30 minutes before closing time.
- **Live Ticket Status (`/status/:id`):** Real-time customer ticket tracking with sequential token badge (e.g. `S-14`), dynamic queue position, estimated wait time, 4-stage lifecycle tracker (`Waiting` → `Called` → `In Chair` → `Done`), high-visibility proximity notice at position #2 (*"Start coming to the salon"*), summon card when called, and one-tap cancellation.
- **Reception Desk Dashboard (`/reception`):** Optimized for landscape tablets and desktop displays. Features a barber station grid with elapsed service timers, break toggles, one-click *"Call Next"* triggers, ordered waiting queue table (FCFS), >60m long-wait alert badges, walk-in registration modal (appended to tail of queue), and no-show / cancellation actions.
- **Barber Station Terminal (`/barber/:name`):** Mobile interface mounted at styling stations. Includes barber switcher, availability toggle (`Available` ↔ `On Break`), active client card with service checklist, digital elapsed service stopwatch, and a preview of the next eligible waiting client. Guarded against calling when on break or off duty.
- **Waiting Area TV Display (`/display`):** Fullscreen, high-contrast dark theme (`#1E231E`) for wall-mounted TV monitors. Displays a seconds-precision digital clock, current date, fullscreen toggle, station status grid, top-5 upcoming tickets with estimated waits, and a pulsing visual call announcement banner when a client is summoned.
- **Owner Settings & Analytics (`/admin`):** Management console tracking daily performance metrics (clients served, average wait time, no-shows, estimated revenue in ₹ INR), queue controls (online queue toggle, operating hours adjustment), barber roster duty manager, services catalog editor (add/edit durations and prices), and clean state reset.

---

## Core Queue Logic Rules

All queue mechanics are enforced by a pure, deterministic engine (`SalonQueueManagement/src/services/queueLogic.ts`):
1. **First-Come, First-Served (FCFS):** Earliest arrivals matching a station's criteria are always prioritized.
2. **Strict Barber Exclusivity:** A customer who chooses a specific barber is never assigned to a different barber.
3. **Barber Availability Guard:** A barber marked `ON_BREAK` or off duty cannot call next customers; enforced by both disabled UI buttons and underlying logic.
4. **Single Active Spot:** Each phone number is limited to one active ticket at a time.
5. **30-Minute Online Cutoff:** Online registration closes 30 minutes before closing time; reception walk-ins continue until closing.
6. **Client-Side Persistence:** Bundled initial services, barbers, and settings load automatically with zero external backend or database. State changes persist in the local browser's `localStorage` and synchronize across open tabs via `BroadcastChannel`. Cross-device synchronization is not supported without a shared database.

---

## Screen & Route Directory

All routes operate directly via client-side routing:

| Screen | Route | Target Device & Audience |
| :--- | :--- | :--- |
| **Customer Home** | `/` | Mobile / Desktop — Public landing & ticket lookup |
| **Join Queue** | `/join` | Mobile / Desktop — Registration form |
| **Customer Ticket Status** | `/status/:id` | Mobile — Real-time customer tracking |
| **Reception Desk** | `/reception` | Tablet (Landscape) / Desktop — Front desk management |
| **Barber Terminal (Arjun)** | `/barber/Arjun` | Mobile — Station 1 stylist controls |
| **Barber Terminal (Rohan)** | `/barber/Rohan` | Mobile — Station 2 stylist controls |
| **Barber Terminal (Vikram)** | `/barber/Vikram` | Mobile — Station 3 stylist controls |
| **Waiting Area TV Display** | `/display` | Large TV Screen / Kiosk — Lounge monitor |
| **Owner Admin Console** | `/admin` | Desktop / Tablet — Salon owner management |

---

## Local Setup Instructions

### Prerequisites
- Node.js 18+
- `pnpm` (or `npm`)

### Installation & Run
```bash
# 1. Navigate to the salon application folder
cd SalonQueueManagement

# 2. Install dependencies
pnpm install

# 3. Start local development server
pnpm run dev
```
Open `http://localhost:5173` in your browser.

### Automated Queue Rules Test Suite
```bash
# In SalonQueueManagement folder
pnpm run test:rules
```

### Production Build
```bash
# In SalonQueueManagement folder
pnpm run build
```

---

## Documentation

Comprehensive project and design specifications are located in the `SalonQueueManagement/docs/` directory:
- [01-brief.md](SalonQueueManagement/docs/01-brief.md) — Product brief, problem statement, users, features, and exclusions.
- [02-screens.md](SalonQueueManagement/docs/02-screens.md) — Screen layouts, actions, responsive behavior, and empty/error states.
- [03-flows-rules.md](SalonQueueManagement/docs/03-flows-rules.md) — Detailed flows, state transitions, mathematical formulas, and verification checklist.
- [prompts.md](SalonQueueManagement/prompts.md) — Chronological history of prompts used.
- [AGENTS.md](SalonQueueManagement/AGENTS.md) — Architectural invariants and guidelines for future coding agents.
