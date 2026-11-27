"use strict";
// Taproom front end: reads the realm's JSON view over JSON-RPC and renders it.
// All user-supplied text goes through textContent, never innerHTML.

const NETS = window.TAPROOM_NETWORKS;
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

const state = { net: localStorage.getItem("taproom.net") || "local", data: null, filter: "open" };
if (!NETS[state.net]) state.net = "local";

const gnot = (u) => {
  const whole = Math.floor(u / 1e6), frac = u % 1e6;
  return whole.toLocaleString("en-US") + (frac ? "." + String(frac).padStart(6, "0").replace(/0+$/, "") : "");
};
const short = (a) => (a && a.length > 12 ? a.slice(0, 6) + "…" + a.slice(-4) : a || "");
const fmtDate = (s) => new Date(s * 1000).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
const ago = (secs) => {
  const abs = Math.abs(secs), d = Math.floor(abs / 86400), h = Math.floor((abs % 86400) / 3600), m = Math.floor((abs % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
};
const shq = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), 2200);
}

async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); toast(label || "Copied"); }
  catch { window.prompt("Copy this command:", text); }
}

async function qrender(net, path) {
  const data = btoa(net.realm + ":" + path);
  const res = await fetch(net.rpc, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "abci_query", params: { path: "vm/qrender", data } }),
  });
  if (!res.ok) throw new Error("RPC returned HTTP " + res.status);
  const j = await res.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  const r = j.result.response;
  if (r.ResponseBase && r.ResponseBase.Error) throw new Error("Realm query failed (is the realm deployed on this network?)");
  const bin = atob(r.ResponseBase.Data || "");
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

function callCmd(fn, args, sendUgnot, key = "mykey") {
  const net = NETS[state.net];
  const remote = net.rpc.replace(/^http:\/\//, "");
  const parts = ["gnokey maketx call", `-pkgpath ${net.realm}`, `-func ${fn}`];
  for (const a of args) parts.push(`-args ${shq(a)}`);
  if (sendUgnot) parts.push(`-send ${sendUgnot}ugnot`);
  parts.push("-gas-fee 1000000ugnot -gas-wanted 30000000 -broadcast", `-chainid ${net.chainId}`, `-remote ${remote}`, key);
  return parts.join(" \\\n  ");
}

function renderStats(d) {
  const box = $("#stats"); box.replaceChildren();
  const open = d.quests.filter((q) => q.status === "open").length;
  const items = [
    [String(open), "open quests"],
    [gnot(d.escrow) + " GNOT", "locked in escrow"],
    [gnot(d.paid) + " GNOT", "paid to hunters"],
    [String(d.count), "quests pinned"],
  ];
  for (const [v, l] of items) {
    const c = el("div", "glass stat"); c.append(el("b", "", v), el("span", "", l)); box.append(c);
  }
}

function renderGrid() {
  const d = state.data, grid = $("#grid"); grid.replaceChildren();
  if (!d) return;
  const list = d.quests.filter((q) => state.filter === "all" || (state.filter === "open") === (q.status === "open"));
  if (!list.length) {
    grid.append(el("div", "glass empty", d.count === 0 ? "The board is empty. Be the first to pin a quest." : "Nothing here yet."));
    return;
  }
  for (const q of list) {
    const card = el("button", "glass card"); card.type = "button";
    const top = el("div", "meta");
    top.append(el("span", `chip ${q.status}`, q.status), el("span", "", `#${q.id}`));
    const reward = el("div", "reward", gnot(q.reward)); reward.append(el("small", "", "GNOT"));
    const meta = el("div", "meta");
    const left = d.now > q.deadline ? "window closed" : "closes in " + ago(q.deadline - d.now);
    meta.append(el("span", "", q.status === "open" ? left : q.status === "awarded" ? "won by " + short(q.winner) : "escrow reclaimed"),
      el("span", "", `${q.answers.length} answer${q.answers.length === 1 ? "" : "s"}`));
    card.append(top, el("h3", "", q.title), reward);
    if (q.status === "open") {
      const total = q.deadline - q.created, used = Math.min(Math.max(d.now - q.created, 0), total);
      const bar = el("div", "bar"), fill = el("i"); fill.style.width = (total ? (used / total) * 100 : 100) + "%"; bar.append(fill); card.append(bar);
    }
    card.append(meta);
    card.addEventListener("click", () => openSheet(q));
    grid.append(card);
  }
}

function openSheet(q) {
  const d = state.data, sheet = $("#sheet"); sheet.replaceChildren();
  const inn = el("div", "in");
  const close = el("button", "btn ghost sm close", "Close"); close.type = "button"; close.addEventListener("click", () => sheet.close());
  const reward = el("div", "reward", gnot(q.reward)); reward.append(el("small", "", "GNOT"));
  inn.append(close, el("span", `chip ${q.status}`, q.status), el("h2", "", q.title), reward);
  const kv = el("div", "kv");
  kv.append(el("span", "", "Quest #" + q.id), el("span", "", "Posted by " + short(q.poster)), el("span", "", "Closes " + fmtDate(q.deadline)));
  inn.append(kv, el("p", "details", q.details));

  const acts = el("div", "actions");
  if (q.status === "open") {
    const sub = el("button", "btn sm", "Copy submit command"); sub.type = "button";
    sub.addEventListener("click", () => copy(callCmd("Submit", [String(q.id), "Describe your answer here", "https://"], 0), "Submit command copied — edit the note and link first"));
    const rec = el("button", "btn ghost sm", "Copy reclaim command (poster)"); rec.type = "button";
    rec.addEventListener("click", () => copy(callCmd("Reclaim", [String(q.id)], 0), "Reclaim command copied"));
    acts.append(sub, rec);
  }
  inn.append(acts);

  inn.append(el("h3", "", `Answers (${q.answers.length})`));
  const ul = el("ul", "answers");
  if (!q.answers.length) ul.append(el("li", "", "No answers yet."));
  for (const a of q.answers) {
    const li = el("li", q.winner && a.hunter === q.winner ? "winner" : "");
    li.append(el("div", "who", a.hunter + (q.winner === a.hunter ? "  ·  winner" : "") + "  ·  " + fmtDate(a.at)), el("p", "", a.note));
    if (a.link && /^https:\/\/[^\s<>"'()]+$/.test(a.link)) {
      const link = el("a", "", a.link); link.href = a.link; link.rel = "noopener noreferrer"; link.target = "_blank"; li.append(link);
    }
    if (q.status === "open") {
      const row = el("div", "actions");
      const b = el("button", "btn ghost sm", "Copy award command (poster)"); b.type = "button";
      b.addEventListener("click", () => copy(callCmd("Award", [String(q.id), a.hunter], 0), "Award command copied"));
      row.append(b); li.append(row);
    }
    ul.append(li);
  }
  inn.append(ul); sheet.append(inn); sheet.showModal();
}

function showNotice(msg) { const n = $("#notice"); n.hidden = !msg; n.textContent = msg || ""; }

async function load() {
  const net = NETS[state.net];
  $("#realm-line").textContent = net.realm ? `${net.label} · ${net.realm}` : `${net.label} · realm not deployed yet`;
  state.data = null; $("#stats").replaceChildren(); $("#grid").replaceChildren();
  if (!net.realm) {
    showNotice("The realm has not been deployed to this network yet. Switch to “Local gnodev” to browse a local chain, or follow DEPLOY.md.");
    return;
  }
  showNotice("");
  try {
    state.data = JSON.parse(await qrender(net, "json"));
    renderStats(state.data); renderGrid();
  } catch (e) {
    showNotice(`Could not read ${net.label} (${e.message}). Check that the node is running and CORS is open on its RPC.`);
  }
}

function init() {
  const sel = $("#network");
  for (const [k, v] of Object.entries(NETS)) { const o = el("option", "", v.label); o.value = k; sel.append(o); }
  sel.value = state.net;
  sel.addEventListener("change", () => { state.net = sel.value; localStorage.setItem("taproom.net", state.net); load(); });
  $("#filter").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    state.filter = b.dataset.f;
    for (const x of $("#filter").children) x.classList.toggle("on", x === b);
    renderGrid();
  });
  $("#composer").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target), net = NETS[state.net];
    if (!net.realm) { toast("This network has no deployed realm yet"); return; }
    const reward = Math.round(parseFloat(f.get("reward")) * 1e6);
    if (!(reward >= 1e6)) { toast("Minimum reward is 1 GNOT"); return; }
    const cmd = callCmd("PostQuest", [f.get("title"), f.get("details"), String(parseInt(f.get("days"), 10))], reward, f.get("key"));
    const out = $("#composer-out"); out.textContent = cmd; out.hidden = false; copy(cmd, "Command copied");
  });
  load();
  setInterval(() => { if (!document.hidden && NETS[state.net].realm) load(); }, 20000);
}
init();
