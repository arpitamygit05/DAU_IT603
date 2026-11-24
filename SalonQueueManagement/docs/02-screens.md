# 02-screens.md — Screen Specifications & Layout Hierarchy

This document provides detailed specifications for all seven screens of **The Style Atelier** Salon Queue Management System, detailing purpose, layout structure, available user actions, responsive behavior, and empty/error states.

---

## 1. Customer Home (`/`)

- **Purpose:** Public landing page providing live salon status, operating hours, queue length, on-duty barber availability, ticket lookup, and the primary call-to-action to join the queue.
- **Layout:**
  - **Top Navigation:** Brand wordmark, real-time queue badge (`Queue Open/Closed`, wait count, close time), and portal navigation links.
  - **Hero Section:** Value proposition, *"Join Queue Online"* button, and quick ticket/phone tracker search field.
  - **Queue Snapshot Card:** Live counter of customers currently in line, approximate wait time in minutes, and an active station status strip showing on-duty barbers with status badges (`Available`, `In Chair`, `On Break`).
  - **Services Showcase:** Cards detailing categories (Hair, Beard, Spa, Facial, Combo), durations in minutes, and transparent pricing in ₹ INR.
  - **Footer:** Operating hours, staff portal links, client-side persistence notice, and reset-to-defaults trigger.
- **Actions:**
  - Click *"Join Queue Online"* → navigates to `/join`.
  - Enter token or phone in tracker input and click *"Track"* → searches active and past entries; navigates directly to `/status/:id` if found.
  - Click any staff portal link → navigates to the respective screen.
- **Responsive Behavior:** Stacks into a clean single column on mobile (<640px) with minimum 44px tap targets; expands to a two-column hero and multi-column service grid on desktop (>1024px).
- **Empty & Error States:**
  - **Empty Queue:** Counter displays `0 clients`, approximate wait displays `~0 mins`, and barber stations show `Available` badges.
  - **Lookup Error:** If an invalid token or unregistered phone number is entered, displays inline warning: *"No queue record found for this token or phone number."*

---

## 2. Join Queue (`/join`)

- **Purpose:** Customer registration form to secure a spot in the live salon queue.
- **Layout:**
  - **Step 1 (Contact Information):** Full name input and 10-digit Indian mobile number input with `+91` prefix.
  - **Step 2 (Service Selection):** Interactive multi-select grid of bundled active services (Haircut, Beard Sculpting, Hair Spa, Facial, etc.) with individual prices and durations. Selection is constrained to 1–3 services.
  - **Step 3 (Barber Selection):** Radio/pill selector allowing either *"Any Available Barber (Fastest)"* or a specific on-duty barber. Highlights barber role and current status.
  - **Summary Panel:** Dynamic ticket breakdown showing selected services, total estimated duration, total price in ₹ INR, and estimated wait time before submission.
- **Actions:**
  - Toggle services on/off (1–3 allowed).
  - Select barber preference.
  - Submit form → creates a new `WAITING` queue entry with a sequential token (e.g. `S-14`), persists state, broadcasts update, and navigates to `/status/:id`.
- **Responsive Behavior:** 12-column layout on desktop with sticky summary sidebar; stacked single-column flow on mobile with sticky bottom confirmation bar.
- **Empty & Error States:**
  - **Missing Fields:** Highlights missing name (*"Please provide your name"*) or phone (*"Please provide a valid 10-digit Indian phone number"*).
  - **Service Bounds:** Warns if 0 services (*"Please select at least 1 service"*) or >3 services (*"You may select a maximum of 3 services per visit"*).
  - **Duplicate Active Spot:** If the phone number is already active in queue, displays alert banner with token and direct link (*"You already have an active spot in queue with Token [S-X]. Click here to view your ticket."*).
  - **Cutoff / Closed Queue:** If within 30 minutes of closing or queue is toggled off, disables form submission and displays warning: *"Online queue registration is closed. Please register as a walk-in at the salon reception desk."*

---

## 3. Customer Status Screen (`/status/:id`)

- **Purpose:** Dedicated live tracking screen for a customer waiting for their turn.
- **Layout:**
  - **Top Navigation Bar:** Link back to salon home and a *"Share / Bookmark"* link copy button.
  - **Dynamic Alert Banners:**
    - **Position #2 Alert (Proximity Notice):** High-visibility amber banner (*"Start coming to the salon! You are currently #2 in line"*).
    - **Called Alert (Summon Card):** High-visibility terracotta banner (*"It's Your Turn Now! Please proceed to Station [X] with [Barber Name]"*).
  - **Main Ticket Card:** Large sequential token badge (e.g. `S-14`), customer name, registered phone number, live queue position badge (`#1 in line`), estimated wait time, and visual 4-step progress bar (`Waiting` → `Called` → `In Chair` → `Done`).
  - **Service Details Card:** Breakdown of chosen services, total duration, price, and assigned/preferred stylist.
  - **Cancel Spot Section:** Red cancellation button (available only in `WAITING` state).
- **Actions:**
  - Copy shareable URL to clipboard.
  - Cancel ticket → opens confirmation modal; transitions entry to `CANCELLED`, frees queue spot, and updates status.
- **Responsive Behavior:** Optimized for mobile vertical viewing with large legible typography and clear progress indicators.
- **Empty & Error States:**
  - **Ticket Not Found:** If `:id` does not match any entry in storage, displays an empty card: *"Ticket Not Found. We could not find an active queue ticket matching this ID."* with direct links to *"Go Home"* and *"Join Queue"*.
  - **Cancelled / No-Show State:** Displays a muted banner explaining the ticket is no longer active, with an option to return home.

---

## 4. Reception Dashboard (`/reception`)

- **Purpose:** Front-desk administrative dashboard for landscape tablets and desktop PCs to manage salon stations, monitor the waiting queue, register walk-ins, and handle exceptions.
- **Layout:**
  - **Top Action Bar:** Real-time queue count, waiting metrics, and primary *"Add Walk-In"* button.
  - **Station Overview Grid:** Cards for every salon barber station showing Station #, barber name, status badge (`Available`, `In Chair`, `On Break`, `Off Duty`), active customer token, service timer, break toggle, and a *"Call Next Client"* button.
  - **Waiting Queue Table:** Chronological table (FCFS) displaying Position, Token, Customer Name, Phone, Services, Preferred Barber, Wait Duration, Entry Type (`Online` vs `Walk-in`), and action buttons (*"Cancel"*).
- **Actions:**
  - Click *"Add Walk-In"* → opens modal to record customer name, phone, services, and barber preference; appends entry to the tail of the queue.
  - Click *"Call Next Client"* → assigns the earliest eligible customer to the station, transitions entry to `CALLED`, sets barber to `BUSY`, and triggers TV announcement.
  - Click *"Take Break"* / *"End Break"* → updates barber status between `AVAILABLE` and `ON_BREAK`.
  - Click *"Finish Service & Free Chair"* → completes active service, transitions entry to `DONE`, and frees the station.
  - Click *"Mark No-Show"* → marks a called client absent, transitions entry to `NO_SHOW`, and releases station.
  - Click *"Cancel"* on a waiting client → opens confirmation dialog and removes them from the queue.
- **Responsive Behavior:** Tailored for 10-inch+ landscape tablets and desktop displays; table scrolls horizontally on narrow tablets with sticky action columns.
- **Empty & Error States:**
  - **Empty Queue:** Waiting table displays polished empty card: *"Queue is Clear. No clients are currently waiting. Walk-in visitors can be registered using the 'Add Walk-In' button above."*
  - **Barber On Break / Off Duty:** The *"Call Next Client"* button is explicitly disabled (`disabled={true}`) with label *"Station On Break"* or *"Station Off Duty"*. Calling is blocked.
  - **Long Wait Warning:** Clients waiting >60 minutes are highlighted with a terracotta border, warning icon, and `>60m Wait` badge.

---

## 5. Barber Station Terminal (`/barber/:name`)

- **Purpose:** Mirror-mounted mobile interface for individual barbers to manage their station, track cutting timers, start/complete services, toggle breaks, and see who is next.
- **Layout:**
  - **Station Header:** Barber name, station number, and quick dropdown selector to switch between barbers (e.g. Arjun, Rohan, Vikram, Dev).
  - **Availability Bar:** Duty status toggle between *"Available"* and *"On Break"*.
  - **Active Client Section:** When serving, shows token, customer name, phone number, requested service checklist, and a live MM:SS elapsed service stopwatch compared against estimated duration.
  - **Action Controls:**
    - *"Start Service"* (transitions `CALLED` → `IN_CHAIR`).
    - *"Service Completed · Done"* (transitions `IN_CHAIR` → `DONE` and clears chair).
  - **Next Up in Line Card:** Live preview of the next customer eligible for this barber's station with wait duration and preference note.
- **Actions:**
  - Toggle break status (`Available` ↔ `On Break`).
  - Switch active barber profile from dropdown.
  - Call next customer when station is open.
  - Start service timer and complete service.
- **Responsive Behavior:** 100% mobile-optimized layout designed for quick single-tap operation on smartphone screens mounted by the station mirror.
- **Empty & Error States:**
  - **Station Open (No Customer in Chair):** Displays clean open state: *"Station is Open. Ready to call the next waiting client in queue."*
  - **On Break / Off Duty:** If on break or off duty, Call Next button is rendered disabled with explicit label: *"Cannot Call (Barber On Break)"* or *"Cannot Call (Barber Off Duty)"*, and helper text instructs the barber to resume duty.
  - **No Clients Waiting:** Next In Line section displays: *"No clients currently waiting for your station."*

---

## 6. Waiting Area TV Display (`/display`)

- **Purpose:** Fullscreen, high-contrast digital board designed for large wall-mounted TV monitors in the waiting lounge, visible from 3 to 10 metres away.
- **Layout:**
  - **Top Header:** Salon brand name, *"Live TV Display"* badge, large digital clock (with seconds precision), current date, and a fullscreen toggle button.
  - **Call Announcement Banner (Dynamic):** High-contrast pulsing terracotta banner displayed whenever a customer is called: *"NOW CALLING: Token S-14 — [Customer Name] · Please Proceed to [Barber Name] (Station [X])"*.
  - **Left Column (Barber Stations):** 2x2 grid of station cards displaying station number, barber name, status (`Ready`, `Serving`, `Break`), and seated customer token.
  - **Right Column (Top 5 Upcoming):** Large ordered list of the next 5 tokens in line with position numbers (`#1`, `#2`, etc.), token badges, customer names, called badges, and estimated wait minutes.
  - **Bottom Ticker:** Operational notice instructing customers to watch the screen and proceed when called, plus current closing time and online queue status.
- **Actions:**
  - Click fullscreen icon → toggles browser fullscreen mode (`requestFullscreen`).
- **Responsive Behavior:** Built to fill `100vw` and `100vh` on 1080p and 4K displays; hides navigation bar and footer for an authentic kiosk/TV experience.
- **Empty & Error States:**
  - **Empty Queue:** Upcoming section displays polished dark card: *"Queue is clear. No customers waiting."*
  - **Available Stations:** Station cards display *"Ready for next client"* with green Ready pills.

---

## 7. Owner Settings & Analytics (`/admin`)

- **Purpose:** Operational control panel and daily analytics console for the salon owner.
- **Layout:**
  - **Header:** Console title, date indicator, and *"Reset to Defaults"* button.
  - **Daily Metrics Grid:** 4 performance KPI cards:
    - Total Clients Served
    - Average Wait Time (minutes)
    - No-Shows Recorded
    - Estimated Daily Revenue in ₹ INR (calculated from completed services)
  - **Queue Operating Controls:** Toggles for Online Queue acceptance, Salon Open/Closed status, and an adjustable Closing Time selector (e.g. 21:00).
  - **Barber Roster Management:** Roster list allowing owner to toggle individual barbers On/Off Duty, switch status (`Available`, `In Chair`, `On Break`), and add new barbers.
  - **Services Catalog Management:** Full catalog manager to edit service names, durations, prices in ₹, active status toggles, and an *"Add New Service"* modal.
- **Actions:**
  - Toggle online queue on/off.
  - Adjust salon operating hours.
  - Toggle barber on/off duty status.
  - Add/edit services and pricing.
  - Reset state to clean defaults (clears local storage, restores bundled barbers and services, empties queue).
- **Responsive Behavior:** Adapts from single-column on mobile to multi-column analytical dashboard on desktop.
- **Empty & Error States:**
  - **Clean Start:** If no services have been completed today, analytics show `0 clients`, `~0m avg wait`, `0 no-shows`, and `₹0 estimated revenue`.
  - **Service Form Validation:** Enforces positive duration and pricing values before adding a service.
