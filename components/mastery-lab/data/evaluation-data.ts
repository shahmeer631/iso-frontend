export interface CompetencyScore {
  id: string;
  title: string;
  score: number;
}

export const evaluationData = {
  industry: "Software & Technology",
  role: "Quality Manager",
  scores: [
    { id: "compliance", title: "Compliance", score: 85 },
    { id: "implementation", title: "Implementation", score: 72 },
    { id: "auditing", title: "Auditing", score: 90 },
    { id: "risk", title: "Risk Management", score: 68 },
    { id: "governance", title: "Governance", score: 78 },
  ] as CompetencyScore[],
};
