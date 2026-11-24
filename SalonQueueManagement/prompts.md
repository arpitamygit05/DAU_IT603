# prompts.md — Generation Prompt History & Refinement Recipes

## 1. Primary Build Prompt

This entire application was generated from one comprehensive, end-to-end prompt:

```text
Build a complete, polished Salon Queue Management System website in this project folder. Treat this as one end-to-end build: inspect the project, understand the requirements, plan the work internally, implement every screen and feature, run the app, and fix issues you discover before finishing. Do not stop after a plan, mockup, or empty pages. Complete the website in this one task; do not ask me to approve each screen or feature separately.

My goal is to have the completed project saved in my existing GitHub repository, deployed as a publicly accessible working website, and listed at the top of the repository’s root README.md.

[Detailed functional requirements for Home, Join Queue, My Status, Reception Dashboard, Barber View, Waiting Area Display, and Owner Settings, with Sage Green & Warm Beige color palette, Indian Rupee pricing, strict barber preference dispatching, 30-min online queue cutoff, multi-tab sync, and phone duplicate prevention.]
```

---

## 2. Optional Future Refinement Prompt Recipes

For future enhancements or specialized extensions to this application, here are recommended prompt recipes:

### Recipe A: Sound / Voice Announcements on Waiting Area Display
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
