import { marked } from "marked";
import DOMPurify from "dompurify";
import { topicCatalog, type Importance, type TopicMetadata } from "./catalog";
import type { Locale } from "./i18n";

export interface QuestionText {
  prompt: string;
  answer: string;
}
export interface Question {
  id: string;
  topic: string;
  topicLabel: string;
  prompt: string;
  answer: string;
  tags: string[];
  difficulty?: string;
  importance: Importance;
  sources: string[];
  translations: Partial<Record<Locale, QuestionText>>;
}

const sourceFiles = import.meta.glob("../questions/*/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const bulgarianFiles = import.meta.glob("../questions/translations/bg/*/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

function isImportance(value: string): value is Importance {
  return value === "essential" || value === "important" || value === "specialist";
}

function getTopicMetadata(slug: string) {
  const metadataBySlug: Readonly<Record<string, TopicMetadata>> = topicCatalog;
  const metadata = metadataBySlug[slug];
  if (!metadata) throw new Error(`Topic "${slug}" is missing from src/catalog.ts.`);
  return metadata;
}

function parseQuestions(topic: string, markdown: string): Question[] {
  const headings = [...markdown.matchAll(/^###\s+(\d+)[.)]\s+(.+?)\s*$/gm)];
  const promptSlugs = new Map<string, number>();

  return headings.flatMap((heading, index) => {
    const prompt = heading[2]?.trim();
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

    const metadata = getTopicMetadata(topic);
    return [{
      id: `${topic}/${baseSlug}${occurrence > 1 ? `-${occurrence}` : ""}`,
      topic,
      topicLabel: metadata.label,
      prompt,
      answer,
      tags: [],
      importance: metadata.importance,
      sources: [],
      translations: {},
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

  const metadata = getTopicMetadata(topic);
  const requestedImportance = field("importance");
  let importance: Importance = metadata.importance;
  if (requestedImportance) {
    if (!isImportance(requestedImportance)) {
      throw new Error(`Invalid importance "${requestedImportance}" in question file "${path}".`);
    }
    importance = requestedImportance;
  }

  return {
    id: `${topic}/${id}`,
    topic,
    topicLabel: metadata.label,
    prompt,
    answer,
    tags: listField("tags"),
    difficulty: field("difficulty") || undefined,
    importance,
    sources: listField("sources"),
    translations: {},
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

let bulgarianLoaded = false;

export async function loadQuestionTranslations(locale: Locale): Promise<void> {
  if (locale !== "bg" || bulgarianLoaded) return;
  const loadedFiles = await Promise.all(Object.entries(bulgarianFiles).map(async ([path, load]) =>
    [path, await load()] as const));

  const pendingTranslations = new Map<Question, QuestionText>();
  const questionsByTopic = new Map<string, Question[]>();
  for (const question of loadedQuestions) {
    const group = questionsByTopic.get(question.topic) ?? [];
    group.push(question);
    questionsByTopic.set(question.topic, group);
  }
  for (const [path, markdown] of loadedFiles) {
    const topic = path.split("/").at(-2);
    if (!topic) continue;
    const originals = questionsByTopic.get(topic);
    if (!originals) throw new Error(`Bulgarian translation "${path}" has no matching English topic.`);
    if (!path.endsWith("/questions.md")) {
      const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      const id = frontMatter?.[1].match(/^id:\s*([a-z0-9-]+)\s*$/m)?.[1];
      const body = frontMatter ? markdown.slice(frontMatter[0].length) : markdown;
      const prompt = body.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim();
      const answerHeading = /^## Answer\s*$/m.exec(body);
      const answer = answerHeading ? body.slice(answerHeading.index + answerHeading[0].length).trim() : "";
      const original = originals.find((question) => question.id === `${topic}/${id}`);
      if (!id || !original || !prompt || !answer || original.translations.bg || pendingTranslations.has(original)) {
        throw new Error(`Invalid individual Bulgarian translation "${path}". Match its front matter id to an English question ID.`);
      }
      pendingTranslations.set(original, { prompt, answer });
      continue;
    }
    const headings = [...markdown.matchAll(/^###\s+(\d+)[.)]\s+(.+?)\s*$/gm)];
    const translatedNumbers = new Set<number>();
    for (const [index, heading] of headings.entries()) {
      const questionNumber = Number(heading[1]);
      const original = originals[questionNumber - 1];
      const start = (heading.index ?? 0) + heading[0].length;
      const end = headings[index + 1]?.index ?? markdown.length;
      const answer = markdown.slice(start, end).trim();
      const prompt = heading[2]?.trim();
      if (!original || !prompt || !answer || translatedNumbers.has(questionNumber)) {
        throw new Error(`Invalid question ${questionNumber} in Bulgarian translation "${path}".`);
      }
      translatedNumbers.add(questionNumber);
      if (pendingTranslations.has(original)) {
        throw new Error(`Duplicate Bulgarian translation for question "${original.id}".`);
      }
      pendingTranslations.set(original, { prompt, answer });
    }
  }

  for (const [question, translation] of pendingTranslations) {
    question.translations.bg = translation;
  }
  bulgarianLoaded = true;
}

export function getQuestionText(question: Question, locale: Locale): { text: QuestionText; fallback: boolean } {
  if (locale === "bg" && question.translations.bg) {
    return { text: question.translations.bg, fallback: false };
  }
  return { text: question, fallback: locale !== "en" };
}

export function renderAnswer(markdown: string): string {
  return DOMPurify.sanitize(marked.parse(markdown, { async: false }));
}
