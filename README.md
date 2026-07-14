# QueuePilot

**Live demo:** https://queuepilot-ops.hugs-poise-9.chatgpt.site

QueuePilot is a working customer-support operations console for small SaaS teams. It turns a fictional inbound queue into an interactive workflow for triage, ownership, SLA review, replies, and reporting — without accounts, API keys, or paid services.

## What reviewers can do

- Search and filter eight realistic support tickets.
- Inspect deterministic category, priority, and SLA states.
- Assign owners and change status or priority.
- Add local demo replies with a visible audit trail.
- Create a ticket and observe transparent rule-based triage.
- Export the current queue to CSV and reset the demo.
- Refresh the page without losing browser-local work.

All names, messages, metrics, and email addresses are fictional. Replies are never sent and no ticket content leaves the browser.

## Engineering evidence

- Typed ticket contract and immutable update functions.
- Deterministic classification and SLA rules with no AI claims.
- Browser-only persistence with safe seeded fallback data.
- Accessible labels, keyboard controls, empty states, and responsive layouts.
- Unit and rendered-product tests plus lint, type checking, and production builds.

## Run and verify

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
npm run check
```

See `docs/spec.md`, `docs/security.md`, and `docs/operations.md` for scope, trust boundaries, and review guidance.
