"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePathname, useSearchParams } from "next/navigation";
import { X, MessageCircle, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useChatSimpleMutation } from "@/lib/redux/api/auditLensApi";
import { useAskAiPageContext } from "@/components/ask-ai/AskAiPageContext";
import type { RootState } from "@/lib/redux/store";
import "@/lib/i18n/client";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  displayedContent?: string;
  isStreaming?: boolean;
  sources?: string[];
  grounded?: boolean;
}

function createClientSessionId() {
  if (typeof window !== "undefined") {
    try {
      const existing = window.sessionStorage.getItem("isobrain_universal_ask_session");
      if (existing && existing.startsWith("universal_")) return existing;
    } catch {
      /* ignore */
    }
  }
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `universal_${crypto.randomUUID()}`
      : `universal_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem("isobrain_universal_ask_session", id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

/** Extract Library ISO standard id from /library/iso-standards/chat/[id] */
function extractLibraryStandardId(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  const match = pathname.match(/\/library\/iso-standards\/chat\/([a-fA-F0-9]{24})/);
  return match?.[1];
}

function extractDocumentId(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  const match = pathname.match(/\/(?:documents|library\/documents|library\/store)\/([a-fA-F0-9]{24})/);
  return match?.[1];
}

function buildConversationSnippet(history: ChatMessage[]): string {
  const recent = history.slice(-6);
  if (!recent.length) return "";
  return recent
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${String(m.content || "").slice(0, 280)}`)
    .join("\n");
}

function inferLibraryModuleLabel(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  if (pathname.includes("/library/iso-standards")) return "ISOBrain Library — ISO Standards";
  if (pathname.includes("/library/store")) return "ISOBrain Library — Store";
  if (pathname.includes("/library")) return "ISOBrain Library";
  return undefined;
}

function inferCurrentModule(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  if (pathname.includes("/ai-assistant/iso-navigator")) return "ISO Navigator";
  if (pathname.includes("/ai-assistant/audit-lens")) return "Audit Lens";
  if (pathname.includes("/ai-assistant/benchmark-ai")) return "Benchmark AI";
  if (pathname.includes("/ai-assistant-home")) return "AI Assistant";
  if (pathname.includes("/library")) return "ISOBrain Library";
  if (pathname.includes("/academy") || pathname.includes("/lessons")) return "Academy";
  if (pathname.includes("/dashboard")) return "Dashboard";
  return undefined;
}

type AskAiRouteExtras = {
  currentModule?: string;
  standardTitle?: string;
  standardCode?: string;
  standardVersion?: string;
  clause?: string;
  libraryContext?: string;
  documentContext?: string;
};

function loadPersistedChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem("isobrain_universal_ask_history");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "ai") &&
          typeof m.content === "string",
      )
      .map((m) => ({
        role: m.role as "user" | "ai",
        content: String(m.content),
        sources: Array.isArray(m.sources) ? m.sources : undefined,
      }))
      .slice(-40);
  } catch {
    return [];
  }
}

function persistChatHistory(history: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    const slim = history.slice(-40).map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.sources?.length ? { sources: m.sources } : {}),
    }));
    window.sessionStorage.setItem(
      "isobrain_universal_ask_history",
      JSON.stringify(slim),
    );
  } catch {
    /* ignore */
  }
}

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() =>
    loadPersistedChatHistory(),
  );
  const [sessionId] = useState(() => createClientSessionId());
  const [statusHint, setStatusHint] = useState<string | null>(null);
  const [chatSimple, { isLoading: isProcessing }] = useChatSimpleMutation();
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { context: pageContext } = useAskAiPageContext();

  const navigatorForm = useSelector(
    (s: RootState) => s.isoNavigator?.formData,
  );
  const navigatorDoc = useSelector(
    (s: RootState) => s.isoNavigator?.generatedDocument,
  );
  const auditForm = useSelector((s: RootState) => s.auditLens?.formData);
  const auditDoc = useSelector(
    (s: RootState) => s.auditLens?.generatedDocument,
  );
  const auditStep = useSelector((s: RootState) => s.auditLens?.currentStep);
  const benchmarkResults = useSelector(
    (s: RootState) => s.benchmark?.analysisResults,
  );

  const urlStandardId = useMemo(
    () => extractLibraryStandardId(pathname),
    [pathname],
  );
  const urlDocumentId = useMemo(() => extractDocumentId(pathname), [pathname]);
  const currentModule =
    pageContext.currentModule || inferCurrentModule(pathname);

  const routeModuleContext = useMemo(() => {
    if (!pathname) return {} as AskAiRouteExtras;

    if (pathname.includes("/ai-assistant/iso-navigator")) {
      const std = String(navigatorForm?.specific_requirements || "").trim();
      const clause = String(navigatorForm?.clause || "").trim() || undefined;
      const docTitle =
        String(
          navigatorDoc?.title ||
            navigatorForm?.document_title ||
            navigatorForm?.output_type ||
            "",
        ).trim() || undefined;
      const yearMatch = std.match(/\b(19|20)\d{2}\b/);
      return {
        currentModule: "ISO Navigator",
        standardTitle: std || undefined,
        standardCode: std || undefined,
        standardVersion: yearMatch?.[0],
        clause,
        libraryContext: "ISO Navigator",
        documentContext: docTitle
          ? `Navigator document: ${docTitle}`
          : "ISO Navigator workspace",
      } satisfies AskAiRouteExtras;
    }

    if (pathname.includes("/ai-assistant/audit-lens")) {
      const stage = String(auditForm?.stage || "").trim();
      const material = String(auditForm?.material_type || "").trim();
      const scope = String(auditForm?.scope_description || "").trim();
      const parts = [
        "Audit Lens",
        stage ? `stage: ${stage}` : "",
        material ? `material: ${material}` : "",
        typeof auditStep === "number" ? `step: ${auditStep}` : "",
      ].filter(Boolean);
      const clauses = Array.isArray(auditDoc?.iso_clauses_covered)
        ? auditDoc!.iso_clauses_covered.filter(Boolean).slice(0, 3)
        : [];
      return {
        currentModule: "Audit Lens",
        libraryContext: parts.join(" — "),
        clause: clauses[0] ? String(clauses[0]).replace(/[^\d.]/g, "") || undefined : undefined,
        documentContext: [
          auditDoc?.title ? `Audit material: ${auditDoc.title}` : "",
          scope ? `Scope: ${scope.slice(0, 240)}` : "",
          clauses.length ? `Clauses: ${clauses.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join("\n")
          .slice(0, 400) || "Audit Lens workspace",
      } satisfies AskAiRouteExtras;
    }

    if (pathname.includes("/ai-assistant/benchmark-ai")) {
      const title =
        (benchmarkResults as any)?.title ||
        (benchmarkResults as any)?.document_title ||
        (benchmarkResults as any)?.file_name ||
        "";
      return {
        currentModule: "Benchmark AI",
        libraryContext: "Benchmark AI",
        documentContext: title
          ? `Benchmark analysis: ${String(title).slice(0, 200)}`
          : "Benchmark AI workspace",
      } satisfies AskAiRouteExtras;
    }

    return {} as AskAiRouteExtras;
  }, [
    pathname,
    navigatorForm,
    navigatorDoc,
    auditForm,
    auditDoc,
    auditStep,
    benchmarkResults,
  ]);

  const urlClause =
    searchParams.get("clause") ||
    searchParams.get("clauseId") ||
    pageContext.clause ||
    routeModuleContext.clause ||
    undefined;

  const resolvedContext = useMemo(() => {
    const isoStandardId =
      pageContext.isoStandardId || urlStandardId || undefined;
    const documentId = pageContext.documentId || urlDocumentId || undefined;
    const libraryContext =
      pageContext.libraryContext ||
      routeModuleContext.libraryContext ||
      inferLibraryModuleLabel(pathname) ||
      (currentModule ? currentModule : undefined);
    const standardTitle =
      pageContext.standardTitle ||
      routeModuleContext.standardTitle ||
      undefined;
    const standardCode =
      pageContext.standardCode || routeModuleContext.standardCode || undefined;
    const standardVersion =
      pageContext.standardVersion ||
      routeModuleContext.standardVersion ||
      undefined;
    const documentContext =
      pageContext.documentContext ||
      routeModuleContext.documentContext ||
      undefined;

    return {
      purpose: "universal_ask" as const,
      ...(currentModule ? { currentModule } : {}),
      ...(pathname ? { currentRoute: pathname } : {}),
      ...(isoStandardId ? { isoStandardId } : {}),
      ...(standardTitle ? { standardTitle } : {}),
      ...(standardCode ? { standardCode } : {}),
      ...(standardVersion ? { standardVersion } : {}),
      ...(urlClause ? { clause: urlClause } : {}),
      ...(libraryContext ? { libraryContext } : {}),
      ...(documentId ? { documentId } : {}),
      ...(documentContext ? { documentContext } : {}),
    };
  }, [
    pageContext,
    routeModuleContext,
    urlStandardId,
    urlDocumentId,
    urlClause,
    pathname,
    currentModule,
  ]);

  const contextBanner = useMemo(() => {
    const moduleLabel =
      currentModule || routeModuleContext.currentModule || undefined;
    if (resolvedContext.standardTitle || resolvedContext.isoStandardId) {
      const title = resolvedContext.standardTitle || "Selected ISO standard";
      const withClause = resolvedContext.clause
        ? `${title} · Clause ${resolvedContext.clause}`
        : title;
      return moduleLabel ? `${moduleLabel} · ${withClause}` : withClause;
    }
    if (resolvedContext.libraryContext) return resolvedContext.libraryContext;
    if (moduleLabel) return moduleLabel;
    return "ISO Standards · Library · Knowledge base";
  }, [resolvedContext, currentModule, routeModuleContext.currentModule]);

  // Dense AI module shells: keep launcher clear of bottom toolbars
  const isDenseAiShell = Boolean(
    pathname?.includes("/ai-assistant/iso-navigator") ||
      pathname?.includes("/ai-assistant/audit-lens") ||
      pathname?.includes("/ai-assistant/benchmark-ai"),
  );

  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userScrolledUpRef = useRef(false);
  const lastChatScrollTop = useRef(0);
  const sendingRef = useRef(false);
  const statusTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (!userScrolledUpRef.current) {
      container.scrollTop = container.scrollHeight;
      lastChatScrollTop.current = container.scrollHeight;
    }
  }, [chatHistory, isOpen, statusHint]);

  // Persist conversation across page navigations (same browser tab)
  useEffect(() => {
    persistChatHistory(chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    return () => {
      statusTimersRef.current.forEach((id) => window.clearTimeout(id));
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  const handleChatScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (container.scrollTop < lastChatScrollTop.current && distanceFromBottom > 60) {
      userScrolledUpRef.current = true;
    } else if (distanceFromBottom <= 60) {
      userScrolledUpRef.current = false;
    }
    lastChatScrollTop.current = container.scrollTop;
  };

  const streamAIMessage = (
    fullContent: string,
    sources?: string[],
    grounded?: boolean,
  ) => {
    let charIndex = 0;

    setChatHistory((prev) => [
      ...prev,
      {
        role: "ai",
        content: fullContent,
        displayedContent: "",
        isStreaming: true,
        sources: sources?.length ? sources : undefined,
        grounded,
      },
    ]);

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    streamIntervalRef.current = setInterval(() => {
      charIndex++;
      setChatHistory((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.isStreaming) {
          updated[lastIdx] = {
            ...updated[lastIdx],
            displayedContent: fullContent.slice(0, charIndex),
            isStreaming: charIndex < fullContent.length,
          };
        }
        return updated;
      });

      if (charIndex >= fullContent.length) {
        clearInterval(streamIntervalRef.current!);
        streamIntervalRef.current = null;
      }
    }, 12);
  };

  const clearStatusTimers = () => {
    statusTimersRef.current.forEach((id) => window.clearTimeout(id));
    statusTimersRef.current = [];
  };

  const handleProcess = async (overrideText?: string) => {
    const text = (overrideText ?? query).trim();
    if (!text || isProcessing || sendingRef.current) return;
    sendingRef.current = true;

    const userMsg: ChatMessage = { role: "user", content: text };
    const historyForSnippet = [...chatHistory, userMsg];
    setChatHistory((prev) => [...prev, userMsg]);
    userScrolledUpRef.current = false;
    setQuery("");
    setStatusHint(
      currentModule
        ? `Using ${currentModule} context…`
        : "Searching ISO Standards…",
    );
    clearStatusTimers();

    try {
      statusTimersRef.current.push(
        window.setTimeout(() => {
          setStatusHint("Checking relevant Library content…");
        }, 900),
      );
      statusTimersRef.current.push(
        window.setTimeout(() => {
          setStatusHint("Preparing response…");
        }, 2200),
      );

      const res = await chatSimple({
        messages: [{ content: userMsg.content }],
        context: {
          ...resolvedContext,
          conversationSnippet: buildConversationSnippet(historyForSnippet),
        },
        session_id: sessionId,
      }).unwrap();

      clearStatusTimers();
      setStatusHint(null);

      const payload = res?.data ?? res;
      const aiResponse =
        payload?.response ||
        payload?.messages?.[payload?.messages?.length - 1]?.content ||
        res?.messages?.[res.messages.length - 1]?.content ||
        "I received your message but couldn't generate a response.";

      const sources = Array.isArray(payload?.sources)
        ? payload.sources.filter(
            (s: unknown): s is string =>
              typeof s === "string" && s.trim().length > 0,
          )
        : [];

      streamAIMessage(
        aiResponse,
        sources,
        typeof payload?.grounded === "boolean" ? payload.grounded : undefined,
      );
    } catch (err: any) {
      clearStatusTimers();
      setStatusHint(null);
      const status = err?.status || err?.originalStatus;
      const message =
        status === 401 || status === 403
          ? "Please sign in to use Ask AI with your ISOBrain knowledge base."
          : "Sorry, I couldn't process that request right now. Please try again in a moment.";
      streamAIMessage(message, undefined, false);
    } finally {
      sendingRef.current = false;
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen && streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  };

  return (
    <div
      className={`fixed flex flex-col items-end pointer-events-none ${
        isDenseAiShell
          ? "bottom-20 right-4 sm:bottom-6 sm:right-6 z-[80]"
          : "bottom-6 right-6 z-[90]"
      }`}
    >
      <div className="pointer-events-auto flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] max-h-[calc(100vh-8rem)] bg-[#0A0F1C] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <Image src="/Icon.png" alt="Ask AI" width={24} height={24} />
                <div className="min-w-0">
                  <span className="font-bold text-white text-sm block">Ask AI</span>
                  <span className="text-[10px] text-gray-500 truncate block">
                    {contextBanner}
                  </span>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              onScroll={handleChatScroll}
              className="flex-1 p-4 overflow-y-auto custom-thin-scrollbar"
            >
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 bg-[#00f0ff]/10 rounded-full flex items-center justify-center mb-4">
                    <Image src="/Icon.png" alt="Ask AI" width={32} height={32} />
                  </div>
                  <h3 className="text-white font-bold mb-2">How can I help you today?</h3>
                  <p className="text-gray-400 text-sm">
                    {currentModule
                      ? `Ask about ${currentModule}, ISO standards, or Library content.`
                      : "Ask about ISOBrain modules, ISO standards, and Library content."}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    {(currentModule === "ISO Navigator"
                      ? [
                          "Tell me about the ISO Navigator.",
                          "How does it generate documents?",
                        ]
                      : currentModule === "Audit Lens"
                        ? [
                            "Tell me about Audit Lens.",
                            "What should I do on this page?",
                          ]
                        : currentModule === "Benchmark AI"
                          ? [
                              "Tell me about Benchmark AI.",
                              "How does benchmarking work here?",
                            ]
                          : currentModule === "ISOBrain Library" ||
                              Boolean(currentModule?.includes("Library"))
                            ? [
                                "What can I do here?",
                                t(
                                  "heroPills.pill2",
                                  "Explain ISO 27001 controls",
                                ),
                              ]
                            : [
                                t(
                                  "heroPills.pill1",
                                  "What are the requirements of ISO 9001?",
                                ),
                                t(
                                  "heroPills.pill2",
                                  "Explain ISO 27001 controls",
                                ),
                              ]
                    ).map((pill, i) => (
                      <button
                        key={i}
                        onClick={() => handleProcess(pill)}
                        className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-[11px] text-gray-300 text-left cursor-pointer"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#00f0ff] text-black rounded-tr-none font-medium max-w-[85%]"
                          : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none w-full"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1.5 prose-ul:my-2 prose-li:my-0.5 prose-ol:my-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              img: ({ node, ...props }) => (
                                <span className="block text-center my-2">
                                  <img
                                    {...props}
                                    className="inline-block max-w-full h-auto rounded-lg"
                                    alt={props.alt || "image"}
                                  />
                                </span>
                              ),
                              h1: ({ node, ...props }) => (
                                <h3 className="text-[#00f0ff] text-base font-bold" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h4 className="text-[#00f0ff] text-sm font-bold" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="text-[#00f0ff] text-sm font-semibold" {...props} />
                              ),
                              h4: ({ node, ...props }) => (
                                <h4 className="text-[#00f0ff] text-xs font-semibold" {...props} />
                              ),
                              code: ({ node, inline, ...props }: any) =>
                                inline ? (
                                  <code
                                    className="px-1 py-0.5 rounded bg-white/10 text-[12px] text-[#00f0ff]"
                                    {...props}
                                  />
                                ) : (
                                  <code
                                    className="block p-2 rounded-lg bg-black/40 text-[11px] overflow-x-auto"
                                    {...props}
                                  />
                                ),
                              table: ({ node, ...props }) => (
                                <div className="scrollable-table my-3 w-full rounded-xl border border-white/10 pb-2 overflow-x-auto">
                                  <table
                                    className="w-full text-left border-collapse text-xs md:text-sm"
                                    {...props}
                                  />
                                </div>
                              ),
                              th: ({ node, ...props }) => (
                                <th
                                  className="border-b border-white/20 px-2 py-2 bg-white/5 font-bold text-white break-normal"
                                  {...props}
                                />
                              ),
                              td: ({ node, ...props }) => (
                                <td
                                  className="border-b border-white/10 px-2 py-2 break-normal align-top"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {msg.displayedContent ?? msg.content}
                          </ReactMarkdown>
                          {msg.isStreaming && (
                            <span className="inline-block w-0.5 h-3.5 bg-[#00f0ff] ml-0.5 animate-pulse align-middle" />
                          )}
                          {!msg.isStreaming && msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-white/10">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Sources
                              </p>
                              <ul className="space-y-1">
                                {msg.sources.map((src, idx) => (
                                  <li
                                    key={idx}
                                    className="text-[11px] text-gray-400 leading-snug"
                                  >
                                    {src}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {!msg.isStreaming && (
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  toast.success("Copied to clipboard");
                                }}
                                className="text-[10px] border border-white/20 hover:border-[#00f0ff] hover:text-[#00f0ff] transition-colors rounded-full px-2 py-1 text-gray-400 font-medium cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))
              )}

              {(isProcessing || statusHint) && (
                <div className="flex justify-start mb-4">
                  <div className="p-3 rounded-2xl bg-white/5 text-gray-300 border border-white/10 rounded-tl-none">
                    <span className="flex items-center gap-2 text-[12px] text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </span>
                      {statusHint || "Thinking…"}
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5">
              <div className="flex items-center gap-2 bg-[#0A0F1C] border border-white/10 rounded-full px-3 py-1.5 focus-within:border-[#00f0ff]/50 transition-colors">
                <input
                  type="text"
                  placeholder={t(
                    "dynamic.dyn_askaboutISO42001_51",
                    "Ask about ISO compliance...",
                  )}
                  className="flex-1 bg-transparent border-none text-white px-2 py-1.5 focus:outline-none placeholder:text-gray-500 font-inter text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleProcess();
                  }}
                  disabled={isProcessing}
                />
                <button
                  onClick={() => handleProcess()}
                  disabled={isProcessing || !query.trim()}
                  className="w-8 h-8 rounded-full bg-[#00f0ff] text-black flex items-center justify-center shrink-0 disabled:opacity-50 transition-transform active:scale-90 cursor-pointer"
                >
                  <Send className="w-4 h-4 ml-[-2px]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleChat}
        className="w-14 h-14 bg-[#00f0ff] hover:bg-cyan-400 text-black rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50 cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
      </div>
    </div>
  );
}
