"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Page-level retrieval hints for Universal Ask AI (standard/document IDs only).
 * GlobalChatbot whitelists these fields — workflow/page labels must not be sent.
 */
export type AskAiPageContextValue = {
  isoStandardId?: string;
  standardTitle?: string;
  standardCode?: string;
  standardVersion?: string;
  clause?: string;
  documentId?: string;
};

type AskAiPageContextApi = {
  context: AskAiPageContextValue;
  setAskAiContext: (next: AskAiPageContextValue | null) => void;
  patchAskAiContext: (partial: Partial<AskAiPageContextValue>) => void;
};

const AskAiPageContext = createContext<AskAiPageContextApi | null>(null);

export function AskAiPageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContext] = useState<AskAiPageContextValue>({});

  const setAskAiContext = useCallback((next: AskAiPageContextValue | null) => {
    setContext(next && typeof next === "object" ? { ...next } : {});
  }, []);

  const patchAskAiContext = useCallback(
    (partial: Partial<AskAiPageContextValue>) => {
      setContext((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const value = useMemo(
    () => ({ context, setAskAiContext, patchAskAiContext }),
    [context, setAskAiContext, patchAskAiContext],
  );

  return (
    <AskAiPageContext.Provider value={value}>{children}</AskAiPageContext.Provider>
  );
}

export function useAskAiPageContext(): AskAiPageContextApi {
  const ctx = useContext(AskAiPageContext);
  if (!ctx) {
    return {
      context: {},
      setAskAiContext: () => undefined,
      patchAskAiContext: () => undefined,
    };
  }
  return ctx;
}
