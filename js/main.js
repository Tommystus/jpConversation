// JP Conv — N5 scripted conversation practice.
// Flow: home (scenario grid) -> session (dialogue bubbles + answer cards)
// -> completion. Settings live in a <dialog>; everything persists to
// localStorage via store.js.

import { scenarios } from "./data.js";
import { bestMatchScore, checkAnswer } from "./match.js";
import {
  cancelListen,
  listJapaneseVoices,
  listenOnce,
  onVoicesChanged,
  speak,
  stopSpeaking,
  sttSupported,
  ttsSupported,
} from "./speech.js";
import {
  clearProgress,
  getProgress,
  loadSettings,
  recordCompletion,
  saveSettings,
} from "./store.js";

const app = document.getElementById("app");

let settings = loadSettings();

// Active session state (null when on the home screen).
let session = null;

/* ---------- text helpers ---------- */

// Base is kanji-only so the match can't swallow plain text preceding the
// bracket in mid-sentence markup like "メキシコから来[き]ました".
const FURIGANA_RE = /([一-鿿々ヶ]+)\[([^\[\]<>]+)\]/g;

// "漢字[かんじ]" -> "漢字"
function toPlain(text) {
  return text.replace(FURIGANA_RE, "$1");
}

// "漢字[かんじ]" -> "かんじ"
function toKana(text) {
  return text.replace(FURIGANA_RE, "$2");
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

// Japanese text -> HTML honoring the furigana / kana-only settings.
function renderJa(text) {
  const escaped = escapeHtml(text);
  if (settings.kanaOnly) return toKana(escaped);
  return escaped.replace(FURIGANA_RE, "<ruby>$1<rt>$2</rt></ruby>");
}

function starString(score) {
  const n = score >= 0.9 ? 3 : score >= 0.6 ? 2 : score > 0 ? 1 : 0;
  return "★".repeat(n) + "☆".repeat(3 - n);
}

/* ---------- home screen ---------- */

function renderHome() {
  session = null;
  stopSpeaking();
  cancelListen();

  const cards = scenarios
    .map((sc) => {
      const p = getProgress(sc.id);
      const progress = p.completions
        ? `<div class="scenario-progress"><span class="stars">${starString(p.best)}</span> · played ${p.completions}×</div>`
        : `<div class="scenario-progress">Not tried yet</div>`;
      return `
        <button class="scenario-card" data-scenario="${sc.id}">
          <div class="scenario-icon">${sc.icon}</div>
          <div class="scenario-title">${escapeHtml(sc.title)}</div>
          <div class="scenario-title-en">${escapeHtml(sc.titleEn)}</div>
          <div class="scenario-desc">${escapeHtml(sc.description)}</div>
          ${progress}
        </button>`;
    })
    .join("");

  app.innerHTML = `
    <p class="page-title">Pick a scenario and practice speaking. 🎤 = you can also answer with your voice.</p>
    <div class="scenario-grid">${cards}</div>`;

  for (const btn of app.querySelectorAll("[data-scenario]")) {
    btn.addEventListener("click", () => {
      const sc = scenarios.find((s) => s.id === btn.dataset.scenario);
      startSession(sc);
    });
  }
}

/* ---------- session screen ---------- */

function startSession(scenario) {
  session = {
    scenario,
    idx: -1,
    attempts: 0,
    hintUsed: false,
    firstTryCorrect: 0,
    userLinesTotal: 0,
    finished: false,
  };
  for (const line of scenario.lines) {
    if (line.role === "user") session.userLinesTotal++;
  }

  app.innerHTML = `
    <button class="back-btn" id="back-btn">← All scenarios</button>
    <div class="session-head">
      <h2 class="session-title">${scenario.icon} ${escapeHtml(scenario.title)} <small>${escapeHtml(scenario.titleEn)}</small></h2>
      <span class="session-step" id="step-indicator"></span>
    </div>
    <div class="dialogue" id="transcript"></div>
    <div id="active-area"></div>`;

  document.getElementById("back-btn").addEventListener("click", renderHome);
  nextLine();
}

function updateStepIndicator() {
  const el = document.getElementById("step-indicator");
  if (!el || !session) return;
  const total = session.scenario.lines.length;
  el.textContent = `${Math.min(session.idx + 1, total)} / ${total}`;
}

// Advance to the next line, playing through consecutive partner lines until
// the learner's turn (or the end).
function nextLine() {
  if (!session) return;
  session.idx++;
  session.attempts = 0;
  session.hintUsed = false;
  updateStepIndicator();

  const lines = session.scenario.lines;
  const transcript = document.getElementById("transcript");

  while (session.idx < lines.length && lines[session.idx].role === "partner") {
    const line = lines[session.idx];
    transcript.insertAdjacentHTML("beforeend", bubbleHtml(line));
    const bubble = transcript.lastElementChild;
    wireBubbleTools(bubble, line);
    speakLine(line);
    session.idx++;
  }
  updateStepIndicator();

  if (session.idx >= lines.length) {
    finishSession();
    return;
  }

  const line = lines[session.idx];
  if (line.role === "user") showAnswerCard(line);
}

function bubbleHtml(line) {
  const who = line.role === "partner" ? "partner" : "user";
  const tools = `
    <div class="bubble-tools">
      <button class="tool-btn replay-btn" title="Play audio">🔊 Play</button>
      <button class="tool-btn slow-btn" title="Play audio slowly">🐢 Slow</button>
      <button class="tool-btn romaji-btn" title="Show romaji">Aa</button>
      <button class="tool-btn en-btn" title="Show English">EN</button>
    </div>`;
  return `
    <div class="bubble ${who}">
      <div class="jp">${renderJa(line.text)}</div>
      ${who === "user" ? "" : tools}
    </div>`;
}

function wireBubbleTools(bubble, line) {
  bubble.querySelector(".replay-btn")?.addEventListener("click", () => speakLine(line));
  bubble.querySelector(".slow-btn")?.addEventListener("click", () => speakLine(line, SLOW_RATE));
  bubble.querySelector(".romaji-btn")?.addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (!b.dataset.on) {
      b.insertAdjacentHTML(
        "afterend",
        `<div class="romaji">${escapeHtml(line.romaji)}</div>`
      );
      b.dataset.on = "1";
    } else {
      b.nextElementSibling?.remove();
      delete b.dataset.on;
    }
  });
  bubble.querySelector(".en-btn")?.addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (!b.dataset.on) {
      b.insertAdjacentHTML(
        "afterend",
        `<div class="en-text">${escapeHtml(line.english)}</div>`
      );
      b.dataset.on = "1";
    } else {
      b.nextElementSibling?.remove();
      delete b.dataset.on;
    }
  });
}

const SLOW_RATE = 0.6;

function speakLine(line, rate = settings.rate) {
  if (!ttsSupported) return;
  speak(toPlain(line.text), { voiceURI: settings.voiceURI, rate });
}

/* ---------- answer card (learner's turn) ---------- */

function showAnswerCard(line) {
  const active = document.getElementById("active-area");
  const micBtn = sttSupported
    ? `<button type="button" class="btn mic-btn" id="mic-btn" title="Speak your answer">🎤</button>`
    : "";

  active.innerHTML = `
    <div class="answer-card">
      <p class="task-label">Your turn</p>
      <p style="margin:0">${escapeHtml(line.task)}</p>

      <div class="hint-row">
        <button class="chip" data-hint="en">💡 Meaning (EN)</button>
        <button class="chip" data-hint="romaji">💡 Romaji</button>
        <button class="chip" data-hint="jp">💡 Japanese answer</button>
      </div>
      <div id="hint-area"></div>

      <div class="input-row">
        ${micBtn}
        <input id="answer-input" type="text" autocomplete="off"
               placeholder="${sttSupported ? "Type or speak…" : "Type your answer…"}" />
        <button class="btn btn-primary" id="submit-btn">Check</button>
      </div>
      <div class="feedback" id="feedback"></div>
      <div id="reveal-area"></div>
    </div>`;

  wireAnswerCard(line);
}

function wireAnswerCard(line) {
  const input = document.getElementById("answer-input");
  const feedback = document.getElementById("feedback");
  const hintArea = document.getElementById("hint-area");
  const card = document.querySelector(".answer-card");

  const hints = {
    en: `Meaning: ${line.english}`,
    romaji: `Romaji: ${line.romaji}`,
    jp: `Answer: ${toPlain(line.text)}`,
  };

  for (const chip of document.querySelectorAll("[data-hint]")) {
    chip.addEventListener("click", () => {
      hintArea.innerHTML = `<div class="en-text">${escapeHtml(hints[chip.dataset.hint])}</div>`;
      if (chip.dataset.hint === "jp") session.hintUsed = true;
    });
  }

  function submitAnswerInner() {
    const value = input.value.trim();
    if (!value || input.disabled) return;

    if (checkAnswer(value, line.answers)) {
      if (session.attempts === 0 && !session.hintUsed) session.firstTryCorrect++;
      feedback.className = "feedback good";
      feedback.textContent = pick(["✓ いいですね!", "✓ そうです!", "✓ Perfect!", "✓ 上手!"]);
      input.disabled = true;
      document.getElementById("submit-btn").disabled = true;

      // Reinforce: play the model answer back.
      speakLine(line);

      const transcript = document.getElementById("transcript");
      transcript.insertAdjacentHTML(
        "beforeend",
        `<div class="bubble user"><div class="jp">${escapeHtml(value)}</div>
           <div class="bubble-tools"><button class="tool-btn user-play-btn" title="Play my answer">🔊</button></div>
         </div>`
      );
      transcript.lastElementChild
        .querySelector(".user-play-btn")
        .addEventListener("click", () => {
          if (!ttsSupported) return;
          speak(value, { voiceURI: settings.voiceURI, rate: settings.rate });
        });
      transcript.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end" });

      document.getElementById("active-area").innerHTML = "";
      setTimeout(() => session && nextLine(), 1200);
    } else {
      session.attempts++;
      card.classList.remove("shake");
      void card.offsetWidth; // restart the animation
      card.classList.add("shake");

      const near = bestMatchScore(value, line.answers);
      feedback.className = "feedback bad";
      feedback.textContent =
        near >= 0.5
          ? "Almost! Check the hints and try again."
          : pick(["✗ Not quite — try again.", "✗ Hmm, try once more."]);

      if (session.attempts >= 2) showRevealOption(line);
    }
  }

  document.getElementById("submit-btn").addEventListener("click", submitAnswerInner);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitAnswerInner();
  });

  const micBtn = document.getElementById("mic-btn");
  if (micBtn) {
    micBtn.addEventListener("click", () => {
      micBtn.classList.add("listening");
      micBtn.textContent = "👂";
      feedback.className = "feedback";
      feedback.textContent = "Listening… speak now.";
      listenOnce({
        onDone: () => {
          micBtn.classList.remove("listening");
          micBtn.textContent = "🎤";
        },
      })
        .then((transcript) => {
          input.value = transcript;
          submitAnswerInner();
        })
        .catch((err) => {
          feedback.className = "feedback bad";
          feedback.textContent = err.message;
        });
    });
  }
}

function showRevealOption(line) {
  const reveal = document.getElementById("reveal-area");
  if (reveal.innerHTML) return;
  reveal.innerHTML = `
    <div class="answer-reveal">
      <strong>Model answer:</strong>
      <div class="jp" style="font-size:1.1rem">${renderJa(line.text)}</div>
      <div class="romaji">${escapeHtml(line.romaji)}</div>
      <button class="btn" id="continue-btn" style="margin-top:0.5rem">Got it — continue →</button>
    </div>`;
  document.getElementById("continue-btn").addEventListener("click", () => {
    document.getElementById("active-area").innerHTML = "";
    nextLine();
  });
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ---------- completion ---------- */

function finishSession() {
  session.finished = true;
  const score =
    session.userLinesTotal > 0
      ? session.firstTryCorrect / session.userLinesTotal
      : 1;
  recordCompletion(session.scenario.id, score);

  const note =
    score === 1
      ? "完璧! Every line on the first try."
      : score >= 0.6
        ? "よくできました! Solid run — replay to perfect it."
        : "がんばりました! Try it again to build fluency.";

  document.getElementById("active-area").innerHTML = `
    <div class="result-card">
      <div class="result-stars">${starString(score)}</div>
      <p class="result-score">${session.firstTryCorrect} / ${session.userLinesTotal} lines first try</p>
      <p class="result-note">${note}</p>
      <div class="result-actions">
        <button class="btn" id="again-btn">↻ Practice again</button>
        <button class="btn btn-primary" id="home-btn">All scenarios</button>
      </div>
    </div>`;

  document.getElementById("again-btn").addEventListener("click", () => {
    startSession(session.scenario);
  });
  document.getElementById("home-btn").addEventListener("click", renderHome);
}

/* ---------- settings ---------- */

function wireSettings() {
  const dialog = document.getElementById("settings-dialog");
  const voiceSelect = document.getElementById("setting-voice");
  const rateInput = document.getElementById("setting-rate");
  const rateOutput = document.getElementById("rate-output");
  const furiganaInput = document.getElementById("setting-furigana");
  const kanaInput = document.getElementById("setting-kana");
  const enInput = document.getElementById("setting-en");

  document.getElementById("settings-btn").addEventListener("click", () => dialog.showModal());
  document.getElementById("home-link").addEventListener("click", (e) => {
    e.preventDefault();
    renderHome();
  });

  function refreshVoiceOptions() {
    const voices = listJapaneseVoices();
    voiceSelect.innerHTML =
      `<option value="">Auto (${voices[0]?.name ?? "no Japanese voice found"})</option>` +
      voices
        .map(
          (v) =>
            `<option value="${escapeHtml(v.voiceURI)}" ${v.voiceURI === settings.voiceURI ? "selected" : ""}>${escapeHtml(v.name)}</option>`
        )
        .join("");
  }
  onVoicesChanged(refreshVoiceOptions);

  function syncControls() {
    rateInput.value = settings.rate;
    rateOutput.textContent = `${settings.rate.toFixed(2)}×`;
    furiganaInput.checked = settings.furigana;
    kanaInput.checked = settings.kanaOnly;
    enInput.checked = settings.showEnglish;
  }
  syncControls();

  voiceSelect.addEventListener("change", () => {
    settings.voiceURI = voiceSelect.value || null;
    saveSettings(settings);
  });
  rateInput.addEventListener("input", () => {
    settings.rate = Number(rateInput.value);
    rateOutput.textContent = `${settings.rate.toFixed(2)}×`;
    saveSettings(settings);
  });
  furiganaInput.addEventListener("change", () => {
    settings.furigana = furiganaInput.checked;
    document.body.classList.toggle("no-furigana", !settings.furigana);
    saveSettings(settings);
    if (session) startSession(session.scenario); // re-render current dialogue
  });
  kanaInput.addEventListener("change", () => {
    settings.kanaOnly = kanaInput.checked;
    saveSettings(settings);
    if (session) startSession(session.scenario);
  });
  enInput.addEventListener("change", () => {
    settings.showEnglish = enInput.checked;
    saveSettings(settings);
  });

  document.getElementById("clear-progress-btn").addEventListener("click", () => {
    if (confirm("Delete all saved progress?")) {
      clearProgress();
      if (!session) renderHome();
    }
  });
}

/* ---------- init ---------- */

document.body.classList.toggle("no-furigana", !settings.furigana);
wireSettings();
renderHome();
