// =============================================
//  STUDY QUEST — script.js
// =============================================

// ── Data ──────────────────────────────────────
let subjects = [];
let sessions  = [];
let totalXP   = "0";          // BUG #3: XP concatenation issue

const XP_PER_LEVEL = 100;
const SAVE_KEY     = "studyquest_v1";

// ── Storage ───────────────────────────────────
function saveData() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ subjects, sessions, totalXP }));
}

function loadData() {
  // BUG #2: reads from wrong key — will never find saved data
  const stored = localStorage.getItem("studyquest");
  if (stored) {
    const parsed = JSON.parse(stored);
    subjects = parsed.subjects || [];
    sessions  = parsed.sessions  || [];
    totalXP   = parsed.totalXP  || "0";
  }
}

// ── XP & Levels ───────────────────────────────
function getLevel(xp) {
  return Math.floor(parseInt(xp) / XP_PER_LEVEL) + 1;
}

function getXPIntoLevel(xp) {
  return parseInt(xp) % XP_PER_LEVEL;
}

function updateXPDisplay() {
  const xp    = parseInt(totalXP);
  const level = getLevel(xp);
  const into  = getXPIntoLevel(xp);
  const pct   = (into / XP_PER_LEVEL) * 100;

  document.getElementById("xp-display").textContent    = xp;
  document.getElementById("level-display").textContent = level;
  document.getElementById("xp-next-label").textContent =
    `/ ${XP_PER_LEVEL} to next level`;

  const bar = document.getElementById("xp-bar");
  bar.style.setProperty("--fill-pct", pct + "%");
}

// ── Subject Helpers ───────────────────────────
function getSubjectById(id) {
  // BUG #4: comparing number id to string value from select element
  // Maybe there's some issue with strict and loose equality...?
  return subjects.find(s => s.id === id);
}

function refreshSubjectDropdowns() {
  const sessionSelect = document.getElementById("session-subject");
  const filterSelect  = document.getElementById("history-filter");

  sessionSelect.innerHTML = '<option value="">— Pick a subject —</option>';
  filterSelect.innerHTML  = '<option value="all">All Subjects</option>';

  subjects.forEach(s => {
    const opt1 = document.createElement("option");
    opt1.value       = s.id;
    opt1.textContent = s.name;
    sessionSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value       = s.id;
    opt2.textContent = s.name;
    filterSelect.appendChild(opt2);
  });
}

function renderSubjects() {
  const list = document.getElementById("subject-list");
  list.innerHTML = "";

  if (subjects.length === 0) {
    list.innerHTML = '<li class="empty-state">No subjects yet.</li>';
    return;
  }

  subjects.forEach((s, index) => {
    const li = document.createElement("li");
    li.className = "subject-item";
    li.style.setProperty("--subject-color", s.color);
    li.innerHTML = `
      <span>${s.name}</span>
      <button class="subject-delete" data-index="${index}" title="Remove">✕</button>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll(".subject-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index);
      subjects.splice(i, 1);
      saveData();
      renderSubjects();
      refreshSubjectDropdowns();
    });
  });
}

// ── Session Helpers ───────────────────────────
function renderSessions(filter = "all") {
  const container = document.getElementById("session-list");
  container.innerHTML = "";

  const visible = filter === "all"
    ? sessions
    : sessions.filter(s => String(s.subjectId) === String(filter));

  if (visible.length === 0) {
    container.innerHTML = '<div class="empty-state">No sessions logged yet. Start studying!</div>';
    return;
  }

  visible.forEach(session => {
    // BUG #4 in action: getSubjectById receives a number but stores as number,
    // BUT the select option value is a string — so subjectId was stored
    // as a string from the form, and this lookup fails for some reason...?
    const subject = getSubjectById(session.subjectId);
    const name    = subject ? subject.name  : "Unknown";
    const color   = subject ? subject.color : "#888";

    const card = document.createElement("div");
    card.className = "session-card";
    card.style.setProperty("--subject-color", color);

    card.innerHTML = `
      <div class="session-dot"></div>
      <div class="session-info">
        <div class="session-subject-name">${name}</div>
        ${session.note ? `<div class="session-note">${session.note}</div>` : ""}
      </div>
      <div class="session-meta">
        <div class="session-xp">+${session.xpEarned} XP</div>
        <div class="session-duration">${session.minutes} min</div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ── Forms ─────────────────────────────────────

// Add Subject
const subjectForm = document.getElementById("subject-form");
subjectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name  = document.getElementById("subject-name").value.trim();
  const color = document.getElementById("subject-color").value;
  if (!name) return;

  subjects.push({ id: Date.now(), name, color });
  saveData();
  renderSubjects();
  refreshSubjectDropdowns();
  document.getElementById("subject-name").value = "";
});

// Log Session — BUG #1: missing e.preventDefault() or some other fix...?
const sessionForm = document.getElementById("session-form");
sessionForm.addEventListener("submit", (e) => {
  const subjectId = document.getElementById("session-subject").value;
  const minutes   = parseInt(document.getElementById("session-minutes").value);
  const note      = document.getElementById("session-note").value.trim();

  if (!subjectId || !minutes || minutes < 1) return;

  const xpEarned = minutes;
  totalXP = totalXP + xpEarned;    // BUG #3: XP is calculated incorrectly?

  sessions.unshift({ subjectId, minutes, note, xpEarned, date: Date.now() });
  saveData();
  updateXPDisplay();
  renderSessions(document.getElementById("history-filter").value);

  document.getElementById("session-subject").value  = "";
  document.getElementById("session-minutes").value  = "";
  document.getElementById("session-note").value     = "";
});

// History Filter
document.getElementById("history-filter").addEventListener("change", (e) => {
  renderSessions(e.target.value);
});

// ── Init ──────────────────────────────────────
loadData();
renderSubjects();
refreshSubjectDropdowns();
renderSessions();
updateXPDisplay();
