# 01-brief.md — Product Brief & Scope

## 1. Problem Statement

Contemporary grooming lounges and barbershops often suffer from unpredictable wait times, congested physical waiting areas, and inefficient front-desk coordination. Walk-in clients are unsure when they will be served, while clients waiting remotely risk missing their turn. Front-desk staff struggle to balance walk-in traffic with online arrivals, and barbers lose styling time managing station queues.

**The Style Atelier** solves this by providing a unified, real-time digital queue management web application that eliminates physical waiting room congestion, provides transparent wait time estimations, and delivers tailored views for customers, receptionists, barbers, and salon owners.

---

## 2. Target Users

1. **Salon Customer (Mobile & Desktop):**
   - Accesses `/` and `/join` from their smartphone or computer.
   - Enters their name, 10-digit mobile number, selects 1 to 3 services, and optionally specifies a barber preference.
   - Monitors their personal live ticket at `/status/:id` with dynamic queue positioning, estimated wait times, and proactive alerts (e.g. proximity notice when 2nd in line, summon banner when called).

2. **Receptionist (Landscape Tablet & PC):**
   - Operates `/reception` at the front desk.
   - Monitors live barber station occupancy and service timers.
   - Registers in-person walk-ins (appended to the tail of the queue).
   - Calls the next customer for available stations and handles cancellations or no-shows.

3. **Stylist / Barber (Station Mirror Mobile):**
   - Operates `/barber/:name` on a mobile device mounted at their styling station.
   - Manages service lifecycle (`Start Service` → `Service Completed · Done`).
   - Toggles duty status (`Available` ↔ `On Break`).
   - Previews the next eligible client waiting in line.

4. **Waiting Lounge Visitors (TV Display):**
   - Views `/display` on a large wall-mounted monitor in the salon waiting area.
   - High-contrast, large-format layout showing station occupancy, next 5 tokens in line, and visual call banners.

5. **Salon Owner / Manager (Admin Console):**
   - Accesses `/admin` for operational controls and daily performance tracking.
   - Toggles online queue availability, adjusts salon closing hours, manages barber duty rosters, modifies services and pricing, and reviews revenue and wait time analytics.

---

## 3. Must-Have Features

- **Branding:** Consistent identity under **The Style Atelier**.
- **Complete 7-Screen Architecture:**
  - Customer Home (`/`)
  - Join Queue Form (`/join`)
  - Live Ticket Status (`/status/:id`)
  - Reception Dashboard (`/reception`)
  - Barber Station Terminal (`/barber/:name`)
  - Waiting Area TV Display (`/display`)
  - Owner Management Console (`/admin`)
- **Centralized Queue Logic:** Strict First-Come, First-Served (FCFS) prioritization matching barber preferences, station availability constraints, and break/duty rules.
- **Single Active Spot Rule:** A customer's phone number cannot hold more than one active queue spot simultaneously.
- **30-Minute Online Cutoff:** Online queue registration automatically closes 30 minutes before salon closing time, while reception walk-ins continue until closing.
- **Station Break & Off-Duty Guard:** Barbers marked on break or off duty cannot call next customers; both UI buttons and action handlers enforce this.
- **Visual Queue Alerts:**
  - Proximity warning at position #2 (*"Start coming to the salon — you're almost up!"*).
  - Turn notification when called (*"It's your turn! Please proceed to Station [X]"*).
  - Long wait visual warning on Reception (>60 minutes).
  - Pulsing TV banner when a client is called without requiring audio.
- **Polished Empty States:** Starts with an empty queue on first load, purging legacy sample entries while preserving user-created entries.
- **Self-Contained Architecture:** Operates with bundled services, barbers, and pricing without requiring a database, backend server, or third-party paid API.

---

## 4. Look and Feel

- **Color Palette:** Calming, upscale sage-green and warm beige:
  - Deep Sage: `#52675A` (primary brand color, headers, primary buttons)
  - Pale Sage: `#E7ECE5` (soft badges, highlights)
  - Warm Beige: `#F4EFE5` (surface backgrounds, borders)
  - Light Cream: `#FBF9F4` (primary canvas background)
  - Dark Charcoal: `#1E231E` (text and TV display dark background)
  - Terracotta Alert: `#C26D53` (called notifications, cancellation alerts)
  - Muted Gold: `#C5A059` (subtle accent highlights)
- **Typography:**
  - Serif Display: `Playfair Display` for brand headers and section titles.
  - Sans-Serif Body: `Plus Jakarta Sans` for body text, form controls, and labels.
  - Monospace: Clean tabular numerals for digital clocks and service timers.
- **Visual Design Rules:**
  - Clean interface iconography from Lucide React; strict exclusion of botanical illustrations, leaf vectors, or plant clip art.
  - Generous touch targets (minimum 44px by 44px) on all interactive controls for mobile usability.
  - High-contrast, dark-mode styling specifically tailored for `/display` for legibility from several metres away.
  - English-only text across all screens.
  - No visible "Demo" or "Sample" labels, and no invented salon street addresses or business phone numbers.

---

## 5. Explicit Exclusions (Non-Goals)

To keep the application focused, robust, self-contained, and within assignment requirements:
- **No External Database / Backend:** All data persists locally in the browser's `localStorage` and syncs across tabs via `BroadcastChannel`. Cross-device synchronization is explicitly excluded.
- **No Payment Gateways:** In-salon transactions occur in person; no credit card processing or payment APIs.
- **No Future Date Appointments:** The application strictly manages the live, same-day queue.
- **No Paid External Messaging Services:** No automated SMS or WhatsApp gateways (e.g. Twilio).
- **No Loyalty or Reward Programs:** Kept lean and focused on queue mechanics.
- **No Multi-Branch Management:** Dedicated to a single salon location.
