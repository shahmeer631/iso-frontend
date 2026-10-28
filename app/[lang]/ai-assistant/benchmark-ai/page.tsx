"use client";
import ResultsPage from "@/components/AIAssistant/Banchmark/ResultPage";
import UploadPage from "@/components/AIAssistant/Banchmark/uploadPage";
import ISOSuggestionsPage from "@/components/AIAssistant/Banchmark/ISOSuggestionsPage";
// page.tsx  →  app/benchmark/page.tsx

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { clearResults } from "@/lib/redux/features/benchmarkSlice";
import { Phase } from "@/components/AIAssistant/Banchmark/data";
import { ISOSuggestion } from "@/types/benchmark";
import { ActivityTracker } from "@/components/activity/ActivityTracker";

export default function BenchmarkAIPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const { analysisResults } = useAppSelector((state) => state.benchmark);
  const dispatch = useAppDispatch();

  const handleReset = () => {
    dispatch(clearResults());
    setPhase("upload");
  };

  const isoSuggestions = analysisResults?.iso_suggestions as
    | ISOSuggestion[]
    | undefined;

  return (
    <>
      <ActivityTracker
        source="AI_TOOL"
        aiToolId="BENCHMARK_AI"
        resourceLabel="Benchmark AI"
        sessionKey="ai_benchmark"
      />
      {isoSuggestions && isoSuggestions.length > 0 ? (
        <ISOSuggestionsPage suggestions={isoSuggestions} onReset={handleReset} />
      ) : phase === "results" && analysisResults && !isoSuggestions ? (
        <ResultsPage result={analysisResults} onReset={handleReset} />
      ) : (
        <UploadPage onAnalyze={() => setPhase("results")} />
      )}
    </>
  );
}
