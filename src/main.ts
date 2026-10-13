import { questions, renderAnswer } from "./questions";
import {
  clearProgress,
  getReviewSets,
  loadProgress,
  saveRating,
  type Progress,
  type Rating,
} from "./progress";
import "./style.css";

type StudyMode = "all" | "due" | "weak" | "topic";

interface Session {
  questions: typeof questions;
  mode: StudyMode;
  topic?: string;
  index: number;
  revealed: boolean;
}

function getRoot(): HTMLDivElement {
  const element = document.querySelector<HTMLDivElement>("#app");
  if (!element) throw new Error("App root element was not found.");
  return element;
}

let progress: Progress = {};
let progressWarning = "";
let searchTerm = "";
let session: Session | null = null;

try {
  progress = loadProgress();
} catch (error) {
  progressWarning = error instanceof Error
    ? error.message
    : "Could not read saved review progress.";
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);

const topics = [...new Set(questions.map((question) => question.topic))]
  .map((slug) => ({
    slug,
    label: questions.find((question) => question.topic === slug)?.topicLabel ?? slug,
    count: questions.filter((question) => question.topic === slug).length,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

function filteredQuestions(source: typeof questions): typeof questions {
  const term = searchTerm.trim().toLowerCase();
  return term
    ? source.filter((question) =>
      `${question.prompt} ${question.answer} ${question.topicLabel} ${question.tags.join(" ")}`.toLocaleLowerCase().includes(term))
    : source;
}

function startSession(mode: StudyMode, topic?: string): void {
  const reviewSets = getReviewSets(questions, progress);
  const source = mode === "due"
    ? reviewSets.due
    : mode === "weak"
      ? reviewSets.weak
      : mode === "topic"
        ? questions.filter((question) => question.topic === topic)
        : questions;
  const available = filteredQuestions(source);
  const ordered = mode === "due" || mode === "weak"
    ? available
    : [...available].sort(() => Math.random() - 0.5);

  session = {
    questions: ordered.slice(0, 10),
    mode,
    topic,
    index: 0,
    revealed: false,
  };
  render();
}

function finishSession(): void {
  session = null;
  render();
}

function recordRating(rating: Rating): void {
  if (!session) return;
  const current = session.questions[session.index];
  if (!current) return;

  try {
    progress = saveRating(progress, current.id, rating);
    progressWarning = "";
  } catch (error) {
    progressWarning = error instanceof Error
      ? `Progress could not be saved: ${error.message}`
      : "Progress could not be saved.";
    render();
    return;
  }

  session.index += 1;
  session.revealed = false;
  if (session.index >= session.questions.length) session = null;
  render();
}

function renderSidebar(): string {
  const reviewSets = getReviewSets(questions, progress);
  return `
    <aside class="sidebar" aria-label="Study navigation">
      <button class="brand" id="brand-home" type="button" aria-label="Frontend Interview Practice home">
        <span class="brand-mark" aria-hidden="true">F</span>
        <span>Frontend<br />Interview Practice</span>
      </button>
      <div class="nav-label">REVIEW</div>
      <button class="nav-item ${session?.mode === "due" ? "active" : ""}" data-mode="due" ${reviewSets.due.length ? "" : "disabled"}>
        <span>Quick review</span><span class="nav-count">${reviewSets.due.length}</span>
      </button>
      <button class="nav-item ${session?.mode === "weak" ? "active" : ""}" data-mode="weak" ${reviewSets.weak.length ? "" : "disabled"}>
        <span>Weak areas</span><span class="nav-count">${reviewSets.weak.length}</span>
      </button>
      <div class="nav-label topics-label">TOPICS</div>
      <button class="nav-item topic-item" data-mode="all">
        <span>All questions</span><span class="nav-count">${questions.length}</span>
      </button>
      <div class="topic-list">
        ${topics.map((topic) => `
          <button class="nav-item topic-item" data-topic="${escapeHtml(topic.slug)}">
            <span>${escapeHtml(topic.label)}</span><span class="nav-count">${topic.count}</span>
          </button>
        `).join("")}
      </div>
      <div class="sidebar-note">Your progress stays on this device.</div>
    </aside>
  `;
}

function renderHome(): string {
  const seen = Object.keys(progress).length;
  const { due: currentDue } = getReviewSets(questions, progress);
  const searchMatches = filteredQuestions(questions).slice(0, 12);
  return `
    <main class="main-content">
      <header class="topbar">
        <div class="eyebrow">YOUR INTERVIEW PREP, IN ONE PLACE</div>
        <button class="text-button" id="reset-progress">Reset progress</button>
      </header>
      ${progressWarning ? `<div class="notice" role="status">${escapeHtml(progressWarning)}</div>` : ""}
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow light">A LITTLE PRACTICE GOES A LONG WAY</div>
          <h1>Feel ready<br />for the conversation.</h1>
          <p>Practice frontend questions, focus on what feels tricky, and build confidence one answer at a time.</p>
          <button class="button button-light" id="start-quick">
              ${currentDue.length ? `Review ${Math.min(currentDue.length, 10)} due question${currentDue.length === 1 ? "" : "s"}` : "Start a quick practice"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
          <div class="orbit-core"><span>&lt;/&gt;</span></div>
          <span class="float-chip chip-one">01</span><span class="float-chip chip-two">JS</span>
          <span class="float-chip chip-three">CSS</span>
        </div>
      </section>
      <section class="stats-grid" aria-label="Study progress">
        <article class="stat-card"><span class="stat-icon purple">✳</span><span class="stat-label">IN THE LIBRARY</span><strong>${questions.length}</strong><span class="stat-foot">questions across ${topics.length} topics</span></article>
        <article class="stat-card"><span class="stat-icon orange">↻</span><span class="stat-label">READY TO REVIEW</span><strong>${currentDue.length}</strong><span class="stat-foot">due for another look</span></article>
        <article class="stat-card"><span class="stat-icon green">◷</span><span class="stat-label">PRACTICED</span><strong>${seen}</strong><span class="stat-foot">questions reviewed so far</span></article>
      </section>
      <div class="section-heading">
        <div><div class="eyebrow">PICK UP WHERE YOU LIKE</div><h2>Explore the library</h2></div>
        <label class="search-box"><span aria-hidden="true">⌕</span><span class="visually-hidden">Search questions</span><input id="question-search" type="search" placeholder="Search questions" value="${escapeHtml(searchTerm)}" /></label>
      </div>
      ${searchTerm.trim()
        ? `<section class="search-results" aria-label="Search results">
            <div class="results-label">${searchMatches.length ? `Matching questions${filteredQuestions(questions).length > 12 ? " · showing first 12" : ""}` : "No matching questions"}</div>
            ${searchMatches.map((question) => `
              <button class="search-result" data-question="${escapeHtml(question.id)}">
                <span><strong>${escapeHtml(question.prompt)}</strong><small>${escapeHtml(question.topicLabel)}</small></span><span aria-hidden="true">→</span>
              </button>
            `).join("")}
          </section>`
        : `<section class="topic-grid" aria-label="Question topics">
            ${topics.map((topic, index) => `
              <button class="topic-card" data-topic="${escapeHtml(topic.slug)}">
                <span class="topic-card-icon tone-${index % 5}" aria-hidden="true">${["◈", "⌘", "▱", "✳", "◇"][index % 5]}</span>
                <span class="topic-card-copy"><strong>${escapeHtml(topic.label)}</strong><small>${topic.count} questions</small></span>
                <span class="topic-arrow" aria-hidden="true">↗</span>
              </button>
            `).join("")}
          </section>`
      }
    </main>
  `;
}

function renderSession(): string {
  if (!session) return renderHome();
  const current = session.questions[session.index];
  if (!current) return renderHome();
  const modeLabel = session.mode === "topic"
    ? current.topicLabel
    : session.mode === "weak"
      ? "Weak areas"
      : session.mode === "due"
        ? "Quick review"
        : "Practice";

  return `
    <main class="main-content study-main">
      <header class="topbar study-topbar">
        <button class="text-button back-button" id="end-session">← <span>Back to library</span></button>
        <div class="session-meta">${session.index + 1} <span>/</span> ${session.questions.length}</div>
      </header>
      ${progressWarning ? `<div class="notice" role="status">${escapeHtml(progressWarning)}</div>` : ""}
      <div class="progress-track" role="progressbar" aria-label="Session progress" aria-valuemin="0" aria-valuemax="${session.questions.length}" aria-valuenow="${session.index}">
        <span style="width:${(session.index / session.questions.length) * 100}%"></span>
      </div>
      <section class="question-area">
        <div class="eyebrow">${escapeHtml(modeLabel.toUpperCase())} <span class="dot-separator">·</span> QUESTION ${session.index + 1}</div>
        <article class="question-card">
          <div class="question-topline"><span class="topic-pill">${escapeHtml(current.topicLabel)}</span><span class="question-number">${session.index + 1} / ${session.questions.length}</span></div>
          <h1>${escapeHtml(current.prompt)}</h1>
          ${session.revealed
            ? `<div class="answer-wrap"><div class="answer-label"><span class="answer-spark">✳</span> Answer notes</div><div class="answer-content">${renderAnswer(current.answer)}</div>
              ${current.sources.length ? `<div class="source-list"><strong>Sources</strong>${current.sources.map((source) => /^https?:\/\/[^\s]+$/i.test(source)
                ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source)}</a>`
                : `<span>${escapeHtml(source)}</span>`
              ).join("")}</div>` : ""}
              </div>
              <div class="rating-prompt" tabindex="-1">How did that feel?</div>
              <div class="rating-grid">
                <button class="rating-button rating-again" data-rating="again"><strong>Again</strong><span>Need to revisit</span></button>
                <button class="rating-button rating-hard" data-rating="hard"><strong>Hard</strong><span>Getting there</span></button>
                <button class="rating-button rating-know" data-rating="know"><strong>Know it</strong><span>Feels familiar</span></button>
              </div>`
            : `<div class="think-prompt"><span aria-hidden="true">✎</span><span>Take a moment to form your own answer before you reveal it.</span></div>
              <button class="button button-primary reveal-button" id="reveal-answer">Reveal answer <span aria-hidden="true">→</span></button>`
          }
        </article>
        <div class="session-bottom">
          <span>Be honest with yourself — this makes review more useful.</span>
          <button class="text-button" id="skip-question">Skip for now</button>
        </div>
      </section>
    </main>
  `;
}

function render(): void {
  const root = getRoot();
  const { due: dueCount, weak: weakCount } = getReviewSets(questions, progress);
  root.innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      ${renderSession()}
      <span class="visually-hidden" aria-live="polite">${dueCount} questions due, ${weakCount} weak questions.</span>
    </div>
  `;

  root.querySelector("#brand-home")?.addEventListener("click", finishSession);
  root.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.mode;
      if (isStudyMode(mode)) startSession(mode);
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => startSession("topic", button.dataset.topic));
  });
  root.querySelectorAll<HTMLButtonElement>("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = questions.find((question) => question.id === button.dataset.question);
      if (selected) {
        session = { questions: [selected], mode: "topic", topic: selected.topic, index: 0, revealed: false };
        render();
      }
    });
  });
  root.querySelector("#start-quick")?.addEventListener("click", () => {
    const sets = getReviewSets(questions, progress);
    startSession(sets.due.length ? "due" : sets.weak.length ? "weak" : "all");
  });
  root.querySelector("#reset-progress")?.addEventListener("click", () => {
    if (!window.confirm("Reset all review progress saved on this device?")) return;
    try {
      clearProgress();
      progress = {};
      progressWarning = "";
    } catch (error) {
      progressWarning = error instanceof Error ? error.message : "Could not reset progress.";
    }
    render();
  });
  root.querySelector("#end-session")?.addEventListener("click", finishSession);
  root.querySelector("#reveal-answer")?.addEventListener("click", () => {
    if (session) session.revealed = true;
    render();
    root.querySelector<HTMLElement>(".rating-prompt")?.focus();
  });
  root.querySelector("#skip-question")?.addEventListener("click", () => {
    if (!session) return;
    session.index += 1;
    session.revealed = false;
    if (session.index >= session.questions.length) session = null;
    render();
  });
  root.querySelectorAll<HTMLButtonElement>("[data-rating]").forEach((button) => {
    button.addEventListener("click", () => {
      const rating = button.dataset.rating;
      if (isRating(rating)) recordRating(rating);
    });
  });
  root.querySelector<HTMLInputElement>("#question-search")?.addEventListener("input", (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const cursor = input.selectionStart;
    searchTerm = input.value;
    render();
    const replacement = root.querySelector<HTMLInputElement>("#question-search");
    replacement?.focus();
    if (cursor !== null) replacement?.setSelectionRange(cursor, cursor);
  });
}

function isStudyMode(value: string | undefined): value is StudyMode {
  return value === "all" || value === "due" || value === "weak" || value === "topic";
}

function isRating(value: string | undefined): value is Rating {
  return value === "again" || value === "hard" || value === "know";
}

render();
