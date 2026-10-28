export type QuizOption = { label: string; text: string };

/** Normalize AI quiz options whether returned as {A,B,C,D} or string[]. */
export function normalizeQuizOptions(options: unknown): QuizOption[] {
  if (Array.isArray(options)) {
    return options.map((text, i) => ({
      label: String.fromCharCode(65 + i),
      text: String(text ?? ""),
    }));
  }

  if (options && typeof options === "object") {
    return Object.entries(options as Record<string, unknown>).map(
      ([label, text]) => ({
        label,
        text: String(text ?? ""),
      })
    );
  }

  return [];
}

export function transformQuizQuestions(
  questionsRaw: any[],
  startId = 1
): Array<{
  id: number;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  hintInsight?: string;
}> {
  return (questionsRaw || [])
    .map((q: any, idx: number) => {
      const options = normalizeQuizOptions(q?.options);
      if (!q?.question || options.length === 0) return null;
      return {
        id: startId + idx,
        /** Stable server question id for trusted scoring */
        questionId: q.id ? String(q.id) : undefined,
        question: String(q.question),
        options,
        correctAnswer: String(q.correct_answer ?? q.correctAnswer ?? ""),
        explanation: String(q.explanation ?? ""),
        hint: q.hint,
        hintInsight: q.explanation,
      };
    })
    .filter(Boolean) as any[];
}

/**
 * AI quiz service accepts beginner | intermediate | professional.
 * Use professional + backend difficulty_instructions for extremely hard items.
 */
export const MASTERY_QUIZ_DIFFICULTY = "professional";
