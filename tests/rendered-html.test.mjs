import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the complete QueuePilot support workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>QueuePilot — Customer support operations console<\/title>/i);
  assert.match(html, /Morning queue review/);
  assert.match(html, /Cannot access our analytics workspace/);
  assert.match(html, /SLA risk/);
  assert.match(html, /Search tickets, people, or tags/);
  assert.match(html, /Export CSV/);
  assert.match(html, /New ticket/);
  assert.match(html, /Demo only — no email will be sent/);
  assert.match(html, /github\.com\/zhangniwo36-collab\/QueuePilot/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/i);
});

test("removes starter assets and keeps the demo local-first", async () => {
  const [workspace, packageJson] = await Promise.all([
    readFile(new URL("../app/components/queue-workspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(workspace, /window\.localStorage/);
  assert.match(workspace, /No account, API key, or customer data required/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
});

test("ships a social preview image and metadata", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  await access(new URL("../public/og.png", import.meta.url));
  assert.match(layout, /summary_large_image/);
  assert.match(layout, /\/og\.png/);
});

test("offers a Chinese interface while keeping English available for clients", async () => {
  const workspace = await readFile(new URL("../app/components/queue-workspace.tsx", import.meta.url), "utf8");
  assert.match(workspace, /navigator\.language\.startsWith\("zh"\)/);
  assert.match(workspace, /队列晨间检查/);
  assert.match(workspace, /中文/);
  assert.match(workspace, /English/);
});

