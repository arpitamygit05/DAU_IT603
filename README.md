# Salon Queue Management System

**Live website:** Deployment pending Vercel account authorization (see Deployment Instructions below)  
**Public GitHub repository:** https://github.com/arpitamygit05/DAU_IT603

---

## 1. Project Setup and Visual Design

The **Aura Salon Queue Management System** is an end-to-end digital queue and customer flow platform designed for modern salons and grooming lounges. It streamlines client intake, eliminates chaotic waiting rooms, and unifies customers, receptionists, barbers, and salon owners into a synchronized real-time experience.

### Visual Design System
- **Design Philosophy:** Modern classic, calm, and premium. Rooted in intentional salon craft, avoiding generic admin dashboard templates.
- **Color Palette:**
  - **Deep Sage (`#52675A`):** Primary branding, key call-to-actions, and ticket badges.
  - **Soft Sage (`#829581`):** Subtle accents and secondary interface markers.
  - **Pale Sage (`#E7ECE5`):** Soft chip backgrounds, active pill highlights, and selection cards.
  - **Warm Beige (`#F4EFE5`):** Warm structure backgrounds and contrast panels.
  - **Cream (`#FBF9F4`):** Elevated card surfaces and crisp readable paper layers.
  - **Dark Charcoal (`#292D29` / `#1E231E`):** High-contrast typography and dark TV mode.
  - **Muted Earth (`#77766F`):** Legible metadata and secondary labels.
  - **Terracotta Accent (`#C26D53`):** Reserved strictly for calling alerts and >60m wait warnings.
  - **Muted Gold (`#C5A059`):** Accent highlights for prestige services and indicators.
- **Iconography & Graphics:** Strictly clean interface iconography (via Lucide React: scissors, clocks, users, alerts). **Zero botanical patterns, leaf illustrations, or plant icons**, maintaining a crisp, architectural grooming aesthetic.
- **Typography:** Refined serif headings (*Playfair Display*) paired with legible modern geometric sans-serif body (*Plus Jakarta Sans*).
- **Ergonomics:** All interactive buttons, radio selections, and form inputs maintain a minimum **44px tap target** for seamless mobile and tablet touch operation.

---

## 2. Customer Home and Joining the Queue

### Home (`/`)
- **Brand Identity:** Typographic wordmark *"AURA GROOMING LOUNGE — Atelier"*.
- **Salon Status Indicator:** Live badge highlighting open/closed state, current closing time, and queue availability.
- **Real-Time Waiting Metrics:** Displays the exact count of clients currently in line and approximate wait time in minutes.
- **Barber Station Roster:** Live status cards for every barber on duty (`Available`, `In Chair`, or `On Break`).
- **Token Tracker:** Integrated lookup field allowing returning customers to enter their Token (e.g. `S-14`) or phone number to jump straight to their live ticket.
- **Services Catalog Preview:** Grid displaying active haircut, beard sculpting, hair spa, and facial packages with transparent Indian Rupee (`₹`) pricing and service durations.

### Join Queue (`/join`)
- **Validated Intake:** Customer name and validated 10-digit Indian phone number (`+91`).
- **Flexible Service Selection:** Choose 1 to 3 active services with real-time recalculation of total duration (mins) and total bill (₹ INR).
- **Barber Preference:**
  - Choose *"Any Available Barber (Fastest)"* for earliest chair assignment.
  - Choose a specific barber (e.g. Arjun Sharma, Rohan Patel, Vikram Joshi).
  - Clear notice provided if a chosen barber is currently taking a scheduled break.
- **Duplicate Protection:** Enforces one active queue entry per phone number. If a customer tries to join with a number that already holds an active token (`WAITING`, `CALLED`, or `IN_CHAIR`), the app displays their existing token and redirects them to their status screen instead of creating a duplicate.
- **Online Cutoff Guard:** Online joining is automatically disabled 30 minutes before salon closing time, while inviting walk-in customers to register at the desk.

---

## 3. Live Status and Queue Rules

### Customer Ticket Status (`/status/:id`)
- **Dynamic Token Card:** Bold sequential token badge (e.g. `S-14`) with live position indicator (e.g. `#2 in queue`).
- **Progress Stages:** Visual 4-step progress bar: `Waiting` → `Called` → `In Chair` → `Done`.
- **Proximity Alert (Position #2):** When a customer advances to 2nd position in line, a golden alert banner notifies them: *"Start coming to the salon — you're almost up!"*.
- **Calling Alert (`CALLED`):** When called, the screen turns into a pulsating terracotta call banner: *"It's your turn! Please proceed to Station [X] with [Barber Name]"*.
- **Ticket Management:** Customers can cancel their waiting spot with an interactive confirmation modal, or copy their personal tracking link.
- **Reactive Multi-Tab Sync:** Uses browser `BroadcastChannel` and `storage` events. When a receptionist or barber changes status in another tab or device, the customer's status updates instantly without manual refresh.

### Centralized Queue Engine Rules (`src/services/queueLogic.ts`)
1. **Strict Lifecycle:** `WAITING` → `CALLED` → `IN_CHAIR` → `DONE`. `WAITING` entries can be `CANCELLED`. `CALLED` entries can be marked `NO_SHOW`.
2. **Terminal Invariance:** Completed, cancelled, or no-show entries can never move back into an active status.
3. **Barber Exclusivity:** A customer who selects a specific barber is **never** assigned or dispatched to another barber.
4. **First-Come, First-Served (FCFS):** Earliest waiting customers who selected that barber or "Any Barber" are always called first.
5. **Single Seat Constraint:** A barber can have only one customer in chair at a time and cannot be called when on break.
6. **Wait Time Estimation Algorithm:** Dynamically sums the remaining chair time of the assigned barber plus the durations of all waiting jobs ahead in line.

---

## 4. Reception and Barber Workflows

### Reception Dashboard (`/reception`)
- **Optimized for Landscape Tablet:** Full-width panoramic layout designed for front-desk tablets and desktop consoles.
- **Barber Station Cards:** Real-time visibility into all barber chairs, elapsed service timers, current client tokens, and one-tap *"Call Next"* triggers.
- **Arrival-Ordered Waiting Queue:** Complete waiting table displaying token, customer name, phone, selected services, barber preference, and waiting time.
- **>60-Minute Long Wait Warning:** Any client waiting for more than 60 minutes is highlighted with an alert badge and warning border to prevent service neglect.
- **Walk-In Registration Modal:** Receptionists can register in-person walk-ins on the fly; walk-ins append to the tail of the same queue with a fresh sequential token.
- **No-Show Handling:** If a called client does not appear within 10 minutes, reception can mark them as `NO_SHOW`, immediately freeing the barber station for the next client.

### Barber Station Terminal (`/barber/:name`)
- **Phone-Friendly Interface:** Tailored for mobile screens mounted at barber styling mirrors with large touch targets.
- **Barber Switcher:** Quick profile switcher for Arjun Sharma, Rohan Patel, Vikram Joshi, etc.
- **Availability Toggle:** Switch between `Available` and `On Break` with a single tap.
- **Client Execution Card:** Displays current client's token, name, and service checklist.
- **Live Service Timer:** Digital stopwatch tracking elapsed cutting time against estimated service duration.
- **Action Triggers:**
  - *"Start Service"* (transitions `CALLED` → `IN_CHAIR`).
  - *"Service Completed · Done"* (transitions `IN_CHAIR` → `DONE` and opens station).
- **Next Up In Line:** Live preview of the next eligible waiting client.

---

## 5. Waiting-Area Display and Owner Settings

### Waiting Area TV Display (`/display`)
- **High-Contrast Dark Theme:** Optimized for wall-mounted 1080p and 4K TVs viewed from 3 to 10 metres away (`#1E231E` dark sage background with `#FAF6EE` typography).
- **Fullscreen Mode:** One-tap fullscreen toggle for dedicated TV browser sticks.
- **Live Station Grid:** Shows which customer token is currently in each barber chair.
- **Next 5 Queue Board:** Displays the next five upcoming tickets with estimated wait times.
- **Visual Call Pulse:** Pulsing banner when a customer is called: *"NOW CALLING: Token S-14 (Aarav) → Station 2 (Rohan Patel)"*.

### Owner Settings & Analytics (`/admin`)
- **Daily Performance Metrics:**
  - Total clients served today.
  - Average wait time in minutes.
  - No-show count and rate.
  - Estimated daily revenue in Indian Rupees (₹).
- **Queue Controls:** Toggle online joining on/off, adjust salon closing time, and toggle salon open/closed status.
- **Barber Roster Management:** Toggle barbers on/off duty and add new barbers.
- **Services Catalog Management:** Add new services, edit durations and prices, or toggle active/inactive status.
- **One-Click Demo Reset:** Restores initial demo state instantly.

---

## 6. Language Support, Responsive Polish, and Verification

- **English-Only UI:** The interface is built entirely in concise, natural English without translation baggage.
- **Responsive Viewport Testing:**
  - **Phone (375px – 430px):** Customer Home, Join Queue, My Status, and Barber View.
  - **Tablet Landscape (1024px – 1366px):** Reception Dashboard with full grid and queue table.
  - **Large TV (1920px+):** Waiting Area TV Display with high-contrast board.
- **Queue Logic Test Suite:** All business rules verified with 100% pass rate via `tsx test-queue-rules.ts`.

---

## 7. Local Setup, Demo Access, and Deployment Instructions

### Prerequisites
- Node.js 18+ (tested on Node v24.22.1)
- `pnpm` (or `npm`)

### Local Setup
```bash
# Navigate to the salon project folder
cd SalonQueueManagement

# Install dependencies
pnpm install

# Run the development server
pnpm run dev
```
Open `http://localhost:5173` in your browser.

### Run Verification Test Suite
```bash
# In SalonQueueManagement folder
pnpm run test:rules
```

### Production Build & Preview
```bash
pnpm run build
pnpm run preview
```

### Demo Access URLs & Credentials
The application operates in a zero-friction demo mode without external backend credentials. State is stored in browser `localStorage` and synchronized across all open tabs via `BroadcastChannel`:
- **Customer Home:** `/`
- **Join Queue Form:** `/join`
- **Sample Customer Ticket:** `/status/entry-12` (or join anew to get an instant ticket)
- **Receptionist Tablet:** `/reception`
- **Barber Terminals:**
  - `/barber/Arjun` (Station 1 — Arjun Sharma)
  - `/barber/Rohan` (Station 2 — Rohan Patel)
  - `/barber/Vikram` (Station 3 — Vikram Joshi)
- **Waiting Area TV Display:** `/display`
- **Owner Admin Console:** `/admin`

### Vercel Deployment Instructions
To deploy the frontend to Vercel as a publicly shareable website:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New Project** and select your GitHub repository: `https://github.com/arpitamygit05/DAU_IT603`.
3. In the project configuration:
   - **Root Directory:** Edit to `SalonQueueManagement`
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm run build` (or `npm run build`)
   - **Output Directory:** `dist`
4. Click **Deploy**.
5. Once deployment completes, copy the generated `.vercel.app` URL and update the top of this `README.md`.

---

## Repository Coursework Archive

### Linux Programming Laboratory
**Task 1 to Task 5:** Completed successfully.
