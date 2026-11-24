# The Style Atelier — Salon Queue Management Application

This directory contains the front-end application source code for **The Style Atelier** Salon Queue Management System, built with React 19, TypeScript, Vite, and Tailwind CSS.

- **Main Repository README:** See `../README.md` for project overview, live deployment URL, and complete documentation links.
- **Agent & Developer Guidelines:** See [AGENTS.md](AGENTS.md) for architectural invariants and engineering instructions.
- **Product Specifications & Business Logic:** See [docs/](docs/) for:
  - [01-brief.md](docs/01-brief.md) — Problem statement, target users, features, exclusions, and look-and-feel.
  - [02-screens.md](docs/02-screens.md) — Screen specifications, layout structure, actions, and empty/error states.
  - [03-flows-rules.md](docs/03-flows-rules.md) — State transitions, barber matching rules, wait time formulas, and verification test checklist.
  - [prompts.md](prompts.md) — Chronological prompt history and refinement recipes.

### Quick Start
```bash
# Install dependencies
pnpm install

# Start local development server (http://localhost:5173)
pnpm run dev

# Run automated queue business logic test suite
pnpm run test:rules

# Run production build
pnpm run build
```
