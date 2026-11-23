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
  standard?: string;
  version?: string;
  clause?: string;
  subclause?: string;
  knowledgeCategory?: string;
  isoStandardCategory?: string;
  questionType?: string;
}> {
  return (questionsRaw || [])
    .map((q: any, idx: number) => {
      const options = normalizeQuizOptions(q?.options);
      if (!q?.question || options.length === 0) return null;
      const clause = String(q.clause ?? q.subclause ?? "").trim();
      const knowledgeCategory = String(
        q.primary_knowledge_category ??
          q.knowledge_category ??
          q.pillar ??
          "",
      ).trim();
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
        standard: String(q.standard ?? "").trim() || undefined,
        version: String(q.version ?? "").trim() || undefined,
        clause: clause || undefined,
        subclause: String(q.subclause ?? "").trim() || undefined,
        knowledgeCategory: knowledgeCategory || undefined,
        isoStandardCategory:
          String(q.iso_standard_category ?? "").trim() || undefined,
        questionType:
          String(q.question_type ?? "knowledge").trim() || "knowledge",
      };
    })
    .filter(Boolean) as any[];
}

/**
 * Default Mastery Lab difficulty: EXPERT / extremely hard.
 * Backend maps expert → AI "professional" enum while keeping expert intent in prompts.
 */
export const MASTERY_QUIZ_DIFFICULTY = "expert";
