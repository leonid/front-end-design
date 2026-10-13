import { marked } from "marked";
import DOMPurify from "dompurify";

export interface Question {
  id: string;
  topic: string;
  topicLabel: string;
  prompt: string;
  answer: string;
  tags: string[];
  difficulty?: string;
  sources: string[];
}

const sourceFiles = import.meta.glob("../questions/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function toTopicLabel(slug: string): string {
  const labels: Record<string, string> = {
    css: "CSS",
    html: "HTML",
    javascript: "JavaScript",
    typescript: "TypeScript",
    pwas: "PWAs",
    ci: "CI",
    cd: "CD",
    api: "API",
    react: "React",
    vue: "Vue",
  };

  const customLabels: Record<string, string> = {
    "ci-cd-and-monitoring-tools": "CI/CD and Monitoring Tools",
    "core-react-vue-concepts": "Core React/Vue Concepts",
    "frontend-backend-collaboration-and-api-design": "Frontend-Backend Collaboration and API Design",
    "typescript-and-javascript": "TypeScript and JavaScript",
  };
  if (customLabels[slug]) return customLabels[slug];

  return slug
    .split("-")
    .map((part) => labels[part] ?? part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function parseQuestions(topic: string, markdown: string): Question[] {
  const headings = [...markdown.matchAll(/^###\s+\d+[.)]\s+(.+?)\s*$/gm)];
  const promptSlugs = new Map<string, number>();

  return headings.flatMap((heading, index) => {
    const prompt = heading[1]?.trim();
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const answer = markdown.slice(start, end).trim();

    if (!prompt || !answer) return [];

    const baseSlug = prompt
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || `question-${index + 1}`;
    const occurrence = (promptSlugs.get(baseSlug) ?? 0) + 1;
    promptSlugs.set(baseSlug, occurrence);

    return [{
      id: `${topic}/${baseSlug}${occurrence > 1 ? `-${occurrence}` : ""}`,
      topic,
      topicLabel: toTopicLabel(topic),
      prompt,
      answer,
      tags: [],
      sources: [],
    }];
  });
}

function parseQuestionFile(topic: string, path: string, markdown: string): Question {
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const id = frontMatter?.[1].match(/^id:\s*([a-z0-9-]+)\s*$/m)?.[1];
  const body = frontMatter ? markdown.slice(frontMatter[0].length) : markdown;
  const prompt = body.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim();
  const answerHeading = /^## Answer\s*$/m.exec(body);
  const answer = answerHeading ? body.slice(answerHeading.index + answerHeading[0].length).trim() : "";

  if (!id || !prompt || !answer) {
    throw new Error(`Invalid question file "${path}". Expected id front matter, an H1 prompt, and an "## Answer" section.`);
  }

  const field = (name: string) =>
    frontMatter?.[1].match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "m"))?.[1] ?? "";
  const listField = (name: string) =>
    field(name).replace(/^\[|\]$/g, "").split(",").map((value) => value.trim()).filter(Boolean);

  return {
    id: `${topic}/${id}`,
    topic,
    topicLabel: toTopicLabel(topic),
    prompt,
    answer,
    tags: listField("tags"),
    difficulty: field("difficulty") || undefined,
    sources: listField("sources"),
  };
}

const loadedQuestions = Object.entries(sourceFiles).flatMap(([path, markdown]) => {
  const topic = path.split("/").at(-2);
  if (!topic) return [];
  return path.endsWith("/questions.md")
    ? parseQuestions(topic, markdown)
    : [parseQuestionFile(topic, path, markdown)];
});
const ids = new Set<string>();
for (const question of loadedQuestions) {
  if (ids.has(question.id)) throw new Error(`Duplicate question ID "${question.id}".`);
  ids.add(question.id);
}

export const questions = loadedQuestions;

export function renderAnswer(markdown: string): string {
  return DOMPurify.sanitize(marked.parse(markdown, { async: false }));
}
