# prompts.md — Chronological Record of Prompts & Refinement Recipes

This document provides a chronological record of the prompts used to generate, refine, test, and prepare **The Style Atelier** Salon Queue Management System.

---

## 1. Chronological Prompt History

### Prompt 1: Initial Build & Architecture (Paraphrased Summary)
*Timestamp: 2026-11-24T14:40:00Z*  
*Type: End-to-End Build Request*

```text
Build a complete, polished Salon Queue Management System website in this project folder. Treat this as one end-to-end build: inspect the project, understand the requirements, plan the work internally, implement every screen and feature, run the app, and fix issues you discover before finishing. Do not stop after a plan, mockup, or empty pages. Complete the website in this one task; do not ask me to approve each screen or feature separately.

My goal is to have the completed project saved in my existing GitHub repository, deployed as a publicly accessible working website, and listed at the top of the repository’s root README.md.

[Detailed functional requirements for Home, Join Queue, My Status, Reception Dashboard, Barber View, Waiting Area Display, and Owner Settings, with Sage Green & Warm Beige color palette, Indian Rupee pricing, strict barber preference dispatching, 30-min online queue cutoff, multi-tab sync, and phone duplicate prevention.]
```

*Outcome:*  
Scaffolded React 19 + TypeScript + Vite + Tailwind CSS project with all 7 core routes, `QueueContext` with `BroadcastChannel` synchronization, initial bundled services and barbers, and basic documentation.

---

### Prompt 2: Polish, Queue Rules Enforcement & Submission Preparation (Verbatim)
*Timestamp: 2026-11-24T20:23:57+05:30 (2026-11-24T14:53:57Z)*  
*Type: Polish & Submission Task (Recorded from Antigravity conversation history)*

```text
Work in the existing salon project inside `SalonQueueManagement`. Finish and polish the website and its submission files. Do not delete unrelated coursework files or create a database.

## Website

- Keep the salon name **The Style Atelier**, the sage-green and beige design, and English-only text.
- Remove visible “Demo” and “Sample” labels from the website, browser title, headers, footers, buttons, and page content.
- Remove the invented salon address and business contact number. Do not replace them with made-up details. Keep the customer phone-number field in the Join Queue form because it is needed for queue registration.
- Do not show fake customer names or phone numbers as people currently waiting. Start with an empty queue and show a polished empty state. Keep the services, barbers, prices, and salon settings bundled in the app so they still appear without a database.
- If the browser already has old built-in sample queue entries saved, remove only those known seeded entries. Preserve any other saved user-created entries.
- Keep the app self-contained: no database, backend, environment variables, paid service, or external API. Save changes in the current browser and state this limitation briefly in the documentation.
- Check the queue rules. A barber marked On Break or off duty must not be able to call the next customer. Make sure buttons and their underlying actions both enforce this.
- Keep all seven required screens and make sure their links and direct routes work: Home, Join Queue, Customer Status, Reception, Barber, Waiting Area Display, and Owner Settings.
- Do not add features outside the salon queue assignment, such as payments, future appointments, messaging, loyalty, or multiple branches.

## Required project files

Create or update these files in the `SalonQueueManagement` project:

1. `AGENTS.md` — concise instructions for future coding agents: project summary, stack and run command, read the docs first, design rules, and centralized queue logic.
2. `docs/01-brief.md` — problem, users, must-have features, exclusions, and look and feel.
3. `docs/02-screens.md` — purpose, layout, actions, responsive behavior, and empty/error states for each screen.
4. `docs/03-flows-rules.md` — customer and walk-in flows, statuses and allowed transitions, barber assignment, wait estimates, cancel and no-show rules, closing cutoff, and a test checklist with at least eight checks.
5. `prompts.md` — a separate, chronological record of the prompts actually used, including unsuccessful prompts. Use the real Antigravity conversation/history if available. If exact wording is unavailable, label concise summaries as paraphrased. Do not invent prompts or claim paraphrases are verbatim.

Do not put the prompt history in `README.md`.

## Submission README

Rewrite the repository’s top-level `README.md` as a clean, concise README for this salon project. Follow the guide:

- Put the project title first.
- Put the actual live link directly below the title: `https://the-style-atelier.vercel.app`
- State the hosting platform.
- Include a short About section and a concise description of the app’s features.
- If staff screens have a test login or PIN, put the real details immediately below the live link. If there is no login or PIN, say so plainly.
- Include short local setup instructions and the relevant routes if useful.
- Remove the outdated “deployment pending” message, unrelated coursework archive section, long browser-storage explanation, prompt history, and development diary.
- Do not claim cross-device synchronization, invent contact details, or include unverified test results.

Keep the Vite starter-template README inside the app folder from appearing as the project’s main README. Make it a short, project-specific note or remove it if it is unnecessary.

## Verify, commit, push, and deploy

- From the `SalonQueueManagement` folder, run `pnpm run test:rules` and `pnpm run build`. Fix failures and report only results actually observed.
- Check the site in a browser, including refreshing direct routes and trying the main customer and staff flows.
- Commit and push only the salon project changes and its submission README to the existing `origin` remote on `main`. I have authorized this. Do not force-push or include secrets.
- Let the existing Vercel project deploy the pushed changes. Verify the deployment opens at `https://the-style-atelier.vercel.app` before listing it as the live link.
- If Vercel reports a build or access error, explain the exact issue and the action needed. Do not claim deployment succeeded unless you verified the live site.

Finish with a short report of files updated, test/build results, GitHub push status, and verified live URL.
```

*Outcome:*  
Executed full audit and refinement:
- Purged seeded demo entries on load while retaining user-created entries.
- Added explicit disabled button states and underlying action guards for barbers on break or off duty across `BarberPage.tsx`, `ReceptionPage.tsx`, and `queueLogic.ts`.
- Removed all visible "Demo" / "Sample" references and renamed internal reset handlers to `resetToDefaults`.
- Replaced starter-template `README.md` in app folder with a concise project note.
- Created and updated `AGENTS.md`, `docs/01-brief.md`, `docs/02-screens.md`, `docs/03-flows-rules.md`, and this `prompts.md`.
- Rewrote root submission `README.md` with live link, platform, PIN-free access notice, and verified route directory.

---

## 2. System Execution & Retry Notes

- **API Capacity 503 Notice (Attempt 1):**  
  At step 1 of the session, the model received `API error (attempt 1): UNAVAILABLE (code 503): No capacity available for model gemini-3.8-flash-medium on the server`. The runner automatically retried at step 2 and resumed normal execution without user intervention.
- **Sandboxed Tool Execution:**  
  When executing `pnpm run test:rules` inside the local sandbox, pnpm attempted to open `AppData\Local\pnpm\config\config.yaml` located outside the workspace sandbox. Execution succeeded immediately by directly invoking the local workspace runner `./node_modules/.bin/tsx test-queue-rules.ts` and `./node_modules/.bin/vite build`.

---

## 3. Optional Future Extension Recipes

These prompt recipes are retained for future developers who may wish to extend the system with external integrations:

### Recipe A: Web Speech API Audio Chimes for Waiting Area Display
```text
Enhance the /display route with an optional audio announcement feature. Use the browser Web Speech API (speechSynthesis) to announce 'Token S-14 for Arjun Sharma at Station 1' whenever a new token enters the CALLED state. Include a prominent 'Enable Audio Chime' toggle button on the display screen so audio permissions adhere to browser autoplay policies.
```

### Recipe B: SMS / WhatsApp Webhook Notifications
```text
Add an optional notification service adapter in src/services/notifications.ts. When a customer reaches position #2 in queue or is called to a chair, trigger a webhook POST request to a configurable SMS/WhatsApp gateway endpoint (e.g. Twilio or Gupshup) with the customer's phone number and ticket link. Gracefully fallback to no-op when webhook environment variables are not configured.
```

### Recipe C: Barber Analytics & Tip Logging
```text
Extend the Barber View (/barber/:name) and Owner Settings (/admin) with tipping and individual barber daily performance metrics. Allow the barber or receptionist to record a tip amount (in INR) upon completing a service, and display each barber's total tips and average cut duration in the admin stats panel.
```
