"use client";

import { useEffect } from "react";
import { useAskAiPageContext } from "@/components/ask-ai/AskAiPageContext";

/**
 * Lightweight publisher for Library routes that do not already own Ask AI context
 * (hub, store, category, explorer). ChatInterface publishes richer standard context.
 */
export default function AskAiLibraryRoutePublisher({
  libraryContext,
  standardTitle,
  standardCode,
  standardVersion,
  isoStandardId,
  clause,
}: {
  libraryContext?: string;
  standardTitle?: string;
  standardCode?: string;
  standardVersion?: string;
  isoStandardId?: string;
  clause?: string;
}) {
  const { setAskAiContext } = useAskAiPageContext();

  useEffect(() => {
    setAskAiContext({
      ...(libraryContext ? { libraryContext } : {}),
      ...(standardTitle ? { standardTitle } : {}),
      ...(standardCode ? { standardCode } : {}),
      ...(standardVersion ? { standardVersion } : {}),
      ...(isoStandardId ? { isoStandardId } : {}),
      ...(clause ? { clause } : {}),
    });
    return () => setAskAiContext(null);
  }, [
    libraryContext,
    standardTitle,
    standardCode,
    standardVersion,
    isoStandardId,
    clause,
    setAskAiContext,
  ]);

  return null;
}
