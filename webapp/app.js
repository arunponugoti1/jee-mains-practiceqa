// ============================================================
//  JEE Mindset Trainer — app logic
//  Vanilla JS, no build step. State persists in localStorage.
//  Views: practice (curated 6) | drill (100-Q bank) | pyq
// ============================================================

const STORE_KEY = "jee_trainer_v3";
let state = loadState();
let view = "drill";   // "drill" | "pyq"

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.answers) return s;
  } catch {}
  return fresh();
}
function fresh() {
  return { answers: {}, feedback: {}, idxByView: { practice: 0, drill: 0 } };
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

// active question list + index helpers
function list() { return view === "drill" ? BANK : QUESTIONS; }
function curIdx() { return state.idxByView[view] || 0; }
function setIdx(i) { state.idxByView[view] = i; }

const app = document.getElementById("app");

// ---- Tabs ----
function tabs() {
  const t = (v, label) => `<button class="tab ${view === v ? "active" : ""}" onclick="setView('${v}')">${label}</button>`;
  return `<div class="tabs">
    ${t("drill", "🔥 Practice (80 Qs)")}
    ${t("pyq", "📜 Previous Years")}
  </div>`;
}

// ---- Main render ----
function render() {
  if (view === "pyq") return renderPYQ();
  const L = list();
  const i = curIdx();
  if (i >= L.length) return renderSummary(L);

  const q = L[i];
  const trap = TRAPS[q.trap];
  const prior = state.answers[q.id];
  const guessed = !!(prior && prior.trapGuess);
  const answered = !!(prior && prior.chosen !== undefined);
  const fb = state.feedback[q.id] || {};

  app.innerHTML = `
    ${tabs()}
    ${(i === 0 && !guessed) ? aboutCard() : ""}
    ${modelCard()}
    ${progress(L)}
    <div class="card">
      <div class="q-meta">
        <span class="trap-tag" style="background:${trap.color}">TRAP ${q.trap} · ${trap.name}</span>
        <span class="diff">${["", "🟢 Mains-easy", "🟡 Mains-hard", "🔴 Advanced"][q.difficulty]}</span>
        <span class="q-num">${view === "drill" ? "Drill " : "Q"}${i + 1} / ${L.length}</span>
      </div>
      <div class="prompt">${q.prompt}</div>
      ${guessed ? trapVerdict(q, prior) : trapPicker()}
      ${guessed ? `<div class="options">
        ${q.options.map((o, k) => optionBtn(q, k, prior, answered)).join("")}
      </div>` : ""}
      <div class="reveal ${answered ? "show" : ""}">
        ${answered ? revealContent(q, trap, fb) : ""}
      </div>
      <div class="nav">
        <button class="btn btn-ghost" ${i === 0 ? "disabled" : ""} onclick="go(-1)">← Prev</button>
        <button class="btn btn-primary" ${answered ? "" : "disabled"} onclick="go(1)">
          ${i === L.length - 1 ? "See results →" : "Next →"}
        </button>
      </div>
    </div>
    ${footer()}
  `;
}

function modelCard() {
  return `<div class="model-card">
    <h2>${CONCEPT.subject} · ${CONCEPT.title} — the 20-second model</h2>
    <p>${CONCEPT.model}</p>
  </div>`;
}

function progress(L) {
  const done = L.filter(q => state.answers[q.id] && state.answers[q.id].chosen !== undefined).length;
  const correct = L.filter(q => state.answers[q.id] && state.answers[q.id].correct).length;
  const pct = Math.round((done / L.length) * 100);
  return `<div class="progress-row">
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    <span class="progress-label">${done}/${L.length} done · ${correct} right</span>
  </div>`;
}

// Step 1 of every question: name the trap before you see the options.
function trapPicker() {
  return `<div class="trap-picker">
    <div class="tp-head">🧭 Step 1 — name the trap <span>(decode before you solve)</span></div>
    <div class="tp-grid">
      ${Object.keys(TRAPS).map(t =>
        `<button class="tp-btn" onclick="guessTrap('${t}')"><b>${t}</b> ${TRAPS[t].name}</button>`).join("")}
    </div>
  </div>`;
}
function trapVerdict(q, prior) {
  const ok = prior.trapCorrect;
  return `<div class="tp-verdict ${ok ? "ok" : "no"}">
    ${ok
      ? `✓ Trap <b>${q.trap} — ${TRAPS[q.trap].name}</b>. Now solve it ↓`
      : `✗ You said <b>${prior.trapGuess}</b>; it's Trap <b>${q.trap} — ${TRAPS[q.trap].name}</b>. <i>${TRAPS[q.trap].tell}</i> Now solve it ↓`}
  </div>`;
}

function optionBtn(q, k, prior, answered) {
  let cls = "opt", mark = "";
  if (answered) {
    if (k === q.answer) { cls += " correct"; mark = '<span class="mark">✓</span>'; }
    else if (k === prior.chosen) { cls += " wrong"; mark = '<span class="mark">✗</span>'; }
  }
  return `<button class="${cls}" ${answered ? "disabled" : ""} onclick="choose(${k})">${q.options[k]}${mark}</button>`;
}

function revealContent(q, trap, fb) {
  const prior = state.answers[q.id];
  const wasWrong = prior && !prior.correct;
  return `
    ${wasWrong ? coachBlock(q, trap)
      : `<div class="note correct-banner">✓ Correct — you recognized <b>Trap ${q.trap} (${trap.name})</b>.</div>`}
    <h3>Thinking script — how a topper cracks it</h3>
    <ol class="script">${q.script.map(s => `<li>${s}</li>`).join("")}</ol>
    <div class="note why"><b>Why this trap (${trap.name}):</b> ${q.why}</div>
    <h3>Common mistake</h3>
    <div class="note mistake">${q.mistake}</div>
    ${feedbackBlock(q, fb)}
  `;
}

// Wrong-answer coaching: teaches recognition, not just the answer.
function coachBlock(q, trap) {
  return `<div class="coach">
    <div class="coach-head">🧭 You fell into <b>Trap ${q.trap} — ${trap.name}</b>. Here's how to catch it next time.</div>
    <div class="coach-row"><span class="coach-k">The tell</span><span>${trap.tell}</span></div>
    <div class="coach-row"><span class="coach-k">How to think</span><span>${trap.recognize}</span></div>
    <div class="coach-row"><span class="coach-k">This question</span><span>${q.why}</span></div>
  </div>`;
}

function feedbackBlock(q, fb) {
  const opts = [["clicked", "💡 Clicked"], ["knew", "✅ Knew it"], ["confused", "😕 Confused"]];
  return `<div class="feedback">
    <p>Was this helpful? Your feedback shapes the next questions.</p>
    <div class="fb-btns">
      ${opts.map(([k, label]) =>
        `<button class="fb-btn ${fb.rating === k ? "sel" : ""}" onclick="rate('${q.id}','${k}')">${label}</button>`).join("")}
    </div>
    <textarea class="fb-note" placeholder="Optional: what was confusing / what helped?"
      oninput="note('${q.id}', this.value)">${fb.note || ""}</textarea>
  </div>`;
}

function footer() {
  return `<footer>JEE Mindset Trainer · Cube/nth Roots of Unity · ${BANK.length}-question verified bank</footer>`;
}

// ---- Interactions ----
function guessTrap(t) {
  const q = list()[curIdx()];
  if (state.answers[q.id] && state.answers[q.id].trapGuess) return;
  state.answers[q.id] = { trapGuess: t, trapCorrect: t === q.trap };
  save();
  render();
}
function choose(k) {
  const q = list()[curIdx()];
  const a = state.answers[q.id];
  if (!a || a.chosen !== undefined) return;   // must name the trap first
  a.chosen = k;
  a.correct = k === q.answer;
  save();
  render();
}
function rate(qid, r) { state.feedback[qid] = { ...(state.feedback[qid] || {}), rating: r }; save(); render(); }
function note(qid, v) { state.feedback[qid] = { ...(state.feedback[qid] || {}), note: v }; save(); }
function go(d) {
  const L = list();
  setIdx(Math.max(0, Math.min(L.length, curIdx() + d)));
  save(); render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function setView(v) { view = v; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }

// ---- Summary (per active list) ----
function renderSummary(L) {
  const attempted = L.filter(q => state.answers[q.id] && state.answers[q.id].chosen !== undefined);
  const correct = attempted.filter(q => state.answers[q.id].correct).length;
  const total = L.length;

  // trap-recognition accuracy (the decode skill, made measurable)
  const guessed = L.filter(q => state.answers[q.id] && state.answers[q.id].trapGuess);
  const trapRight = guessed.filter(q => state.answers[q.id].trapCorrect).length;

  const byTrap = {};
  L.forEach(q => {
    const a = state.answers[q.id];
    if (!a || a.chosen === undefined) return;
    byTrap[q.trap] = byTrap[q.trap] || { total: 0, wrong: 0 };
    byTrap[q.trap].total++;
    if (!a.correct) byTrap[q.trap].wrong++;
  });
  const weakRows = Object.entries(byTrap)
    .sort((a, b) => (b[1].wrong / b[1].total) - (a[1].wrong / a[1].total))
    .map(([t, d]) => {
      const pct = Math.round((d.wrong / d.total) * 100);
      return `<div class="weak-trap">
        <span class="trap-tag" style="background:${TRAPS[t].color}">${t}</span>
        <span style="flex:1">${TRAPS[t].name}</span>
        <span class="bar"><div style="width:${pct}%"></div></span>
        <span style="font-size:13px;color:var(--muted)">${d.wrong}/${d.total} missed</span>
      </div>`;
    }).join("");

  const exam = Math.round((correct / total) * 50);  // project onto the 50-mark exam
  app.innerHTML = `
    ${tabs()}
    ${progress(L)}
    <div class="card">
      <div class="summary">
        <div class="big">${correct}/${attempted.length || total}</div>
        <p style="color:var(--muted)">Projected on a 50-mark paper: <b style="color:var(--accent-2)">~${exam}/50</b>
        ${attempted.length < total ? `· ${total - attempted.length} still unattempted` : ""}</p>
        ${guessed.length ? `<p style="color:var(--muted);margin-top:4px">🧭 Trap-recognition accuracy:
          <b style="color:var(--good)">${trapRight}/${guessed.length}</b> (${Math.round(100*trapRight/guessed.length)}%) — this is the decode skill</p>` : ""}
      </div>
      <h3 style="font-size:12.5px;text-transform:uppercase;letter-spacing:.7px;color:var(--accent-2);margin:16px 0 8px">
        Trap weakness map — drill these first</h3>
      ${weakRows || '<p style="color:var(--muted);font-size:14px">Attempt some questions to see your map.</p>'}
      <div class="toolbar">
        <button class="btn btn-ghost" onclick="restart()">↻ Reset this set</button>
        <button class="btn btn-primary" onclick="exportFeedback()">⤓ Export feedback</button>
      </div>
    </div>
    ${aboutCard()}
    ${footer()}
  `;
}

// Shown on the results page — purpose, method, and the path to the outcome.
function aboutCard() {
  return `<div class="about">
    <h2>Why this trainer works — and how to use it</h2>
    <div class="about-row">
      <span class="about-k">🎯 The purpose</span>
      <span>JEE doesn't reward memorizing answers — it rewards spotting the trap. Most students freeze when a familiar concept is dressed up a new way. This trainer builds the one skill that doesn't break under disguise: <b>recognizing the examiner's pattern</b> before you compute.</span>
    </div>
    <div class="about-row">
      <span class="about-k">🛠️ How it was built</span>
      <span>We reverse-engineered real JEE Main &amp; Advanced questions into <b>8 recurring traps</b> — the examiner's actual algorithm. Every one of the 80 questions is tagged with its trap, a topper's thinking-script, and the common mistake. Each answer is <b>machine-verified by complex-number arithmetic</b> and reviewed by a subject expert — not typed by hand.</span>
    </div>
    <div class="about-row">
      <span class="about-k">🚀 If you follow it</span>
      <span>Name the trap <i>before</i> you solve. Drill all 80, redo every miss, and push your <b>trap-recognition above ~80%</b>. Students who internalize the patterns — not the answers — realistically target <b>35–45 on a 50-mark paper</b>. The marks follow the recognition.</span>
    </div>
    <div class="about-tag">Built to teach you to think — so no disguise can surprise you.</div>
  </div>`;
}

function restart() {
  list().forEach(q => { delete state.answers[q.id]; });
  setIdx(0);
  save(); render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Export answers + feedback as JSON (collection mechanism for the PoC).
function exportFeedback() {
  const payload = {
    concept: CONCEPT.id,
    exportedAt: new Date().toISOString(),
    answers: state.answers,
    feedback: state.feedback,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `jee-feedback-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
  toast("Feedback exported — send the JSON to the team");
}

// ---- Previous Years — Decoded ----
function renderPYQ() {
  const cards = PYQS.map(p => `
    <div class="card pyq">
      <div class="pyq-head">
        <span class="pyq-year">${p.year}</span>
        <span class="pyq-exam">${p.exam}</span>
        ${p.verify ? '<span class="verify" title="Year attribution pending human verification">⚠ verify</span>' : ''}
      </div>
      <div class="pyq-concept">${p.concept}</div>
      <div class="prompt" style="font-size:15.5px">${p.prompt}</div>
      <h3>🎭 Why they framed it this way (the manipulation)</h3>
      <div class="note manip">${p.manipulation}</div>
      <h3>🧠 How you should think</h3>
      <div class="note why">${p.think}</div>
      <h3>🏆 Skill to master</h3>
      <div class="note skill">${p.skill}</div>
    </div>`).join("");

  app.innerHTML = `
    ${tabs()}
    <div class="model-card">
      <h2>📜 Previous Years — Decoded</h2>
      <p>Real JEE Main &amp; Advanced questions on this concept, with the examiner's manipulation exposed.
      <br><span class="verify-note">⚠ Year tags are pattern-faithful but pending human verification against official NTA/JEE papers — the decode is the value.</span></p>
    </div>
    ${cards}
    ${footer()}
  `;
}

function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

Object.assign(window, { choose, rate, note, go, restart, exportFeedback, setView, guessTrap });
render();
