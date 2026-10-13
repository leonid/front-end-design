import { getQuestionText, loadQuestionTranslations, questions, renderAnswer } from "./questions";
import { topicCatalog, tracks, type Importance } from "./catalog";
import {
  getLocale,
  localizedImportance,
  localizedTopicLabel,
  localizedTrack,
  saveLocale,
  t,
  type Locale,
} from "./i18n";
import {
  clearProgress,
  getReviewSets,
  loadProgress,
  saveRating,
  type Progress,
  type Rating,
} from "./progress";
import "./style.css";

type StudyMode = "all" | "due" | "weak" | "topic" | "learn";

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
let locale: Locale = getLocale();

const text = (key: Parameters<typeof t>[1], values?: Record<string, string | number>) =>
  t(locale, key, values);

function questionCopy(question: typeof questions[number]) {
  return getQuestionText(question, locale);
}

try {
  progress = loadProgress();
} catch (error) {
  progressWarning = error instanceof Error
    ? error.message
    : t(locale, "progress.readError");
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);

const topics = Object.entries(topicCatalog)
  .map(([slug, metadata]) => ({
    slug,
    ...metadata,
    count: questions.filter((question) => question.topic === slug).length,
  }))
  .filter((topic) => topic.count > 0)
  .sort((a, b) => tracks.findIndex((track) => track.id === a.track)
    - tracks.findIndex((track) => track.id === b.track) || a.order - b.order);

function priorityBadge(importance: Importance): string {
  return `<span class="importance-badge importance-${importance}">${localizedImportance(locale, importance)}</span>`;
}

function topicLabel(slug: string, label: string): string {
  return localizedTopicLabel(locale, slug, label);
}

function filteredQuestions(source: typeof questions): typeof questions {
  const term = searchTerm.trim().toLowerCase();
  return term
    ? source.filter((question) => {
      const { text: content } = questionCopy(question);
      return `${content.prompt} ${content.answer} ${topicLabel(question.topic, question.topicLabel)} ${question.tags.join(" ")}`.toLocaleLowerCase().includes(term);
    })
    : source;
}

function startSession(mode: StudyMode, topic?: string): void {
  const reviewSets = getReviewSets(questions, progress);
  const source = mode === "due"
    ? reviewSets.due
    : mode === "weak"
      ? reviewSets.weak
      : mode === "topic" || mode === "learn"
        ? questions.filter((question) => question.topic === topic)
        : questions;
  const available = filteredQuestions(source);
  const ordered = mode === "due" || mode === "weak" || mode === "learn"
    ? available
    : [...available].sort(() => Math.random() - 0.5);

  session = {
    questions: mode === "learn" ? ordered : ordered.slice(0, 10),
    mode,
    topic,
    index: 0,
    revealed: mode === "learn",
  };
  if (mode === "learn") {
    getRoot().innerHTML = `<main class="main-content"><p role="status">${text("app.loading")}</p></main>`;
    void loadQuestionTranslations("bg")
      .then(render)
      .catch((error: unknown) => {
        progressWarning = error instanceof Error ? error.message : text("progress.readError");
        render();
      });
  } else {
    render();
  }
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
      ? text("progress.saveErrorDetail", { message: error.message })
      : text("progress.saveError");
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
    <aside class="sidebar" aria-label="${text("accessibility.studyNavigation")}">
      <button class="brand" id="brand-home" type="button" aria-label="${text("accessibility.home")}">
        <span class="brand-mark" aria-hidden="true">F</span>
        <span>${text("app.name")}</span>
      </button>
      <div class="nav-label">${text("nav.review")}</div>
      <button class="nav-item ${session?.mode === "due" ? "active" : ""}" data-mode="due" ${reviewSets.due.length ? "" : "disabled"}>
        <span>${text("nav.quickReview")}</span><span class="nav-count">${reviewSets.due.length}</span>
      </button>
      <button class="nav-item ${session?.mode === "weak" ? "active" : ""}" data-mode="weak" ${reviewSets.weak.length ? "" : "disabled"}>
        <span>${text("nav.weakAreas")}</span><span class="nav-count">${reviewSets.weak.length}</span>
      </button>
      <div class="nav-label topics-label">${text("nav.learningPath")}</div>
      <button class="nav-item topic-item" data-mode="all">
        <span>${text("nav.allQuestions")}</span><span class="nav-count">${questions.length}</span>
      </button>
      <div class="topic-list">
        ${tracks.map((track) => {
          const trackTopics = topics.filter((topic) => topic.track === track.id);
          if (!trackTopics.length) return "";
          const localized = localizedTrack(locale, track.id, track.label, track.description);
          return `<div class="nav-track-label">${escapeHtml(localized.label)}</div>
            ${trackTopics.map((topic) => `
              <button class="nav-item topic-item" data-topic="${escapeHtml(topic.slug)}" data-topic-mode="learn">
                <span>${escapeHtml(topicLabel(topic.slug, topic.label))}</span><span class="nav-count">${topic.count}</span>
              </button>
            `).join("")}`;
        }).join("")}
      </div>
      <div class="sidebar-note">${text("nav.localProgress")}</div>
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
        <div class="eyebrow">${text("home.kicker")}</div>
        <div class="topbar-actions">
          <label class="language-switch"><span>${text("accessibility.language")}</span>
            <select id="language-select" aria-label="${text("accessibility.language")}">
              <option value="en" ${locale === "en" ? "selected" : ""}>${text("accessibility.languageEnglish")}</option>
              <option value="bg" ${locale === "bg" ? "selected" : ""}>${text("accessibility.languageBulgarian")}</option>
            </select>
          </label>
          <button class="text-button" id="reset-progress">${text("home.reset")}</button>
        </div>
      </header>
      ${progressWarning ? `<div class="notice" role="status">${escapeHtml(progressWarning)}</div>` : ""}
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow light">${text("home.heroKicker")}</div>
          <h1>${text("home.heroTitle")}</h1>
          <p>${text("home.heroDescription")}</p>
          <button class="button button-light" id="start-quick">
              ${currentDue.length ? text("home.reviewDue", { count: Math.min(currentDue.length, 10), plural: locale === "en" && currentDue.length !== 1 ? "s" : locale === "bg" && currentDue.length !== 1 ? "а" : "" }) : text("home.quickPractice")}
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
      <section class="stats-grid" aria-label="${text("accessibility.studyProgress")}">
        <article class="stat-card"><span class="stat-icon purple">✳</span><span class="stat-label">${text("home.library")}</span><strong>${questions.length}</strong><span class="stat-foot">${text("home.questionsTopics", { questions: questions.length, topics: topics.length })}</span></article>
        <article class="stat-card"><span class="stat-icon orange">↻</span><span class="stat-label">${text("home.readyReview")}</span><strong>${currentDue.length}</strong><span class="stat-foot">${text("home.dueAgain")}</span></article>
        <article class="stat-card"><span class="stat-icon green">◷</span><span class="stat-label">${text("home.practiced")}</span><strong>${seen}</strong><span class="stat-foot">${text("home.reviewedSoFar")}</span></article>
      </section>
      <div class="section-heading">
        <div><div class="eyebrow">${text("home.learnKicker")}</div><h2>${text("home.explore")}</h2></div>
        <label class="search-box"><span aria-hidden="true">⌕</span><span class="visually-hidden">${text("accessibility.searchQuestions")}</span><input id="question-search" type="search" placeholder="${text("home.search")}" value="${escapeHtml(searchTerm)}" /></label>
      </div>
      ${searchTerm.trim()
        ? `<section class="search-results" aria-label="${text("home.search")}">
            <div class="results-label">${searchMatches.length ? filteredQuestions(questions).length > 12 ? text("home.resultsLimited") : text("home.results") : text("home.noResults")}</div>
            ${searchMatches.map((question) => `
              <button class="search-result" data-question="${escapeHtml(question.id)}">
                <span><strong>${escapeHtml(questionCopy(question).text.prompt)}</strong><small>${escapeHtml(topicLabel(question.topic, question.topicLabel))} · ${localizedImportance(locale, question.importance)}</small></span><span aria-hidden="true">→</span>
              </button>
            `).join("")}
          </section>`
        : `<div class="curriculum">
            ${tracks.map((track) => {
              const trackTopics = topics.filter((topic) => topic.track === track.id);
              if (!trackTopics.length) return "";
              const localized = localizedTrack(locale, track.id, track.label, track.description);
              return `<section class="curriculum-track" aria-label="${escapeHtml(localized.label)}">
                <div class="track-heading"><div><h3>${escapeHtml(localized.label)}</h3><p>${escapeHtml(localized.description)}</p></div></div>
                <div class="topic-grid">
                  ${trackTopics.map((topic, index) => `
                    <article class="topic-card">
                      <span class="topic-card-icon tone-${index % 5}" aria-hidden="true">${["◈", "⌘", "▱", "✳", "◇"][index % 5]}</span>
                      <span class="topic-card-copy"><strong>${escapeHtml(topicLabel(topic.slug, topic.label))}</strong><small>${text("home.questionCount", { count: topic.count })} · ${priorityBadge(topic.importance)}</small></span>
                      <span class="topic-actions">
                        <button class="topic-action learn-action" data-topic="${escapeHtml(topic.slug)}" data-topic-mode="learn">${text("home.learn")}</button>
                        <button class="topic-action" data-topic="${escapeHtml(topic.slug)}" data-topic-mode="topic">${text("home.quiz")}</button>
                      </span>
                    </article>
                  `).join("")}
                </div>
              </section>`;
            }).join("")}
          </div>`
      }
    </main>
  `;
}

function renderSession(): string {
  if (!session) return renderHome();
  const current = session.questions[session.index];
  if (!current) return renderHome();
  const { text: currentText, fallback } = questionCopy(current);
  const bulgarianText = current.translations.bg;
  const modeLabel = session.mode === "topic"
    ? topicLabel(current.topic, current.topicLabel)
    : session.mode === "learn"
      ? `${text("session.learn")} · ${topicLabel(current.topic, current.topicLabel)}`
    : session.mode === "weak"
      ? text("session.weakAreas")
      : session.mode === "due"
        ? text("session.quickReview")
        : text("session.practice");

  return `
    <main class="main-content study-main">
      <header class="topbar study-topbar">
        <div class="session-header-actions">
          <button class="text-button back-button" id="end-session">${text("session.back")}</button>
          <label class="language-switch"><span class="visually-hidden">${text("accessibility.language")}</span>
            <select id="language-select" aria-label="${text("accessibility.language")}">
              <option value="en" ${locale === "en" ? "selected" : ""}>${text("accessibility.languageEnglish")}</option>
              <option value="bg" ${locale === "bg" ? "selected" : ""}>${text("accessibility.languageBulgarian")}</option>
            </select>
          </label>
        </div>
        <div class="session-meta">${session.index + 1} <span>/</span> ${session.questions.length}</div>
      </header>
      ${progressWarning ? `<div class="notice" role="status">${escapeHtml(progressWarning)}</div>` : ""}
      <div class="progress-track" role="progressbar" aria-label="${text("accessibility.sessionProgress")}" aria-valuemin="0" aria-valuemax="${session.questions.length}" aria-valuenow="${session.index}">
        <span style="width:${(session.index / session.questions.length) * 100}%"></span>
      </div>
      <section class="question-area ${session.mode === "learn" ? "learning-area" : ""}">
        <div class="eyebrow">${escapeHtml(modeLabel.toUpperCase())} <span class="dot-separator">·</span> ${text("session.question", { number: session.index + 1 })}</div>
        <article class="question-card">
          <div class="question-topline"><span class="topic-pill">${escapeHtml(topicLabel(current.topic, current.topicLabel))} ${priorityBadge(current.importance)}</span><span class="question-number">${session.index + 1} / ${session.questions.length}</span></div>
          ${session.mode === "learn"
            ? `<div class="language-columns">
                <section class="language-panel" lang="en" aria-label="${text("session.english")}">
                  <div class="language-panel-title">${text("session.english")}</div>
                  <h1>${escapeHtml(current.prompt)}</h1>
                  <div class="answer-content">${renderAnswer(current.answer)}</div>
                </section>
                <section class="language-panel" lang="bg" aria-label="${text("session.bulgarian")}">
                  <div class="language-panel-title">${text("session.bulgarian")}</div>
                  ${bulgarianText
                    ? `<h1>${escapeHtml(bulgarianText.prompt)}</h1><div class="answer-content">${renderAnswer(bulgarianText.answer)}</div>`
                    : `<div class="notice translation-notice" role="status">${text("session.translationMissing")}</div>`}
                </section>
              </div>
              <div class="learn-controls">
                <button class="button button-secondary" id="previous-question" ${session.index === 0 ? "disabled" : ""}>${text("session.previous")}</button>
                <span class="learn-position">${text("session.position", { current: session.index + 1, total: session.questions.length })}</span>
                <button class="button button-primary" id="next-question">${session.index === session.questions.length - 1 ? text("session.finishTopic") : text("session.next")} <span aria-hidden="true">→</span></button>
              </div>
              ${current.sources.length ? `<div class="source-list"><strong>${text("session.sources")}</strong>${current.sources.map((source) => /^https?:\/\/[^\s]+$/i.test(source)
                ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source)}</a>`
                : `<span>${escapeHtml(source)}</span>`
              ).join("")}</div>` : ""}`
            : `<h1>${escapeHtml(currentText.prompt)}</h1>${fallback ? `<div class="notice translation-notice" role="status">${text("translation.fallback")}</div>` : ""}
          ${session.revealed
            ? `<div class="answer-wrap"><div class="answer-label"><span class="answer-spark">✳</span> ${text("session.answerNotes")}</div><div class="answer-content">${renderAnswer(currentText.answer)}</div>
              ${current.sources.length ? `<div class="source-list"><strong>${text("session.sources")}</strong>${current.sources.map((source) => /^https?:\/\/[^\s]+$/i.test(source)
                ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source)}</a>`
                : `<span>${escapeHtml(source)}</span>`
              ).join("")}</div>` : ""}
              </div>
              <div class="rating-prompt" tabindex="-1">${text("session.howFeel")}</div>
              <div class="rating-grid">
                <button class="rating-button rating-again" data-rating="again"><strong>${text("session.again")}</strong><span>${text("session.againHint")}</span></button>
                <button class="rating-button rating-hard" data-rating="hard"><strong>${text("session.hard")}</strong><span>${text("session.hardHint")}</span></button>
                <button class="rating-button rating-know" data-rating="know"><strong>${text("session.know")}</strong><span>${text("session.knowHint")}</span></button>
              </div>`
            : `<div class="think-prompt"><span aria-hidden="true">✎</span><span>${text("session.thinkFirst")}</span></div>
              <button class="button button-primary reveal-button" id="reveal-answer">${text("session.reveal")} <span aria-hidden="true">→</span></button>`}`
          }
        </article>
        <div class="session-bottom">
          ${session.mode === "learn"
            ? `<span>${text("session.readContinue")}</span>`
            : `<span>${text("session.honest")}</span><button class="text-button" id="skip-question">${text("session.skip")}</button>`}
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
  document.documentElement.lang = locale;
  document.title = text("app.name");

  root.querySelector("#brand-home")?.addEventListener("click", finishSession);
  root.querySelector<HTMLSelectElement>("#language-select")?.addEventListener("change", (event) => {
    const selected = (event.currentTarget as HTMLSelectElement).value;
    if (selected !== "en" && selected !== "bg") return;
    void (async () => {
      await loadQuestionTranslations(selected);
      saveLocale(selected);
      locale = selected;
      render();
    })().catch((error: unknown) => {
      progressWarning = error instanceof Error
        ? error.message
        : text("progress.saveError");
      render();
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.mode;
      if (isStudyMode(mode)) startSession(mode);
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.topicMode;
      if ((mode === "learn" || mode === "topic") && button.dataset.topic) {
        startSession(mode, button.dataset.topic);
      }
    });
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
    if (!window.confirm(text("progress.resetConfirm"))) return;
    try {
      clearProgress();
      progress = {};
      progressWarning = "";
    } catch (error) {
      progressWarning = error instanceof Error ? error.message : text("progress.resetError");
    }
    render();
  });
  root.querySelector("#end-session")?.addEventListener("click", finishSession);
  root.querySelector("#previous-question")?.addEventListener("click", () => {
    if (!session || session.index === 0) return;
    session.index -= 1;
    session.revealed = true;
    render();
  });
  root.querySelector("#next-question")?.addEventListener("click", () => {
    if (!session) return;
    if (session.index >= session.questions.length - 1) {
      finishSession();
      return;
    }
    session.index += 1;
    session.revealed = true;
    render();
  });
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
  return value === "all" || value === "due" || value === "weak" || value === "topic" || value === "learn";
}

function isRating(value: string | undefined): value is Rating {
  return value === "again" || value === "hard" || value === "know";
}

render();
