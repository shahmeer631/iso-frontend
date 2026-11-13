/**
 * Client-side Mastery Lab scoring helpers.
 * Authoritative score always comes from the backend; these helpers keep
 * progress vs score separated for local UI / offline review.
 */

export type MasteryScoreBreakdown = {
  correct: number;
  incorrect: number;
  unanswered: number;
  answered: number;
  total: number;
  /** (correct / total) × 100 */
  score: number;
  /** (answered / total) × 100 */
  progress: number;
};

export function computeMasteryScoreBreakdown(input: {
  total: number;
  correct: number;
  answered: number;
}): MasteryScoreBreakdown {
  const total = Math.max(0, Number(input.total) || 0);
  const correct = Math.max(0, Math.min(total, Number(input.correct) || 0));
  const answered = Math.max(
    correct,
    Math.min(total, Number(input.answered) || 0),
  );
  const incorrect = Math.max(0, answered - correct);
  const unanswered = Math.max(0, total - answered);
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
  return {
    correct,
    incorrect,
    unanswered,
    answered,
    total,
    score,
    progress,
  };
}

/** Prefer backend score; never derive score from progress alone. */
export function resolveAuthoritativeScore(payload: {
  score?: number | null;
  overallScore?: number | null;
  rightAns?: number | null;
  total?: number | null;
}): number {
  const direct = Number(payload.score ?? payload.overallScore);
  if (Number.isFinite(direct) && direct >= 0) {
    return Math.round(direct);
  }
  const total = Number(payload.total) || 0;
  const correct = Number(payload.rightAns) || 0;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}
