"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { htmlLanguage, resolveLocale, type Locale } from "../lib/locale";
import { addReply, classifyTicket, filterTickets, getQueueMetrics, getSlaState, seedTickets, team, ticketTranslationsZh, ticketsToCsv, updateTicket, type QueueFilters, type Ticket, type TicketPriority, type TicketStatus } from "../lib/tickets";

const STORAGE_KEY = "queuepilot-demo-v2";
const LANGUAGE_KEY = "queuepilot-language";
const initialFilters: QueueFilters = { query: "", status: "all", priority: "all", assignee: "all" };

const copy = {
  en: {
    workspace: "Public demo workspace", queue: "Queue", overview: "Overview", activity: "Activity",
    demo: "LOCAL-FIRST DEMO", demoNote: "Changes stay in this browser. No account, API key, or customer data required.", source: "Source & engineering notes ↗",
    eyebrow: "SUPPORT OPERATIONS / LIVE QUEUE", title: "Morning queue review", reset: "Reset demo", newTicket: "+ New ticket",
    open: "Open", openNote: "Needs a response", pending: "Pending", pendingNote: "Waiting on customer", risk: "SLA risk", riskNote: "Due soon or overdue", resolved: "Resolved", resolvedNote: "In this demo queue",
    search: "Search tickets, people, or tags", status: "Status", priority: "Priority", owner: "Owner", export: "Export CSV ↓",
    tickets: "tickets", sorted: "Sorted by latest activity", noMatches: "No matching tickets", clearFilter: "Clear a filter to bring the queue back.",
    opened: "opened", assignee: "Assignee", replyTo: "Reply to", replyPlaceholder: "Write a clear, human response…", noEmail: "Demo only — no email will be sent", addReply: "Add reply",
    inbound: "NEW INBOUND REQUEST", createTitle: "Create a demo ticket", close: "Close new ticket form", customer: "Customer", customerPlaceholder: "Customer name", subject: "Subject", subjectPlaceholder: "What needs attention?", message: "Message", messagePlaceholder: "Describe the issue, impact, and timing", rules: "QueuePilot will assign a category and priority using transparent local rules.", create: "Create ticket",
  },
  zh: {
    workspace: "公开演示工作区", queue: "工单队列", overview: "数据概览", activity: "处理记录",
    demo: "本地优先演示", demoNote: "所有更改只保存在当前浏览器中，无需账号、API Key 或真实客户数据。", source: "查看源码与工程说明 ↗",
    eyebrow: "客户支持运营 / 实时队列", title: "队列晨间检查", reset: "重置演示", newTicket: "+ 新建工单",
    open: "待处理", openNote: "需要回复", pending: "等待中", pendingNote: "等待客户回复", risk: "SLA 风险", riskNote: "即将超时或已超时", resolved: "已解决", resolvedNote: "演示队列内已完成",
    search: "搜索工单、客户或标签", status: "状态", priority: "优先级", owner: "负责人", export: "导出 CSV ↓",
    tickets: "个工单", sorted: "按最近活动排序", noMatches: "没有匹配的工单", clearFilter: "清除筛选条件即可恢复队列。",
    opened: "创建于", assignee: "处理人", replyTo: "回复", replyPlaceholder: "输入清晰、友好的回复…", noEmail: "仅为演示，不会真的发送邮件", addReply: "添加回复",
    inbound: "新的客户请求", createTitle: "创建演示工单", close: "关闭新建工单窗口", customer: "客户", customerPlaceholder: "客户姓名", subject: "主题", subjectPlaceholder: "需要处理什么？", message: "问题描述", messagePlaceholder: "描述问题、影响和时间要求", rules: "QueuePilot 会使用透明的本地规则自动分配分类和优先级。", create: "创建工单",
  },
} as const;

const optionZh: Record<string, string> = { all: "全部", open: "待处理", pending: "等待中", resolved: "已解决", urgent: "紧急", high: "高", normal: "普通", low: "低", Unassigned: "未分配", Access: "访问权限", Billing: "账单", Bug: "故障", "Feature request": "功能建议", Onboarding: "新手引导", message: "客户消息", reply: "回复", change: "状态变更", Email: "邮件", Web: "网页", Chat: "聊天" };

function formatTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatSla(ticket: Ticket, locale: Locale) {
  const state = getSlaState(ticket);
  if (state === "resolved") return locale === "zh" ? "已关闭" : "Closed";
  const hours = Math.round(Math.abs(Date.parse(ticket.slaDueAt) - Date.now()) / 36e5);
  if (locale === "zh") return state === "breached" ? `已超时 ${hours} 小时` : `剩余 ${hours} 小时`;
  return state === "breached" ? `${hours}h overdue` : `${hours}h left`;
}

export function QueueWorkspace() {
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [filters, setFilters] = useState<QueueFilters>(initialFilters);
  const [selectedId, setSelectedId] = useState(seedTickets[0].id);
  const [reply, setReply] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) setTickets(JSON.parse(saved)); } catch { /* keep safe seed data */ }
      setLocale(resolveLocale(window.localStorage.getItem(LANGUAGE_KEY), navigator.language));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }, [tickets, hydrated]);
  useEffect(() => { document.documentElement.lang = htmlLanguage(locale); }, [locale]);

  const visibleTickets = useMemo(() => filterTickets(tickets, filters), [tickets, filters]);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? visibleTickets[0] ?? tickets[0];
  const metrics = getQueueMetrics(tickets);
  const text = copy[locale];

  function changeLocale(next: Locale) {
    setLocale(next);
    window.localStorage.setItem(LANGUAGE_KEY, next);
  }
  function display(value: string) { return locale === "zh" ? optionZh[value] ?? value : value; }
  function displayTicket(ticket: Ticket) { return locale === "zh" ? ticketTranslationsZh[ticket.id] ?? ticket : ticket; }

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
      <p className="workspace-name">Northstar Support <small>{text.workspace}</small></p>
      <nav aria-label="Support workspace"><a className="active" href="#queue"><span>⌁</span>{text.queue} <b>{metrics.open + metrics.pending}</b></a><a href="#overview"><span>⌗</span>{text.overview}</a><a href="#activity"><span>↺</span>{text.activity}</a></nav>
      <div className="sidebar-note"><span>{text.demo}</span><p>{text.demoNote}</p></div>
      <a className="source-link" href="https://github.com/zhangniwo36-collab/QueuePilot" target="_blank" rel="noreferrer">{text.source}</a>
    </aside>

    <section className="workspace" id="top">
      <header className="topbar"><div><p>{text.eyebrow}</p><h1>{text.title}</h1></div><div className="topbar-actions"><div className="language-switch" role="group" aria-label="Language"><button className={locale === "zh" ? "active" : ""} onClick={() => changeLocale("zh")}>中文</button><button className={locale === "en" ? "active" : ""} onClick={() => changeLocale("en")}>English</button></div><button className="quiet-button" onClick={resetDemo}>{text.reset}</button><button className="primary-button" onClick={() => setIsCreateOpen(true)}>{text.newTicket}</button></div></header>
      <section className="metrics" id="overview" aria-label="Queue metrics">
        <article><span>{text.open}</span><strong>{metrics.open}</strong><small>{text.openNote}</small></article><article><span>{text.pending}</span><strong>{metrics.pending}</strong><small>{text.pendingNote}</small></article><article className="risk-metric"><span>{text.risk}</span><strong>{metrics.atRisk}</strong><small>{text.riskNote}</small></article><article><span>{text.resolved}</span><strong>{metrics.resolved}</strong><small>{text.resolvedNote}</small></article>
      </section>
      <section className="filters" aria-label="Queue filters">
        <label className="search-field"><span className="sr-only">{text.search}</span><input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder={text.search} /></label>
        <Filter label={text.status} value={filters.status} onChange={(value) => setFilters({ ...filters, status: value as QueueFilters["status"] })} options={["all", "open", "pending", "resolved"]} locale={locale} />
        <Filter label={text.priority} value={filters.priority} onChange={(value) => setFilters({ ...filters, priority: value as QueueFilters["priority"] })} options={["all", "urgent", "high", "normal", "low"]} locale={locale} />
        <Filter label={text.owner} value={filters.assignee} onChange={(value) => setFilters({ ...filters, assignee: value })} options={["all", ...team]} locale={locale} />
        <button className="export-button" onClick={exportQueue}>{text.export}</button>
      </section>

      <div className="desk" id="queue">
        <section className="ticket-list" aria-label="Support tickets"><div className="list-heading"><span>{visibleTickets.length} {text.tickets}</span><small>{text.sorted}</small></div>
          {visibleTickets.map((ticket) => { const sla = getSlaState(ticket); const shown = displayTicket(ticket); return <button key={ticket.id} className={`ticket-row ${selected?.id === ticket.id ? "selected" : ""}`} onClick={() => setSelectedId(ticket.id)}><span className={`priority-dot ${ticket.priority}`} aria-label={`${display(ticket.priority)} ${text.priority}`} /><span className="ticket-main"><strong>{shown.subject}</strong><small>{ticket.customer} · {display(ticket.category)}</small></span><span className="ticket-meta"><small>{ticket.id}</small><b className={`sla ${sla}`}>{formatSla(ticket, locale)}</b></span></button>; })}
          {!visibleTickets.length && <div className="empty-list"><strong>{text.noMatches}</strong><p>{text.clearFilter}</p></div>}
        </section>

        {selected && <section className="ticket-detail" aria-label={`Ticket ${selected.id}`}>
          <header className="detail-header"><div><p>{selected.id} · {display(selected.channel)} · {text.opened} {formatTime(selected.createdAt, locale)}</p><h2>{displayTicket(selected).subject}</h2><span>{selected.customer} · {selected.email}</span></div><span className={`status-chip ${selected.status}`}>{display(selected.status)}</span></header>
          <div className="control-strip"><InlineSelect label={text.status} value={selected.status} options={["open", "pending", "resolved"]} onChange={(value) => patchSelected({ status: value as TicketStatus })} locale={locale} /><InlineSelect label={text.priority} value={selected.priority} options={["urgent", "high", "normal", "low"]} onChange={(value) => patchSelected({ priority: value as TicketPriority })} locale={locale} /><InlineSelect label={text.assignee} value={selected.assignee} options={team} onChange={(value) => patchSelected({ assignee: value })} locale={locale} /><div className="sla-control"><span>SLA</span><strong className={getSlaState(selected)}>{formatSla(selected, locale)}</strong></div></div>
          <div className="conversation" id="activity">{selected.activity.map((item, index) => <article key={item.id} className={`activity ${item.type}`}><div className="avatar" aria-hidden="true">{item.author.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><header><strong>{item.author}</strong><time>{formatTime(item.at, locale)}</time></header><p>{locale === "zh" && index === 0 ? displayTicket(selected).message : item.body}</p><small>{display(item.type)}</small></div></article>)}</div>
          <form className="reply-box" onSubmit={submitReply}><label htmlFor="reply">{text.replyTo} {selected.customer}</label><textarea id="reply" value={reply} onChange={(event) => setReply(event.target.value)} placeholder={text.replyPlaceholder} /><div><span>{text.noEmail}</span><button className="primary-button" disabled={!reply.trim()}>{text.addReply}</button></div></form>
        </section>}
      </div>
    </section>

    {isCreateOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-ticket-title"><button className="modal-close" onClick={() => setIsCreateOpen(false)} aria-label={text.close}>×</button><p>{text.inbound}</p><h2 id="new-ticket-title">{text.createTitle}</h2><form onSubmit={createTicket}><label>{text.customer}<input name="customer" required placeholder={text.customerPlaceholder} /></label><label>{text.subject}<input name="subject" required placeholder={text.subjectPlaceholder} /></label><label>{text.message}<textarea name="message" required placeholder={text.messagePlaceholder} /></label><small>{text.rules}</small><button className="primary-button">{text.create}</button></form></section></div>}
  </main>;
}

function Filter({ label, value, options, onChange, locale }: { label: string; value: string; options: string[]; onChange(value: string): void; locale: Locale }) {
  return <label className="filter-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{locale === "zh" ? optionZh[option] ?? option : option === "all" ? `All ${label.toLowerCase()}` : option}</option>)}</select></label>;
}
function InlineSelect({ label, value, options, onChange, locale }: { label: string; value: string; options: string[]; onChange(value: string): void; locale: Locale }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{locale === "zh" ? optionZh[option] ?? option : option}</option>)}</select></label>;
}
