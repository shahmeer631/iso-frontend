"use client";

import { useEffect } from "react";
import { useAskAiPageContext } from "@/components/ask-ai/AskAiPageContext";

/**
 * Publishes optional retrieval hints when a Library route has a selected standard/document.
 * Does not publish Library/Navigator/Audit workflow labels — Ask AI stays universal.
 */
export default function AskAiLibraryRoutePublisher({
  standardTitle,
  standardCode,
  standardVersion,
  isoStandardId,
  documentId,
  clause,
}: {
  standardTitle?: string;
  standardCode?: string;
  standardVersion?: string;
  isoStandardId?: string;
  documentId?: string;
  clause?: string;
}) {
  const { setAskAiContext } = useAskAiPageContext();

  useEffect(() => {
    const hasRetrievalHint =
      isoStandardId ||
      documentId ||
      standardTitle ||
      standardCode ||
      clause;
    if (!hasRetrievalHint) {
      setAskAiContext(null);
      return () => setAskAiContext(null);
    }
    setAskAiContext({
      ...(standardTitle ? { standardTitle } : {}),
      ...(standardCode ? { standardCode } : {}),
      ...(standardVersion ? { standardVersion } : {}),
      ...(isoStandardId ? { isoStandardId } : {}),
      ...(documentId ? { documentId } : {}),
      ...(clause ? { clause } : {}),
    });
    return () => setAskAiContext(null);
  }, [
    standardTitle,
    standardCode,
    standardVersion,
    isoStandardId,
    documentId,
    clause,
    setAskAiContext,
  ]);

  return null;
}
