"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Page-level context for Universal Ask AI.
 * Screens publish selected ISO/library/document/clause info;
 * GlobalChatbot reads it without a second AI system.
 */
export type AskAiPageContextValue = {
  isoStandardId?: string;
  standardTitle?: string;
  standardCode?: string;
  standardVersion?: string;
  clause?: string;
  libraryContext?: string;
  documentId?: string;
  documentContext?: string;
  /** Soft module label: Library | ISO Navigator | Audit Lens | Benchmark AI */
  currentModule?: string;
  /** Optional pathname echoed for backend workspace awareness */
  currentRoute?: string;
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
