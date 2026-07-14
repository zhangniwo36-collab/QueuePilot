export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketCategory = "Access" | "Billing" | "Bug" | "Feature request" | "Onboarding" | "General";

export type TicketActivity = {
  id: string;
  type: "message" | "note" | "reply" | "change";
  body: string;
  author: string;
  at: string;
};

export type Ticket = {
  id: string;
  subject: string;
  customer: string;
  email: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  channel: "Email" | "Chat" | "Web";
  assignee: string;
  createdAt: string;
  slaDueAt: string;
  tags: string[];
  activity: TicketActivity[];
};

export type QueueFilters = {
  query: string;
  status: TicketStatus | "all";
  priority: TicketPriority | "all";
  assignee: string | "all";
};

export const team = ["Unassigned", "Maya Chen", "Jon Bell", "Priya Shah"];

const baseTickets: Omit<Ticket, "activity">[] = [
  { id: "QP-1048", subject: "Cannot access our analytics workspace", customer: "Elena Rossi", email: "elena@example.test", message: "Our operations team cannot login after the SSO certificate update. We need access before today's reporting review.", status: "open", priority: "urgent", category: "Access", channel: "Email", assignee: "Maya Chen", createdAt: "2026-07-14T08:42:00.000Z", slaDueAt: "2026-07-14T12:42:00.000Z", tags: ["sso", "enterprise"] },
  { id: "QP-1047", subject: "Duplicate invoice charge for June", customer: "Marcus Lee", email: "marcus@example.test", message: "The June invoice appears twice on our card. Please confirm the refund process and expected timing.", status: "open", priority: "high", category: "Billing", channel: "Web", assignee: "Jon Bell", createdAt: "2026-07-14T07:18:00.000Z", slaDueAt: "2026-07-14T15:18:00.000Z", tags: ["invoice", "refund"] },
  { id: "QP-1046", subject: "CSV import stops at 82 percent", customer: "Nora Patel", email: "nora@example.test", message: "A 4,200-row customer CSV consistently stops at 82%. Smaller files complete successfully.", status: "pending", priority: "high", category: "Bug", channel: "Chat", assignee: "Priya Shah", createdAt: "2026-07-13T18:06:00.000Z", slaDueAt: "2026-07-14T10:06:00.000Z", tags: ["import", "csv"] },
  { id: "QP-1045", subject: "Add weekly digest scheduling", customer: "Theo Martin", email: "theo@example.test", message: "Could account admins schedule a weekly digest for Monday mornings? A timezone selector would help distributed teams.", status: "open", priority: "low", category: "Feature request", channel: "Web", assignee: "Unassigned", createdAt: "2026-07-13T15:34:00.000Z", slaDueAt: "2026-07-16T15:34:00.000Z", tags: ["digest", "roadmap"] },
  { id: "QP-1044", subject: "Need help inviting our first team", customer: "Aisha Brown", email: "aisha@example.test", message: "We completed setup but are unsure which roles to choose for finance and operations teammates.", status: "pending", priority: "normal", category: "Onboarding", channel: "Chat", assignee: "Maya Chen", createdAt: "2026-07-13T13:22:00.000Z", slaDueAt: "2026-07-14T17:22:00.000Z", tags: ["roles", "setup"] },
  { id: "QP-1043", subject: "Mobile navigation overlaps the save button", customer: "Daniel Kim", email: "daniel@example.test", message: "On an iPhone 15, the bottom navigation overlaps Save when editing a report in landscape mode.", status: "open", priority: "normal", category: "Bug", channel: "Email", assignee: "Priya Shah", createdAt: "2026-07-13T11:04:00.000Z", slaDueAt: "2026-07-15T11:04:00.000Z", tags: ["mobile", "ui"] },
  { id: "QP-1042", subject: "Tax ID updated successfully", customer: "Sofia Grant", email: "sofia@example.test", message: "Thanks for updating the tax ID on our account. The corrected invoice is now visible.", status: "resolved", priority: "normal", category: "Billing", channel: "Email", assignee: "Jon Bell", createdAt: "2026-07-12T16:48:00.000Z", slaDueAt: "2026-07-13T16:48:00.000Z", tags: ["invoice"] },
  { id: "QP-1041", subject: "Webhook deliveries delayed", customer: "Owen Clark", email: "owen@example.test", message: "Production webhook events are arriving roughly twenty minutes late. This blocks our fulfillment automation.", status: "resolved", priority: "urgent", category: "Bug", channel: "Web", assignee: "Priya Shah", createdAt: "2026-07-12T09:15:00.000Z", slaDueAt: "2026-07-12T13:15:00.000Z", tags: ["webhook", "automation"] },
];

export const seedTickets: Ticket[] = baseTickets.map((ticket) => ({
  ...ticket,
  activity: [{ id: `${ticket.id}-1`, type: "message", body: ticket.message, author: ticket.customer, at: ticket.createdAt }],
}));

export function classifyTicket(text: string): { category: TicketCategory; priority: TicketPriority } {
  const value = text.toLowerCase();
  const category: TicketCategory = /invoice|billing|refund|charged/.test(value) ? "Billing"
    : /login|password|access|sso/.test(value) ? "Access"
    : /bug|error|broken|stops|overlap|delay/.test(value) ? "Bug"
    : /feature|could you add|request|dark mode/.test(value) ? "Feature request"
    : /setup|onboard|invite|first team/.test(value) ? "Onboarding" : "General";
  const priority: TicketPriority = /cannot login|outage|security|production.*block|blocked/.test(value) ? "urgent"
    : /charged twice|duplicate.*charge|refund|consistently stops/.test(value) ? "high"
    : category === "Feature request" ? "low" : "normal";
  return { category, priority };
}

export function filterTickets(tickets: Ticket[], filters: QueueFilters): Ticket[] {
  const query = filters.query.trim().toLowerCase();
  return tickets.filter((ticket) => {
    const searchable = [ticket.id, ticket.subject, ticket.customer, ticket.email, ticket.message, ...ticket.tags].join(" ").toLowerCase();
    return (!query || searchable.includes(query))
      && (filters.status === "all" || ticket.status === filters.status)
      && (filters.priority === "all" || ticket.priority === filters.priority)
      && (filters.assignee === "all" || ticket.assignee === filters.assignee);
  });
}

export function getSlaState(ticket: Ticket, now = new Date().toISOString()): "breached" | "due-soon" | "on-track" | "resolved" {
  if (ticket.status === "resolved") return "resolved";
  const remaining = Date.parse(ticket.slaDueAt) - Date.parse(now);
  if (remaining <= 0) return "breached";
  return remaining <= 2 * 60 * 60 * 1000 ? "due-soon" : "on-track";
}

export function getQueueMetrics(tickets: Ticket[], now = new Date().toISOString()) {
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "open").length,
    pending: tickets.filter((ticket) => ticket.status === "pending").length,
    resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    atRisk: tickets.filter((ticket) => ["breached", "due-soon"].includes(getSlaState(ticket, now))).length,
  };
}

export function updateTicket(ticket: Ticket, patch: Partial<Pick<Ticket, "status" | "priority" | "assignee">>, at = new Date().toISOString()): Ticket {
  const changes = Object.entries(patch).filter(([key, value]) => ticket[key as keyof Ticket] !== value);
  if (!changes.length) return ticket;
  const body = changes.map(([key, value]) => `${key} → ${value}`).join(" · ");
  return { ...ticket, ...patch, activity: [...ticket.activity, { id: `${ticket.id}-${ticket.activity.length + 1}`, type: "change", body, author: "Demo operator", at }] };
}

export function addReply(ticket: Ticket, body: string, author: string, at = new Date().toISOString()): Ticket {
  const reply = body.trim();
  if (!reply) return ticket;
  return { ...ticket, status: "pending", activity: [...ticket.activity, { id: `${ticket.id}-${ticket.activity.length + 1}`, type: "reply", body: reply, author, at }] };
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function ticketsToCsv(tickets: Ticket[]) {
  const headers = ["id", "subject", "customer", "status", "priority", "category", "assignee", "sla_due_at"];
  return [headers.join(","), ...tickets.map((ticket) => [ticket.id, ticket.subject, ticket.customer, ticket.status, ticket.priority, ticket.category, ticket.assignee, ticket.slaDueAt].map(csvCell).join(","))].join("\n");
}
