# QueuePilot specification

## Objective
Build a public, zero-setup customer-support operations console for small SaaS teams. A reviewer can triage seeded tickets, filter the queue, assign owners, change status, add replies, inspect SLA risk, export CSV, and reset the demo without an account or API key.

## Stack and commands
- Next.js/Vinext, React, TypeScript, browser localStorage, Cloudflare Sites.
- Develop: `npm run dev`
- Verify: `npm run check`
- Build: `npm run build`

## Structure
- `app/components`: interactive support workspace
- `app/lib`: ticket model, deterministic triage, metrics, CSV
- `tests`: logic and rendered-product tests
- `docs`: product, security, and operating decisions

## Testing
Node tests cover triage, filters, metrics, updates, and export. Rendered HTML tests prove the product replaces starter content and exposes the critical workflow.

## Boundaries
- Always: accessible controls, realistic fictional data, deterministic behavior, clear local persistence, tests before commits.
- Ask first: paid services, authentication, external integrations, durable server storage.
- Never: secrets, invented customers, fake AI claims, real support messages.

## Success criteria
- Public visitors can complete the full workflow with seeded data.
- Queue filters, ticket selection, assignment, status, reply activity, reset, and CSV export work locally.
- Responsive at mobile and desktop sizes; no API key required.
- Lint, typecheck, build, and tests pass; repository and live deployment are public-ready.

## Not doing
Real email delivery, Zendesk/Intercom sync, multi-tenant authentication, paid AI, or fabricated business outcomes.
