# 404 Museum Project Context

## Project Purpose

404 Museum is a browser-based generative artwork.

Every page refresh reveals a fake abandoned website from an alternate internet timeline. Each generated website should feel like something that genuinely could have existed.

Examples:

- A failed European airline homepage from 1997
- A forgotten cult operating system vendor from 2001
- A fictional German media startup from 2014
- A dead MMORPG guild fan page from 2006

The user should feel curiosity first, then slowly realize the site never existed.

The experience must be highly shareable.

## Product Principles

1. Every generated site must feel plausible.
2. The joke should be subtle, not cartoonish.
3. Seeds must reproduce identical output.
4. No backend required for v1.
5. Fast first load.
6. Works well on mobile and desktop.
7. Controls must match prior cr0ss.org projects.

## Tech Stack

- Language: TypeScript
- Build Tool: Vite
- UI: Vanilla DOM or lightweight component structure
- Styling: CSS Modules or plain CSS
- Testing: Vitest
- E2E: Playwright
- Deployment: Static hosting (Vercel recommended)

## Architecture

- `src/domain/`
  - Types
  - Seed utilities
  - Generators
  - Dataset definitions

- `src/render/`
  - Theme rendering
  - Layout composition
  - Content section rendering

- `src/ui/`
  - Floating buttons
  - Toasts
  - Info modal

- `src/styles/`
  - Shared tokens
  - Era themes

- `tests/`
  - Snapshot tests
  - Smoke tests

## Generator Rules

- All outputs must derive from seed.
- No runtime API calls required.
- Use curated datasets plus combinators.
- Prefer believable names over funny names.
- Avoid obvious parody brands.
- Era determines wording, layout, colors, and terminology.
- German variants should appear naturally but sparingly.

## Era Style Guidance

### 1995–1999

- Tables
- Under construction GIF energy
- Strong bevel buttons
- Basic HTML formatting

### 2000–2006

- Portal layouts
- Gradients
- Sidebars
- Visitor counters

### 2007–2013

- Glossy Web 2.0
- Rounded corners
- Download badges

### 2014–2019

- Startup minimalism
- Hero headers
- Flat UI

### Strange Alternate Timelines

- Slightly off trends
- Plausible but unfamiliar products

## Controls

Bottom-right floating controls:

1. Info button  
Explains concept briefly.

2. Refresh button  
Creates a new seed and rerenders.

3. Share button  
Copies or shares seeded URL.

## Constraints

- No React unless justified.
- No backend database.
- No paid APIs.
- Keep bundle small.
- Avoid heavy image assets.
- Prefer CSS-generated visuals.
- Keep accessibility reasonable.
- No console errors in dev or prod.

## Testing Requirements

Run before completing tickets:

- `npm run lint`
- `npm run typecheck`
- `npm run test`

When browser flows exist:

- `npm run test:e2e`

## Definition of Quality

If a stranger sees a screenshot, they should briefly believe the website once existed.