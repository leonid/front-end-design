# Frontend Interview Practice

A small, static question-and-answer study app for frontend interview preparation. Browse topics, search the question bank, reveal an answer when you're ready, and use **Again**, **Hard**, or **Know it** to bring weak questions back into your review queue.

## Try it locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; preview it locally with `npm run preview`.

## Study flow

- **Quick review** contains questions whose next review time has arrived.
- **Weak areas** contains questions last rated **Again** or **Hard**.
- **Learn** opens a topic in its original question order with answers visible and Previous/Next navigation; finish a topic before moving on.
- **Quiz** starts a short practice session from a topic, with answers hidden until revealed.
- **Explore the library** lets you search questions or choose Learn or Quiz for any topic.
- Quiz and review sessions contain up to 10 questions; learning mode walks through all questions in the selected topic.
- Quiz answers stay hidden until revealed. Learning mode shows the answer notes alongside each question.
- Progress is stored in this browser only. **Again** schedules a question in 10 minutes, **Hard** in one day, and **Know it** in three days. Reset progress from the home screen.

This is a self-study aid, not a scoring system; answer quality and confidence are for you to judge.

## Learning path and importance

Topics are grouped and ordered in `src/catalog.ts` rather than alphabetically:

1. **Core foundations** — JavaScript, TypeScript, HTML, CSS, and accessibility.
2. **Interface engineering** — React/Vue, OOP, state, SPAs, application architecture, and patterns.
3. **Quality and delivery** — testing, security, performance, build tooling, CI/CD, and monitoring.
4. **Architecture and scale** — system design, API collaboration, deep engineering, micro-frontends, PWAs, and emerging topics.
5. **Senior practice** — scenarios, team practices, and leadership.

Importance is currently assigned at the topic level: **Core** is the recommended starting point, **Important** is the next pass, and **Specialist** covers more role- or company-dependent areas. Existing questions inherit their topic's importance; individual question files can override it with `importance: essential`, `importance: important`, or `importance: specialist`. Topics and questions follow the order in the catalog and source files, respectively.

## Languages and translations

Use the language selector to switch between English and Bulgarian. Review progress is keyed by the English question ID, so switching languages keeps the same learning history. The original English files remain canonical.

For a topic stored in a numbered `questions.md`, add a Bulgarian mirror at `questions/translations/bg/<topic>/questions.md`. Keep its question numbers aligned with the English file; each translated entry overrides that question while a missing translation falls back to English. Keep code, API identifiers, and links intact when translating prose.

For individual-question Markdown files, place a matching file at `questions/translations/bg/<topic>/<filename>.md`; its front matter `id` must match the original question's stable `id`. The prompt and answer use the same `#` and `## Answer` format. Translation files do not create separate questions or progress records.

## Editing the question bank

The existing question bank is grouped by topic in `questions/<topic>/questions.md`. Keep each question heading in this form so the app can find it:

```md
### 1. Your interview question?

Write the answer here in Markdown. Code blocks, tables, and lists are supported.
```

Continue numbering within each file and put a blank line between the question heading and its answer. Add a new topic by creating a folder with a `questions.md` file. Question progress IDs are derived from the topic and question text; changing a question's wording starts its progress over, while rearranging questions does not.

Dedicated language topic files are available in `questions/javascript-language-fundamentals/` and `questions/typescript-fundamentals/`. Add new JavaScript or TypeScript fundamentals there instead of mixing them into the older combined React-oriented language topic.

New or migrated content can also use one file per question at `questions/<topic>/<filename>.md`:

```md
---
id: stable-question-id
tags: javascript, fundamentals
difficulty: intermediate
sources: https://developer.mozilla.org/
importance: essential
---
# Your interview question?

## Answer

Write the answer here in Markdown.
```

The `id` is required and must be unique within its topic. The tags, difficulty, and sources fields are optional; source links can also be included in the answer. Both formats can coexist. See [PLAN.md](PLAN.md) for the incremental migration and editorial plan.

## Publish on GitHub Pages

The GitHub Actions workflow builds and deploys this repository to Pages when changes are pushed to `main`. In the repository settings, enable **Pages** with **GitHub Actions** as the build and deployment source. The app is configured for the `/front-end-design/` project-site path.

## Content references

General learning resources are collected in [`docs/references.md`](docs/references.md). Add source links to answers as appropriate, and review third-party licensing and attribution before republishing borrowed material.
