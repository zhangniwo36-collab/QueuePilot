# Operations and review guide

## Five-minute product review

1. Search for `invoice`, then clear the search.
2. Filter priority to `urgent` and inspect the SLA label.
3. Open a ticket, assign an owner, and move it to pending or resolved.
4. Add a demo reply and confirm the activity trail updates.
5. Create a new ticket containing `cannot login` and observe deterministic Access/urgent triage.
6. Export CSV, refresh to verify local persistence, then Reset demo.

## Quality gate

`npm run check` runs ESLint, strict TypeScript, a production build, logic tests, and rendered-product tests.

## Deliberate limits

The demo does not claim live helpdesk integration, real SLA performance, customer adoption, or AI-generated support. These limits keep every public interaction complete and truthful without credentials.
