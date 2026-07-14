# Security and privacy

QueuePilot is a local-first portfolio demo. It contains no authentication, server database, email delivery, API key, analytics tracker, or external customer-support integration.

- Seed records use fictional `.test` email addresses.
- User changes are stored only in browser localStorage and can be cleared with Reset demo.
- CSV export is generated in the browser from the currently filtered records.
- Ticket creation uses deterministic keyword rules; it is not represented as AI.
- Text is rendered through React rather than injected HTML.

Production use would require authenticated workspaces, authorization, encrypted durable storage, retention controls, audit-log integrity, rate limits, and real integration threat modeling.
