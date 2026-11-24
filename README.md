# Salon Queue Management System — The Style Atelier

**Live website:** Deployment pending Vercel account authorization (see Deployment Instructions below)  
**Public GitHub repository:** https://github.com/arpitamygit05/DAU_IT603

---

## Overview

**The Style Atelier** is a modern, self-contained salon queue management web application designed for contemporary grooming lounges. It streamlines customer arrivals, eliminates physical waiting room congestion, and provides dedicated, synchronized interfaces for customers, receptionists, barbers, waiting area displays, and salon owners.

The project is built with **React 19, TypeScript, Vite, and Tailwind CSS**. It features a modern classic visual design rooted in a calming palette of sage green, warm beige, and cream, using clean interface iconography and comfortable tap targets (minimum 44px) across mobile, tablet, and desktop viewports.

---

## Key Features

### 1. Customer Home (`/`)
- Live salon operating status banner showing current opening hours and queue availability.
- Real-time waiting counter indicating how many clients are currently in line and the approximate wait time.
- Station status strip showing all on-duty barbers with clear availability badges (`Available`, `In Chair`, `On Break`).
- Direct action to join the digital queue online.
- Integrated ticket lookup enabling returning customers to track an existing token (e.g. `S-14`) or phone number directly.
- Curated services showcase displaying service categories, durations, and demo Indian Rupee (`₹`) pricing.

### 2. Join Queue (`/join`)
- Customer name input and validated 10-digit phone number.
- Service selection allowing customers to choose between 1 and 3 active services.
- Barber preference option: choose **"Any Available Barber (Fastest)"** or pick a specific barber.
- Reactive live ticket summary calculating total duration, total price, and estimated wait before confirming.
- **Single Active Spot Enforcement:** Restricts each phone number to one active queue entry at a time. Entering an already active number displays that customer's existing token and links directly to their ticket.
- **30-Minute Online Cutoff:** Online joining automatically closes 30 minutes before salon closing time, while in-person walk-ins remain accepted at the reception desk.

### 3. Live Customer Ticket Status (`/status/:id`)
- Prominent sequential token badge (e.g. `S-14`) and live queue position (`#1 in line`, `#2 in line`).
- Visual 4-stage lifecycle progression: `Waiting` → `Called` → `In Chair` → `Done`.
- **Proximity Alert (Position #2):** Displays a high-visibility notice (*"Start coming to the salon — you're almost up!"*) when the customer is next in line.
- **Turn Summon Banner:** Visual calling card (*"It's your turn! Please proceed to Station [X]"*) when assigned to a chair.
- Cancellation dialog with confirmation prompt (allowed while in `Waiting` status).
- One-tap link bookmarking and sharing.

### 4. Receptionist Tablet Dashboard (`/reception`)
- Tailored for landscape tablet and desktop front-desk displays.
- Barber station overview cards showing current customer token, elapsed service timer, and a one-tap **"Call Next"** trigger.
- Ordered waiting queue table displaying arrival order, customer details, selected services, and elapsed wait duration.
- **Long-Wait Warning:** Visually flags any client waiting more than 60 minutes with an alert border and warning badge.
- Quick actions:
  - **Add Walk-In:** Registers walk-in customers on the fly, appending them to the end of the shared queue with a sequential token.
  - **Mark No-Show:** Allows reception to mark a called client as a no-show if absent within 10 minutes, immediately releasing the barber station.
  - **Cancel Ticket:** Removes waiting customers with a confirmation modal.

### 5. Barber Station Terminal (`/barber/:name`)
- Designed for mobile phones mounted near styling station mirrors.
- Station profile selector for quick switching between barbers (e.g. Arjun Sharma, Rohan Patel, Vikram Joshi).
- Availability toggle between **"Available"** and **"On Break"**.
- Active client card showing token, customer name, and requested service checklist.
- Digital service stopwatch tracking elapsed cutting time against estimated service duration.
- **"Start Service"** and **"Service Completed · Done"** action buttons.
- Real-time preview of the next eligible client waiting in line.

### 6. Waiting Area TV Display (`/display`)
- High-contrast dark theme (`#1E231E`) optimized for large wall-mounted TV monitors viewed from several metres away.
- Integrated digital clock (seconds precision), date, and one-tap fullscreen toggle.
- Station grid displaying current chair status and seated tokens.
- Upcoming queue board showing the next 5 tokens in line with estimated wait times.
- **Visual Call Notification:** Pulsing highlight banner when a customer is called to a station without requiring audio.

### 7. Owner Settings & Analytics (`/admin`)
- Daily performance dashboard tracking clients served, average wait time, no-show count, and estimated daily revenue in ₹ INR.
- Queue management controls: toggle online joining on/off, adjust salon closing time, and toggle salon open/closed status.
- Barber roster management: toggle on/off duty status and add new barbers.
- Services catalog management: update service names, durations, prices, and active availability, or add new services.
- Demo data reset button to restore default sample records.

---

## Queue Logic & Business Rules

All queue mechanics are enforced by a pure, deterministic engine (`src/services/queueLogic.ts`):
1. **Deterministic Lifecycle:** `WAITING` → `CALLED` → `IN_CHAIR` → `DONE`. Waiting entries may be cancelled; called entries may be marked as no-show.
2. **Terminal Invariance:** Completed, cancelled, or no-show entries cannot transition back into an active state.
3. **Barber Exclusivity:** A customer who selects a specific barber is never dispatched to a different barber.
4. **First-Come, First-Served (FCFS):** The earliest waiting customer matching the barber's station (either requesting that barber or "Any Barber") is prioritized.
5. **Single Seat Constraint:** A barber can serve only one client in chair at a time and cannot be called when on break or off duty.
6. **Wait Time Formula:**
   - **Specific Barber:** Remaining time of current client in chair + sum of service durations of all waiting customers ahead requesting that barber.
   - **Any Barber:** Total remaining service duration of all waiting customers ahead divided by active working barbers.

---

## Data Architecture & Storage Limitations

This application operates as a self-contained static web application with **zero external backend or database dependencies**:
- **Bundled Demo Data:** Complete initial services, barbers, and sample queue entries are bundled in the application code and loaded immediately on first visit.
- **Browser Persistence:** Changes made during testing (joining the queue, calling clients, completing services) are saved to browser `localStorage`. Refreshing the page retains your demo changes.
- **Same-Browser Tab Synchronization:** State changes broadcast across open tabs in the same browser using the browser's native `BroadcastChannel` API.
- **Honest Limitation:** Because there is no central database or server, changes made on one computer or device will **not** sync to a different person's physical device. Cross-tab sync operates strictly within the same browser instance.

---

## Local Setup & Verification

### Prerequisites
- Node.js 18+ (tested on Node v24.22.1)
- `pnpm` (or `npm`)

### Installation & Run
```bash
# 1. Navigate to the salon application folder
cd SalonQueueManagement

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm run dev
```
The application will open at `http://localhost:5173`.

### Automated Verification Test Suite
The project includes automated verification tests covering all 8 core queue business rules (FCFS ordering, barber preference exclusivity, barber availability constraints, phone duplicate detection, 30-minute online cutoff, queue position indexing, and pricing calculations):
```bash
# In SalonQueueManagement folder
pnpm run test:rules
```

### Production Build & Preview
```bash
# Build production bundle
pnpm run build

# Preview production build locally
pnpm run preview
```

---

## Demo Route Directory

All routes work directly via client-side routing:
- **Customer Home:** `/`
- **Join Queue Form:** `/join`
- **Sample Customer Ticket:** `/status/entry-12` (or create a new ticket at `/join`)
- **Receptionist Tablet:** `/reception`
- **Barber View (Arjun Sharma):** `/barber/Arjun`
- **Barber View (Rohan Patel):** `/barber/Rohan`
- **Barber View (Vikram Joshi):** `/barber/Vikram`
- **Waiting Area TV Display:** `/display`
- **Owner Admin Console:** `/admin`

---

## Deployment Instructions (Vercel)

The application is configured for deployment as a static site on Vercel:

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New Project** and connect your GitHub repository: `https://github.com/arpitamygit05/DAU_IT603`.
3. In the project settings:
   - **Root Directory:** Set to `SalonQueueManagement`
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm run build` (or `npm run build`)
   - **Output Directory:** `dist`
4. Click **Deploy**.
5. Once deployment finishes, verify the generated public `.vercel.app` URL and update the top of this `README.md`.

---

## Coursework Archive

### Linux Programming Laboratory
**Task 1 to Task 5:** Completed successfully.
