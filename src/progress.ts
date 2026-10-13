import type { Question } from "./questions";

export type Rating = "again" | "hard" | "know";

export interface ReviewRecord {
  rating: Rating;
  reviewedAt: number;
  dueAt: number;
  reviews: number;
}

export type Progress = Record<string, ReviewRecord>;

const STORAGE_KEY = "frontend-interview-review:v1";
const REVIEW_DELAYS: Record<Rating, number> = {
  again: 10 * 60 * 1000,
  hard: 24 * 60 * 60 * 1000,
  know: 3 * 24 * 60 * 60 * 1000,
};

function isRating(value: unknown): value is Rating {
  return value === "again" || value === "hard" || value === "know";
}

function isReviewRecord(value: unknown): value is ReviewRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ReviewRecord>;
  return isRating(record.rating)
    && typeof record.reviewedAt === "number"
    && typeof record.dueAt === "number"
    && typeof record.reviews === "number";
}

export function loadProgress(): Progress {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};

  const parsed: unknown = JSON.parse(stored);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Saved review progress has an invalid format.");
  }

  const progress: Progress = {};
  for (const [questionId, value] of Object.entries(parsed)) {
    if (!isReviewRecord(value)) {
      throw new Error("Saved review progress has an invalid format.");
    }

    progress[questionId] = value;
  }

  return progress;
}

export function saveRating(progress: Progress, questionId: string, rating: Rating): Progress {
  const now = Date.now();
  const updated = {
    ...progress,
    [questionId]: {
      rating,
      reviewedAt: now,
      dueAt: now + REVIEW_DELAYS[rating],
      reviews: (progress[questionId]?.reviews ?? 0) + 1,
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getReviewSets(questions: Question[], progress: Progress, now = Date.now()) {
  const due = questions
    .filter((question) => progress[question.id] && progress[question.id].dueAt <= now)
    .sort((a, b) => progress[a.id].dueAt - progress[b.id].dueAt);
  const weak = questions
    .filter((question) => {
      const rating = progress[question.id]?.rating;
      return rating === "again" || rating === "hard";
    })
    .sort((a, b) => {
      const ratingOrder = (rating: Rating) => rating === "again" ? 0 : 1;
      const aRecord = progress[a.id];
      const bRecord = progress[b.id];
      return ratingOrder(aRecord.rating) - ratingOrder(bRecord.rating)
        || aRecord.dueAt - bRecord.dueAt;
    });

  return { due, weak };
}
