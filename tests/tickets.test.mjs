import assert from "node:assert/strict";
import test from "node:test";

import {
  addReply,
  classifyTicket,
  createSeedTickets,
  filterTickets,
  getQueueMetrics,
  getSlaState,
  seedTickets,
  ticketsToCsv,
  updateTicket,
} from "../app/lib/tickets.ts";

test("classifies common support requests with deterministic rules", () => {
  assert.deepEqual(classifyTicket("We were charged twice on our invoice"), { category: "Billing", priority: "high" });
  assert.deepEqual(classifyTicket("Cannot login after resetting my password"), { category: "Access", priority: "urgent" });
  assert.deepEqual(classifyTicket("Could you add a dark mode?"), { category: "Feature request", priority: "low" });
  assert.deepEqual(classifyTicket("无法登录，生产环境已被阻塞"), { category: "Access", priority: "urgent" });
  assert.deepEqual(classifyTicket("六月账单重复扣款，请退款"), { category: "Billing", priority: "high" });
});

test("filters the seeded queue by query, status, priority, and assignee", () => {
  assert.ok(seedTickets.length >= 8);
  assert.equal(filterTickets(seedTickets, { query: "duplicate invoice", status: "all", priority: "all", assignee: "all" }).length, 1);
  assert.equal(filterTickets(seedTickets, { query: "无法访问数据分析工作区", status: "all", priority: "all", assignee: "all" }).length, 1);
  assert.ok(filterTickets(seedTickets, { query: "", status: "open", priority: "urgent", assignee: "all" }).length >= 1);
  assert.ok(filterTickets(seedTickets, { query: "", status: "all", priority: "all", assignee: "Maya Chen" }).every((ticket) => ticket.assignee === "Maya Chen"));
});

test("keeps seeded SLA states useful relative to the current review time", () => {
  const now = "2030-04-10T12:00:00.000Z";
  const tickets = createSeedTickets(now);
  const metrics = getQueueMetrics(tickets, now);

  assert.equal(metrics.atRisk, 2);
  assert.ok(tickets.every((ticket) => Date.parse(ticket.createdAt) <= Date.parse(now)));
});

test("computes SLA state and queue metrics from ticket outcomes", () => {
  const now = "2026-07-14T12:00:00.000Z";
  const tickets = createSeedTickets(now);
  assert.equal(getSlaState({ ...tickets[0], status: "open", slaDueAt: "2026-07-14T11:00:00.000Z" }, now), "breached");
  assert.equal(getSlaState({ ...tickets[0], status: "open", slaDueAt: "2026-07-14T13:00:00.000Z" }, now), "due-soon");
  assert.equal(getSlaState({ ...tickets[0], status: "resolved" }, now), "resolved");

  const metrics = getQueueMetrics(tickets, now);
  assert.equal(metrics.total, tickets.length);
  assert.equal(metrics.open + metrics.pending + metrics.resolved, metrics.total);
  assert.ok(metrics.atRisk >= 1);
});

test("records assignment, status changes, and replies in an audit trail", () => {
  const assigned = updateTicket(seedTickets[0], { assignee: "Jon Bell", status: "pending" }, "2026-07-14T12:00:00.000Z");
  assert.equal(assigned.assignee, "Jon Bell");
  assert.equal(assigned.status, "pending");
  assert.match(assigned.activity.at(-1).body, /Jon Bell/);

  const replied = addReply(assigned, "Thanks — we are checking this now.", "Jon Bell", "2026-07-14T12:05:00.000Z");
  assert.equal(replied.activity.at(-1).type, "reply");
  assert.equal(replied.activity.at(-1).body, "Thanks — we are checking this now.");
});

test("exports a safe CSV with quoted customer content", () => {
  const csv = ticketsToCsv([{ ...seedTickets[0], subject: "Billing, refund request" }]);
  assert.match(csv, /^id,subject,customer,status,priority,category,assignee,sla_due_at/m);
  assert.match(csv, /"Billing, refund request"/);
});
