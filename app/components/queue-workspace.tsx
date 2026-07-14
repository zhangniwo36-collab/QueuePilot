"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { addReply, classifyTicket, filterTickets, getQueueMetrics, getSlaState, seedTickets, team, ticketsToCsv, updateTicket, type QueueFilters, type Ticket, type TicketPriority, type TicketStatus } from "../lib/tickets";

const STORAGE_KEY = "queuepilot-demo-v1";
const initialFilters: QueueFilters = { query: "", status: "all", priority: "all", assignee: "all" };

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatSla(ticket: Ticket) {
  const state = getSlaState(ticket);
  if (state === "resolved") return "Closed";
  const hours = Math.round(Math.abs(Date.parse(ticket.slaDueAt) - Date.now()) / 36e5);
  return state === "breached" ? `${hours}h overdue` : `${hours}h left`;
}

export function QueueWorkspace() {
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [filters, setFilters] = useState<QueueFilters>(initialFilters);
  const [selectedId, setSelectedId] = useState(seedTickets[0].id);
  const [reply, setReply] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) setTickets(JSON.parse(saved)); } catch { /* keep safe seed data */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }, [tickets, hydrated]);

  const visibleTickets = useMemo(() => filterTickets(tickets, filters), [tickets, filters]);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? visibleTickets[0] ?? tickets[0];
  const metrics = getQueueMetrics(tickets);

  function patchSelected(patch: Partial<Pick<Ticket, "status" | "priority" | "assignee">>) {
    setTickets((current) => current.map((ticket) => ticket.id === selected.id ? updateTicket(ticket, patch) : ticket));
  }
  function submitReply(event: FormEvent) {
    event.preventDefault();
    if (!reply.trim()) return;
    setTickets((current) => current.map((ticket) => ticket.id === selected.id ? addReply(ticket, reply, selected.assignee === "Unassigned" ? "Demo operator" : selected.assignee) : ticket));
    setReply("");
  }
  function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = String(data.get("subject") ?? "").trim();
    const customer = String(data.get("customer") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!subject || !customer || !message) return;
    const triage = classifyTicket(`${subject} ${message}`);
    const now = new Date();
    const ticket: Ticket = {
      id: `QP-${1050 + tickets.length}`, subject, customer, message, ...triage,
      email: "customer@example.test", status: "open", channel: "Web", assignee: "Unassigned",
      createdAt: now.toISOString(), slaDueAt: new Date(now.getTime() + (triage.priority === "urgent" ? 4 : 24) * 36e5).toISOString(),
      tags: [triage.category.toLowerCase().replace(" ", "-")],
      activity: [{ id: `new-${Date.now()}`, type: "message", body: message, author: customer, at: now.toISOString() }],
    };
    setTickets((current) => [ticket, ...current]); setSelectedId(ticket.id); setIsCreateOpen(false); event.currentTarget.reset();
  }
  function exportQueue() {
    const blob = new Blob([ticketsToCsv(visibleTickets)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "queuepilot-tickets.csv"; link.click(); URL.revokeObjectURL(url);
  }
  function resetDemo() {
    setTickets(seedTickets); setFilters(initialFilters); setSelectedId(seedTickets[0].id); window.localStorage.removeItem(STORAGE_KEY);
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="QueuePilot home"><span>Q</span>QueuePilot</a>
      <p className="workspace-name">Northstar Support <small>Public demo workspace</small></p>
      <nav aria-label="Support workspace"><a className="active" href="#queue"><span>⌁</span>Queue <b>{metrics.open + metrics.pending}</b></a><a href="#overview"><span>⌗</span>Overview</a><a href="#activity"><span>↺</span>Activity</a></nav>
      <div className="sidebar-note"><span>LOCAL-FIRST DEMO</span><p>Changes stay in this browser. No account, API key, or customer data required.</p></div>
      <a className="source-link" href="https://github.com/zhangniwo36-collab/queuepilot" target="_blank" rel="noreferrer">Source &amp; engineering notes ↗</a>
    </aside>

    <section className="workspace" id="top">
      <header className="topbar"><div><p>SUPPORT OPERATIONS / LIVE QUEUE</p><h1>Morning queue review</h1></div><div className="topbar-actions"><button className="quiet-button" onClick={resetDemo}>Reset demo</button><button className="primary-button" onClick={() => setIsCreateOpen(true)}>+ New ticket</button></div></header>
      <section className="metrics" id="overview" aria-label="Queue metrics">
        <article><span>Open</span><strong>{metrics.open}</strong><small>Needs a response</small></article><article><span>Pending</span><strong>{metrics.pending}</strong><small>Waiting on customer</small></article><article className="risk-metric"><span>SLA risk</span><strong>{metrics.atRisk}</strong><small>Due soon or overdue</small></article><article><span>Resolved</span><strong>{metrics.resolved}</strong><small>In this demo queue</small></article>
      </section>
      <section className="filters" aria-label="Queue filters">
        <label className="search-field"><span className="sr-only">Search tickets</span><input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Search tickets, people, or tags" /></label>
        <Filter label="Status" value={filters.status} onChange={(value) => setFilters({ ...filters, status: value as QueueFilters["status"] })} options={["all", "open", "pending", "resolved"]} />
        <Filter label="Priority" value={filters.priority} onChange={(value) => setFilters({ ...filters, priority: value as QueueFilters["priority"] })} options={["all", "urgent", "high", "normal", "low"]} />
        <Filter label="Owner" value={filters.assignee} onChange={(value) => setFilters({ ...filters, assignee: value })} options={["all", ...team]} />
        <button className="export-button" onClick={exportQueue}>Export CSV ↓</button>
      </section>

      <div className="desk" id="queue">
        <section className="ticket-list" aria-label="Support tickets"><div className="list-heading"><span>{visibleTickets.length} tickets</span><small>Sorted by latest activity</small></div>
          {visibleTickets.map((ticket) => { const sla = getSlaState(ticket); return <button key={ticket.id} className={`ticket-row ${selected?.id === ticket.id ? "selected" : ""}`} onClick={() => setSelectedId(ticket.id)}><span className={`priority-dot ${ticket.priority}`} aria-label={`${ticket.priority} priority`} /><span className="ticket-main"><strong>{ticket.subject}</strong><small>{ticket.customer} · {ticket.category}</small></span><span className="ticket-meta"><small>{ticket.id}</small><b className={`sla ${sla}`}>{formatSla(ticket)}</b></span></button>; })}
          {!visibleTickets.length && <div className="empty-list"><strong>No matching tickets</strong><p>Clear a filter to bring the queue back.</p></div>}
        </section>

        {selected && <section className="ticket-detail" aria-label={`Ticket ${selected.id}`}>
          <header className="detail-header"><div><p>{selected.id} · {selected.channel} · opened {formatTime(selected.createdAt)}</p><h2>{selected.subject}</h2><span>{selected.customer} · {selected.email}</span></div><span className={`status-chip ${selected.status}`}>{selected.status}</span></header>
          <div className="control-strip"><InlineSelect label="Status" value={selected.status} options={["open", "pending", "resolved"]} onChange={(value) => patchSelected({ status: value as TicketStatus })} /><InlineSelect label="Priority" value={selected.priority} options={["urgent", "high", "normal", "low"]} onChange={(value) => patchSelected({ priority: value as TicketPriority })} /><InlineSelect label="Assignee" value={selected.assignee} options={team} onChange={(value) => patchSelected({ assignee: value })} /><div className="sla-control"><span>SLA</span><strong className={getSlaState(selected)}>{formatSla(selected)}</strong></div></div>
          <div className="conversation" id="activity">{selected.activity.map((item) => <article key={item.id} className={`activity ${item.type}`}><div className="avatar" aria-hidden="true">{item.author.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><header><strong>{item.author}</strong><time>{formatTime(item.at)}</time></header><p>{item.body}</p><small>{item.type}</small></div></article>)}</div>
          <form className="reply-box" onSubmit={submitReply}><label htmlFor="reply">Reply to {selected.customer}</label><textarea id="reply" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a clear, human response…" /><div><span>Demo only — no email will be sent</span><button className="primary-button" disabled={!reply.trim()}>Add reply</button></div></form>
        </section>}
      </div>
    </section>

    {isCreateOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-ticket-title"><button className="modal-close" onClick={() => setIsCreateOpen(false)} aria-label="Close new ticket form">×</button><p>NEW INBOUND REQUEST</p><h2 id="new-ticket-title">Create a demo ticket</h2><form onSubmit={createTicket}><label>Customer<input name="customer" required placeholder="Customer name" /></label><label>Subject<input name="subject" required placeholder="What needs attention?" /></label><label>Message<textarea name="message" required placeholder="Describe the issue, impact, and timing" /></label><small>QueuePilot will assign a category and priority using transparent local rules.</small><button className="primary-button">Create ticket</button></form></section></div>}
  </main>;
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange(value: string): void }) {
  return <label className="filter-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option === "all" ? `All ${label.toLowerCase()}` : option}</option>)}</select></label>;
}
function InlineSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange(value: string): void }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
