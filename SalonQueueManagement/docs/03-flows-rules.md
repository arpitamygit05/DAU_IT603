# 03-flows-rules.md — Queue Business Rules, State Transitions & Verification Checklist

This document formalizes the operational flows, lifecycle state machine, barber assignment rules, mathematical formulas, and the comprehensive verification test checklist enforced by `src/services/queueLogic.ts`.

---

## 1. Customer & Walk-In Flows

### A. Online Customer Flow
1. Customer visits the website home page (`/`) on their mobile device or desktop.
2. Checks live salon operating hours, current queue length, and barber availability.
3. Clicks **"Join Queue"** (`/join`).
4. Enters full name and a valid 10-digit Indian phone number.
5. Selects between 1 and 3 active services (e.g. Classic Precision Haircut + Royal Beard Sculpting).
6. Selects barber preference: **"Any Available Barber (Fastest)"** or a specific on-duty barber.
7. Submits the form:
   - System verifies the online queue cutoff (online joining closes 30 minutes before closing time).
   - System verifies the phone number does not already hold an active spot.
   - Generates a sequential token (e.g. `S-14`).
   - Saves entry with status `WAITING` in browser `localStorage`.
   - Broadcasts the update across open tabs via `BroadcastChannel`.
8. Customer is redirected to their live ticket (`/status/:id`).
9. As earlier customers are served:
   - When reaching position #2, a high-visibility amber proximity warning advises them to head to the salon.
   - When the barber calls their token, the screen updates to `CALLED` with a summon card directing them to the specific station.
10. Customer arrives, takes the chair (`IN_CHAIR`), receives service, and transitions to `DONE`.

### B. Reception Walk-In Flow
1. Customer walks into the salon without prior online registration.
2. Receptionist opens the **Reception Dashboard** (`/reception`) on the desk tablet.
3. Clicks **"Add Walk-In"** button.
4. Enters walk-in customer's name, phone number, selects services, and preferred barber.
5. Submitting creates a `WAITING` entry marked `isWalkIn: true`, appending it strictly to the tail of the shared queue.
6. Walk-ins are assigned tokens with the same sequential numbering and treated with identical FCFS priority.
7. Walk-in registrations continue to be accepted until official salon closing time, even after the 30-minute online cutoff has passed.

---

## 2. Ticket Status Lifecycle & Allowed Transitions

Queue entries progress through a deterministic, one-way state machine:

```mermaid
stateDiagram-v2
    [*] --> WAITING: Customer Joins (Online or Walk-in)
    WAITING --> CALLED: Barber / Receptionist calls customer
    WAITING --> CANCELLED: Customer or Receptionist cancels
    CALLED --> IN_CHAIR: Customer seated & service begins
    CALLED --> NO_SHOW: Customer absent within 10 minutes
    IN_CHAIR --> DONE: Service completed
    DONE --> [*]
    CANCELLED --> [*]
    NO_SHOW --> [*]
```

### State Definitions & Permissions:
- `WAITING`: Customer is active in line.
  - *Allowed Transitions:* `CALLED`, `CANCELLED`.
  - *Actions:* Customer may cancel spot from `/status/:id`; Reception may cancel from `/reception`.
- `CALLED`: Station chair is ready; customer has been summoned to station.
  - *Allowed Transitions:* `IN_CHAIR`, `NO_SHOW`.
  - *Actions:* Barber or Reception clicks *"Start Service"* → transitions to `IN_CHAIR`; Reception clicks *"Mark No-Show"* if absent within 10 minutes → transitions to `NO_SHOW`.
- `IN_CHAIR`: Customer is actively being groomed in the barber's chair.
  - *Allowed Transitions:* `DONE`.
  - *Actions:* Barber or Reception clicks *"Service Completed · Done"* → transitions to `DONE`, records duration, and releases the station.
- `DONE` (Terminal): Service concluded successfully. Station becomes immediately available for the next client.
- `CANCELLED` (Terminal): Client cancelled before service began.
- `NO_SHOW` (Terminal): Client called but failed to appear. Station is released immediately.

> [!IMPORTANT]
> **Terminal State Invariance:** Once an entry reaches `DONE`, `CANCELLED`, or `NO_SHOW`, it can **never** re-enter an active state. Rejoining requires creating a completely new queue entry at the tail of the line.

---

## 3. Barber Assignment & Matching Rules

1. **Strict Barber Exclusivity:**
   - If a customer selects a specific barber (e.g. *Arjun Sharma*), they **must never** be assigned to a different barber under any circumstances.
   - If a customer selects `"ANY"` barber, they are eligible for the first barber who becomes free.
2. **First-Come, First-Served (FCFS) Ordering:**
   - When Barber $B$ calls the next customer, the queue engine queries waiting customers ordered by `joinedAt` ascending.
   - It dispatches the earliest customer who either requested Barber $B$ specifically or requested `"ANY"`.
3. **Single Active Seat Constraint:**
   - A barber station can only have **one** active customer in chair or called at any given time.
4. **On-Break & Off-Duty Guard:**
   - A barber who is `ON_BREAK` or off duty (`onDuty: false`) must **never** be able to call the next customer.
   - UI buttons must be explicitly disabled (with explanatory label e.g. *"Station On Break"*, *"Station Off Duty"*).
   - Underlying actions (`canBarberCallNext()` in `queueLogic.ts` and `callNext()` in `QueueContext.tsx`) strictly reject the call.
5. **Break Waiting Integrity:**
   - If a customer requested a specific barber who is currently on break, the customer remains waiting at their priority position. The customer is informed of the break and is never silently reassigned.

---

## 4. Dynamic Wait Time Formulas

Wait times are recalculated reactively based on queue state and active on-duty capacity:

### Formula A: Specific Barber Preference ($B$)
$$\text{Estimated Wait} = \text{Remaining Chair Time}(B) + \sum_{i \in \text{Waiting Ahead}_B} \text{Duration}(i)$$
- $\text{Remaining Chair Time}(B)$: Estimated service duration of client currently in $B$'s chair minus elapsed minutes (minimum 5 mins).
- $\text{Waiting Ahead}_B$: All waiting customers ahead of this ticket who chose Barber $B$ or chose `"ANY"` and may be taken by $B$.

### Formula B: Any Barber Preference (`ANY`)
$$\text{Estimated Wait} = \left\lceil \frac{\text{Total Unfinished Work of Customers Ahead} + \sum \text{Remaining Chair Times}}{\text{Active On-Duty Barbers (Excluding Breaks)}} \right\rceil$$
- Work is evenly distributed across all active working stations (barbers who are on duty and not on break). Minimum wait returned is 5 minutes.

---

## 5. Cutoff, Duplicate, and Cancellation Rules

1. **Online Queue Cutoff (30 Minutes Before Closing):**
   - Online queue joining automatically shuts down exactly 30 minutes before `settings.closeTime`.
   - Walk-in registrations at the reception desk remain available until official closing time.
2. **Duplicate Active Spot Prevention:**
   - A mobile phone number may only hold **one active token** (`WAITING`, `CALLED`, or `IN_CHAIR`) at a time.
   - Attempting to submit a new entry with an active phone number returns the existing ticket details with a direct link.
   - Once a ticket transitions to a terminal state (`DONE`, `CANCELLED`, or `NO_SHOW`), that phone number is immediately freed to rejoin.
3. **Cancellation & No-Show Station Release:**
   - Cancellation is permitted while in `WAITING` status.
   - No-Show marking is permitted while in `CALLED` status.
   - Both actions immediately release station reservations and recompute queue estimates.

---

## 6. Verification Test Checklist

The project includes automated verification tests (`test-queue-rules.ts`) and verified manual test scenarios. The 10 core verification checks are:

- [x] **Check 1: Strict FCFS Queue Ordering** — Early arrivals are always dispatched ahead of later arrivals when both are eligible for the station.
- [x] **Check 2: Barber Preference Exclusivity** — A customer requesting Barber $B_2$ is never assigned to Barber $B_1$, even if $B_1$ becomes available first.
- [x] **Check 3: Dedicated Barber Queueing** — A customer requesting a specific barber is correctly matched when that specific barber calls next.
- [x] **Check 4: Barber Break & Off-Duty Calling Prohibition** — A barber marked `ON_BREAK` or `onDuty: false` cannot call next customers; both UI buttons and action handlers enforce this constraint.
- [x] **Check 5: Single Active Spot Phone Enforcement** — Submitting an already active phone number blocks duplicate registration; once completed or cancelled, the phone is allowed to register anew.
- [x] **Check 6: 30-Minute Online Cutoff Before Closing** — Online queue registration shuts down within 30 minutes of closing; walk-ins remain accepted.
- [x] **Check 7: Dynamic Queue Positioning & Proximity Notice** — Customer position reflects exact queue index; triggers proximity alert at position #2.
- [x] **Check 8: Multi-Service Duration & Price Calculations** — Selecting 1 to 3 services accurately tallies combined duration in minutes and price in ₹ INR.
- [x] **Check 9: Terminal State Invariance** — Completed (`DONE`), cancelled, or no-show entries cannot re-enter active status.
- [x] **Check 10: Empty State Cleanliness** — Application starts with an empty queue without seeded dummy customer names, while preserving bundled barbers, services, and real user entries.
