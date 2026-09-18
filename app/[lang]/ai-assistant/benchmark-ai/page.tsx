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


export default function BenchmarkAIPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const { analysisResults } = useAppSelector((state) => state.benchmark);
  const dispatch = useAppDispatch();

  const handleReset = () => {
    dispatch(clearResults());
    setPhase("upload");
  };

  // Check if we have ISO suggestions to display
  const isoSuggestions = analysisResults?.iso_suggestions as ISOSuggestion[] | undefined;

  if (isoSuggestions && isoSuggestions.length > 0) {
    return (
      <ISOSuggestionsPage 
        suggestions={isoSuggestions} 
        onReset={handleReset} 
      />
    );
  }

  if (phase === "results" && analysisResults && !isoSuggestions) {
    return <ResultsPage result={analysisResults} onReset={handleReset} />;
  }

  return <UploadPage onAnalyze={() => setPhase("results")} />;
}