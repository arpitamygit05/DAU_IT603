# 01-brief.md — Product Brief & Scope

## 1. Product Goal
Create a modern salon queue website that enables clients to join a live digital queue from their phones, monitor their exact position and dynamic estimated wait time, and receive an alert when their chair is ready. The system simultaneously empowers receptionists with landscape tablet visibility, barbers with station-focused mobile controls, salon visitors with an ultra-readable waiting area TV display, and salon owners with service, duty, and analytics controls.

---

## 2. Target Users

1. **Salon Customer**:
   - Accesses `/` and `/join` on mobile or desktop.
   - Enters 10-digit mobile number, picks 1 to 3 services, and optionally chooses their preferred barber.
   - Tracks live status at `/status/:id`, receiving real-time alerts when 2nd in line and when called.

2. **Receptionist**:
   - Operates `/reception` on a landscape tablet or desktop desk.
   - Monitors live station utilization, handles walk-in registrations (appended to end of queue), calls clients, and manages no-shows or cancellations.

3. **Barber**:
   - Operates `/barber/:name` on a mobile phone mounted near the barber station mirror.
   - Views current client details, triggers elapsed service timers, marks services complete, switches availability (Available ↔ On Break), and previews the next in-line client.

4. **Waiting Area Visitors**:
   - Views `/display` on a large wall-mounted TV monitor.
   - High-contrast visual board showing which token is in which chair and which 5 tokens are up next.

5. **Salon Owner / Manager**:
   - Accesses `/admin` to adjust opening hours, toggle online queue acceptance, manage barbers on duty, edit prices/durations, and review daily stats (revenue, wait times, no-shows).

---

## 3. Must-Have Scope

- Clean typographic branding: "Aura Grooming Lounge".
- Complete 7-screen implementation (`/`, `/join`, `/status/:id`, `/reception`, `/barber/:name`, `/display`, `/admin`).
- Centralized queue business engine with rigorous barber preference matching and FCFS ordering.
- Reactive cross-tab multi-screen synchronization using `BroadcastChannel` and `localStorage`.
- Phone validation (10 digits) with duplicate active spot prevention.
- Visual alerts:
  - 2nd position alert: *"Start coming to the salon"*.
  - Called alert: *"It's your turn"* with station assignment.
  - Waiting > 60m alert on reception dashboard.
  - Waiting area TV visual pulse banner when a client is called.
- Fully responsive styling matching the Sage Green (`#52675A`, `#829581`, `#E7ECE5`) & Warm Beige (`#F4EFE5`, `#FBF9F4`) palette.
- Strict exclusion of plant/leaf patterns and icons.
- Indian Rupee (`₹`) pricing and realistic demo services.

---

## 4. Explicit Exclusions (Non-Goals)

To maintain focus, reliability, and zero external dependency risk during demo operations, the following are intentionally excluded:
- Online payment gateways (payment occurs in person at the salon).
- Future calendar date appointment scheduling (this is a live walk-in/queue system).
- Paid SMS/WhatsApp automated gateway integration (status URLs are instant and bookmarkable).
- Loyalty point systems.
- Multi-branch or franchise management.
- Multilingual translation toggles (interface is in unified English).
