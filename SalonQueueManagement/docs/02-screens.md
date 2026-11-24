# 02-screens.md — Screen Specifications & Layout Hierarchy

This document describes all 7 screens of **The Style Atelier** Salon Queue Management System, detailing layout components, user actions, and responsive breakpoints.

---

## 1. Customer Home (`/`)

- **Route:** `/`
- **Primary Audience:** Mobile clients & prospective salon visitors.
- **Key Components:**
  - **Brand Header:** Wordmark *"The Style Atelier"*.
  - **Operating Status Pill:** Real-time badge indicating whether live queue is open, current queue count, and salon closing time.
  - **Hero Section:** Value proposition, prominent *"Join the Queue Online"* call-to-action, and an integrated Token/Phone quick lookup box.
  - **Live Queue Snapshot Card:** Live counter of customers currently waiting (`#`), approximate wait time (`~X mins`), and a live status strip of on-duty barbers (Available, In Chair, On Break).
  - **Services Menu Showcase:** Catalog cards displaying service category, duration in minutes, and price in ₹ INR.
  - **Staff Quick Access Banner:** Links to Reception, Barber terminals, and TV Display.
- **Responsive Behavior:** Stacks cleanly on mobile (<640px) with minimum 44px tap targets. Desktop (>1024px) presents a two-column hero layout.

---

## 2. Join Queue (`/join`)

- **Route:** `/join`
- **Primary Audience:** Customers booking an active spot in line.
- **Key Components:**
  - **Step 1 (Personal Info):** Name input and validated 10-digit Indian mobile number input with `+91` prefix.
  - **Step 2 (Service Selection):** Interactive multi-select service list. Limits selection to 1–3 active services with duration and price breakdown.
  - **Step 3 (Barber Preference):** Option to choose *"Any Available Barber (Fastest)"* or select a specific on-duty barber. Explains break status if the selected barber is currently on break.
  - **Sticky Summary Panel:** Live reactive computation of estimated wait time, total duration, and total price in ₹.
  - **Duplicate Prevention Banner:** If the mobile number already has an active spot (`WAITING`, `CALLED`, or `IN_CHAIR`), warns the customer and offers a direct link to their existing ticket.
  - **Closed Queue Fallback:** If salon is closed or online queue cutoff (30m before close) has passed, disables online joining and invites walk-ins.
- **Responsive Behavior:** 12-column layout on desktop; single-column stacked layout on mobile with sticky bottom/sidebar ticket summary.

---

## 3. Customer Status Screen (`/status/:id`)

- **Route:** `/status/:id`
- **Primary Audience:** Customers tracking their turn while travelling or waiting nearby.
- **Key Components:**
  - **Token Headline:** Large badge (e.g., `S-14`) with live position (`#X in queue`).
  - **Progress Step Bar:** Visual stages: 1. Waiting → 2. Called → 3. In Chair → 4. Complete.
  - **2nd Position Notification:** When position equals 2, displays an alert: *"Start coming to the salon — you're almost up!"*
  - **Called Notification:** When status shifts to `CALLED`, triggers an alert card: *"It's your turn! Please proceed to Station [X] with [Barber Name]"*.
  - **Booking Details:** Selected services, duration, ₹ price, and assigned barber.
  - **Cancel Spot Action:** Opens confirmation modal to release ticket (only available while in `WAITING` state).
  - **Share / Bookmark Action:** One-tap clipboard copy of live tracking link.
- **Responsive Behavior:** Fluid card layout optimized for mobile screens.

---

## 4. Reception Dashboard (`/reception`)

- **Route:** `/reception`
- **Primary Audience:** Front-desk receptionists operating a landscape tablet or PC.
- **Key Components:**
  - **Station Grid:** Four barber cards displaying status (Available, In Chair, On Break), active customer token, service elapsed timer, and a one-click *"Call Next"* button.
  - **Waiting Queue Table:** Ordered list of all waiting customers (FCFS) showing Token, Customer Name, Phone, Services, Barber preference, and Wait Duration.
  - **High Wait Alert (>60 Mins):** Any entry waiting 60+ minutes receives a terracotta border and alert pill.
  - **Add Walk-In Modal:** Form to register walk-ins directly at the desk; walk-ins append to the end of the queue.
  - **No-Show Modal:** Allows reception to mark a called customer as No-Show if not present within 10 minutes.
  - **Cancel Modal:** Allows reception to remove a waiting customer with confirmation.
- **Responsive Behavior:** Optimized for landscape tablet view (2x2 or 4x1 grid) with horizontal table scrolling on narrower screens.

---

## 5. Barber Station Terminal (`/barber/:name`)

- **Route:** `/barber/:name` (e.g. `/barber/Arjun`)
- **Primary Audience:** Barbers at their styling stations using mobile devices.
- **Key Components:**
  - **Barber Selector:** Switch quickly between Arjun Sharma, Rohan Patel, and Vikram Joshi.
  - **Station Status Switch:** One-tap toggle between *"Available"* and *"On Break"*.
  - **Current Client Card:** Displays client name, token, and checklist of services to perform.
  - **Live Service Timer:** Large digital timer counting elapsed service time in MM:SS.
  - **Workflow Actions:**
    - *"Start Service"* (transitions `CALLED` → `IN_CHAIR`).
    - *"Service Completed · Done"* (transitions `IN_CHAIR` → `DONE` and frees station).
  - **Next Up In Line:** Live preview of the next eligible waiting client.
- **Responsive Behavior:** 100% phone-friendly layout with large touch targets (>44px).

---

## 6. Waiting Area Display (`/display`)

- **Route:** `/display`
- **Primary Audience:** Waiting room TV monitor viewed from 3 to 10 metres away.
- **Key Components:**
  - **High-Contrast Dark Aesthetic:** Deep slate/sage `#1E231E` background with crisp `#FAF6EE` typography.
  - **Top Bar:** Salon name, live digital clock (seconds precision), date, and fullscreen toggle button.
  - **Newly Called Visual Pulse Banner:** Flash card when a customer is called: *"NOW CALLING: Token S-14 (Aarav) → Station 2 (Rohan Patel)"*.
  - **Left Column:** Live status of each barber station.
  - **Right Column:** Next 5 tickets in line with estimated wait times.
  - **Ticker Footer:** Operating hours, online queue status, and visitor instructions.
- **Responsive Behavior:** Fills viewport (`100vw`, `100vh`) with clean grid layout suitable for standard 1080p and 4K TV displays.

---

## 7. Owner Settings & Analytics (`/admin`)

- **Route:** `/admin`
- **Primary Audience:** Salon owner and salon manager.
- **Key Components:**
  - **Daily Analytics Dashboard:** Customers served, average wait time (minutes), no-show count, and estimated daily revenue in ₹ INR.
  - **Operating Controls:** Toggle online queue acceptance on/off, adjust closing time, and toggle salon open/closed status.
  - **Barber Roster:** Toggle barbers on/off duty, adjust availability, and add new barbers.
  - **Services Management:** Add new services, edit durations and prices, or toggle services active/inactive.
  - **Demo Data Reset:** One-click reset to restore clean demo data.
- **Responsive Behavior:** Structured dashboard cards adapting from 1 column on mobile to 4 columns on desktop.
