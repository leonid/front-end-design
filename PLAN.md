# Frontend Interview Study App

## Goal

Turn this repository's frontend interview question bank into a fast, simple study tool for interview preparation, especially for a focused review the day before an interview. Publish it as a static site on GitHub Pages; do not require a backend or user account.

## Existing material

- 28 topic folders hold approximately 385 questions in Markdown, including dedicated JavaScript, TypeScript, and object-oriented programming topics.
- Answers include prose, lists, tables, and code samples, but their depth and accuracy vary.
- `docs/references.md` contains general resource links rather than sources linked to individual answers.
- The project currently has no app, build tooling, or Pages deployment.

## Product experience

1. Browse the question bank by topic and search question text.
2. Follow an ordered learning path grouped into foundations, interface engineering, quality and delivery, architecture and scale, and senior practice; show importance tiers to guide study time.
3. Start a short review session from questions that are due, or focus on questions previously rated weak.
4. Show one question at a time; reveal its answer only when requested.
5. After reviewing an answer, self-rate it **Again**, **Hard**, or **Know**. Bring weaker answers back sooner using a small, understandable schedule.
6. Save progress in versioned browser storage, with a way to reset it. Keep all questions available even when there is no review progress.

## Content and architecture

- Keep question and answer content in Markdown files grouped under `questions/<topic>/`; content should remain easy to edit without changing app code.
- Move toward one Markdown file per question, with a stable ID and optional tags, difficulty, and source links. Preserve Markdown for code, tables, and prose.
- The initial app should load the existing topic-level Markdown files directly. Migrate topics incrementally rather than risking a large one-time rewrite; keep the loader adaptable to individual question files.
- Use a small TypeScript static frontend and a lightweight build step. Sanitize rendered Markdown.
- Store only review metadata in `localStorage`; do not send progress or question data to a server.
- Deploy the generated static site to GitHub Pages with GitHub Actions and support the repository subpath.

## Phases

### 1. Static study MVP

- Build question/topic loading, topic browsing, search, answer reveal, and short study sessions.
- Add due/weak review queues, self-ratings, persistence, and progress reset.
- Add accessible responsive styling and a small-screen layout.

### 2. Content authoring and quality

- Document how to add a topic and question; define the individual-question Markdown format.
- Migrate topic files in small batches and check that code, lists, and tables render correctly.
- Review correctness, current framework guidance, clarity, useful answer depth, and attribution. Behavioral questions should invite the learner's own examples rather than imply invented personal experience.
- Keep JavaScript language/runtime questions distinct from TypeScript's static type-system questions; add practical examples and debugging prompts alongside conceptual questions.
- Maintain a curated topic catalog with curriculum order, study track, and topic importance; allow individual question files to override their inherited importance.
- Support English and Bulgarian UI/content with English-canonical question IDs, locale-specific Markdown overlays, and English fallback for any untranslated question.

### 3. GitHub Pages and contributor workflow

- Add an automated static build and Pages deployment workflow.
- Document local development, question editing, progress behavior, and deployment.

## Acceptance criteria

- The existing question bank is browseable and searchable.
- A learner can complete a short session without seeing answers prematurely.
- Self-ratings affect future review order and survive reloads.
- Progress can be reset, and the app remains useful with a new or empty progress store.
- Markdown answers, including code and tables, render safely and readably.
- The site works by keyboard, adapts to mobile widths, and can be published at the GitHub Pages project URL.

## Out of scope for the first release

- Accounts, server-side storage, and cross-device synchronization.
- A general-purpose CMS, analytics, and complex spaced-repetition algorithms.
- Rewriting every answer before the first usable release.
