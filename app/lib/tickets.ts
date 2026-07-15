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

const SEED_REFERENCE_TIME = Date.parse("2026-07-14T12:00:00.000Z");

function shiftSeedTime(value: string, now: number) {
  return new Date(now + Date.parse(value) - SEED_REFERENCE_TIME).toISOString();
}

export function createSeedTickets(now: string | Date = new Date()): Ticket[] {
  const nowTime = typeof now === "string" ? Date.parse(now) : now.getTime();
  return baseTickets.map((ticket) => {
    const createdAt = shiftSeedTime(ticket.createdAt, nowTime);
    return {
      ...ticket,
      createdAt,
      slaDueAt: shiftSeedTime(ticket.slaDueAt, nowTime),
      activity: [{ id: `${ticket.id}-1`, type: "message", body: ticket.message, author: ticket.customer, at: createdAt }],
    };
  });
}

export const seedTickets = createSeedTickets();

export const ticketTranslationsZh: Record<string, { subject: string; message: string }> = {
  "QP-1048": { subject: "无法访问数据分析工作区", message: "SSO 证书更新后，我们的运营团队无法登录。今天的报告评审前必须恢复访问。" },
  "QP-1047": { subject: "六月账单被重复扣款", message: "银行卡上出现了两笔六月账单扣款，请确认退款流程和预计到账时间。" },
  "QP-1046": { subject: "CSV 导入到 82% 时停止", message: "包含 4,200 行客户数据的 CSV 每次都会在 82% 停止，但较小的文件可以成功导入。" },
  "QP-1045": { subject: "增加每周摘要定时发送", message: "管理员能否设置每周一早晨发送摘要？如果支持时区选择，会更适合分布式团队。" },
  "QP-1044": { subject: "需要帮助邀请第一批团队成员", message: "我们已经完成设置，但不确定财务和运营团队成员应该选择哪些角色。" },
  "QP-1043": { subject: "移动端导航遮挡保存按钮", message: "在 iPhone 15 横屏编辑报告时，底部导航会遮挡保存按钮。" },
  "QP-1042": { subject: "税号已经成功更新", message: "感谢更新账户税号，现在已经可以看到修正后的发票。" },
  "QP-1041": { subject: "Webhook 推送延迟", message: "生产环境的 Webhook 事件大约延迟二十分钟，导致履约自动化流程受阻。" },
};

export function classifyTicket(text: string): { category: TicketCategory; priority: TicketPriority } {
  const value = text.toLowerCase();
  const category: TicketCategory = /invoice|billing|refund|charged|账单|发票|扣款|退款|收费/.test(value) ? "Billing"
    : /login|password|access|sso|登录|密码|访问|权限|单点登录/.test(value) ? "Access"
    : /bug|error|broken|stops|overlap|delay|故障|错误|失败|停止|遮挡|延迟|异常|崩溃/.test(value) ? "Bug"
    : /feature|could you add|request|dark mode|功能|建议|希望增加|新增/.test(value) ? "Feature request"
    : /setup|onboard|invite|first team|设置|入门|邀请|团队成员/.test(value) ? "Onboarding" : "General";
  const priority: TicketPriority = /cannot login|outage|security|production.*block|blocked|无法登录|宕机|安全|生产环境.*(?:阻塞|无法)|被阻塞|紧急/.test(value) ? "urgent"
    : /charged twice|duplicate.*charge|refund|consistently stops|重复.*(?:扣款|收费)|退款|总是.*停止|反复失败/.test(value) ? "high"
    : category === "Feature request" ? "low" : "normal";
  return { category, priority };
}

export function filterTickets(tickets: Ticket[], filters: QueueFilters): Ticket[] {
  const query = filters.query.trim().toLowerCase();
  return tickets.filter((ticket) => {
    const translated = ticketTranslationsZh[ticket.id];
    const searchable = [ticket.id, ticket.subject, ticket.customer, ticket.email, ticket.message, translated?.subject, translated?.message, ...ticket.tags].filter(Boolean).join(" ").toLowerCase();
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
