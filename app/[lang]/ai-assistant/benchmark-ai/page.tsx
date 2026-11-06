"use client";
import ResultsPage from "@/components/AIAssistant/Banchmark/ResultPage";
import UploadPage from "@/components/AIAssistant/Banchmark/uploadPage";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { clearResults } from "@/lib/redux/features/benchmarkSlice";
import { Phase } from "@/components/AIAssistant/Banchmark/data";
import { ActivityTracker } from "@/components/activity/ActivityTracker";

export default function BenchmarkAIPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const { analysisResults } = useAppSelector((state) => state.benchmark);
  const dispatch = useAppDispatch();

  const handleReset = () => {
    dispatch(clearResults());
    setPhase("upload");
  };

  return (
    <>
      <ActivityTracker
        source="AI_TOOL"
        aiToolId="BENCHMARK_AI"
        resourceLabel="Benchmark AI"
        sessionKey="ai_benchmark"
      />
      {phase === "results" && analysisResults ? (
        <ResultsPage result={analysisResults} onReset={handleReset} />
      ) : (
        <UploadPage onAnalyze={() => setPhase("results")} />
      )}
    </>
  );
}
