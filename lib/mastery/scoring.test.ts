import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeMasteryScoreBreakdown,
  resolveAuthoritativeScore,
} from "./scoring";

describe("frontend mastery scoring helpers", () => {
  const cases: Array<{
    total: number;
    correct: number;
    answered: number;
    progress: number;
    score: number;
  }> = [
    { total: 20, correct: 15, answered: 20, progress: 100, score: 75 },
    { total: 20, correct: 8, answered: 10, progress: 50, score: 40 },
    { total: 20, correct: 0, answered: 20, progress: 100, score: 0 },
    { total: 20, correct: 0, answered: 0, progress: 0, score: 0 },
    { total: 10, correct: 7, answered: 10, progress: 100, score: 70 },
  ];

  for (const c of cases) {
    it(`${c.total}/${c.correct}/${c.answered} → progress ${c.progress}% score ${c.score}%`, () => {
      const out = computeMasteryScoreBreakdown(c);
      assert.equal(out.progress, c.progress);
      assert.equal(out.score, c.score);
      assert.equal(out.incorrect, c.answered - c.correct);
      assert.equal(out.unanswered, c.total - c.answered);
    });
  }

  it("resolveAuthoritativeScore prefers backend score over local ratio", () => {
    assert.equal(
      resolveAuthoritativeScore({ score: 40, rightAns: 8, total: 20 }),
      40,
    );
    assert.equal(
      resolveAuthoritativeScore({ overallScore: 75, rightAns: 1, total: 20 }),
      75,
    );
    assert.equal(resolveAuthoritativeScore({ rightAns: 8, total: 20 }), 40);
  });
});
