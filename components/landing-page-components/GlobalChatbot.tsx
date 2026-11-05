"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { X, MessageCircle, Send, Maximize2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useChatSimpleMutation } from "@/lib/redux/api/auditLensApi";
import { useAskAiPageContext } from "@/components/ask-ai/AskAiPageContext";
import { ActivityTracker } from "@/components/activity/ActivityTracker";
import type { AiToolId } from "@/lib/redux/api/activityApi";
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() =>
    loadPersistedChatHistory(),
  );
  const [sessionId] = useState(() => createClientSessionId());
  const [statusHint, setStatusHint] = useState<string | null>(null);
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);
  const [dynamicQuestionsLoading, setDynamicQuestionsLoading] = useState(false);
  const [chatSimple, { isLoading: isProcessing }] = useChatSimpleMutation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { context: pageContext } = useAskAiPageContext();
  const reduceMotion = useReducedMotion();
  const greetingVisible = showGreeting && !isOpen;

  const urlStandardId = useMemo(
    () => extractLibraryStandardId(pathname),
    [pathname],
  );
  const urlDocumentId = useMemo(() => extractDocumentId(pathname), [pathname]);

  // Soft retrieval prefs: ONLY when the user is viewing a specific standard/document
  // (published via AskAiPageContext or URL id). Never inject Navigator/Audit form state.
  const urlClause =
    searchParams.get("clause") ||
    searchParams.get("clauseId") ||
    pageContext.clause ||
    undefined;

  const resolvedContext = useMemo(() => {
    const isoStandardId =
      pageContext.isoStandardId || urlStandardId || undefined;
    const documentId = pageContext.documentId || urlDocumentId || undefined;
    // Titles/codes only when a concrete document/standard is selected — not page workflow.
    const standardTitle =
      isoStandardId || documentId ? pageContext.standardTitle : undefined;
    const standardCode =
      isoStandardId || documentId ? pageContext.standardCode : undefined;
    const standardVersion =
      isoStandardId || documentId ? pageContext.standardVersion : undefined;

    return {
      purpose: "universal_ask" as const,
      ...(isoStandardId ? { isoStandardId } : {}),
      ...(standardTitle ? { standardTitle } : {}),
      ...(standardCode ? { standardCode } : {}),
      ...(standardVersion ? { standardVersion } : {}),
      ...(urlClause ? { clause: urlClause } : {}),
      ...(documentId ? { documentId } : {}),
    };
  }, [pageContext, urlStandardId, urlDocumentId, urlClause]);

  const contextBanner = useMemo(() => {
    if (resolvedContext.standardTitle || resolvedContext.isoStandardId) {
      const title = resolvedContext.standardTitle || "Selected ISO standard";
      return resolvedContext.clause
        ? `${title} · Clause ${resolvedContext.clause}`
        : title;
    }
    return "ISOBrain Ask AI · Library standards & documents";
  }, [resolvedContext]);

  const activityToolId = useMemo((): AiToolId => {
    if (pathname?.includes("/academy")) return "ACADEMY_CHAT";
    if (
      pathname?.includes("/library") ||
      resolvedContext.isoStandardId ||
      resolvedContext.documentId
    ) {
      return "LIBRARY_CHAT";
    }
    return "UNIVERSAL_ASK";
  }, [pathname, resolvedContext.isoStandardId, resolvedContext.documentId]);

  // When a standard is open, load starter questions grounded in THAT document only.
  useEffect(() => {
    const standardId = resolvedContext.isoStandardId;
    if (!standardId || !/^[a-fA-F0-9]{24}$/.test(standardId)) {
      setDynamicQuestions([]);
      setDynamicQuestionsLoading(false);
      return;
    }

    let cancelled = false;
    setDynamicQuestionsLoading(true);
    setDynamicQuestions([]);

    (async () => {
      try {
        const res = await chatSimple({
          messages: [
            {
              content:
                "Generate five document-grounded starter questions for this standard.",
            },
          ],
          context: {
            purpose: "universal_ask",
            task: "document_starter_questions",
            isoStandardId: standardId,
            ...(resolvedContext.standardTitle
              ? { standardTitle: resolvedContext.standardTitle }
              : {}),
          },
          session_id: sessionId,
        }).unwrap();

        if (cancelled) return;
        const payload = res?.data ?? res;
        const fromFollowups = Array.isArray(payload?.suggested_followups)
          ? payload.suggested_followups.map((q: unknown) =>
              String(q || "").trim(),
            )
          : [];
        const lines = String(payload?.response || "")
          .split("\n")
          .map((l: string) =>
            l
              .replace(/^[\d\.\-\*]+\s*/, "")
              .replace(/^"|"$/g, "")
              .trim(),
          )
          .filter((l: string) => l.length > 20);
        const cleaned = [...fromFollowups, ...lines]
          .map((q) => String(q || "").trim())
          .filter(
            (q, i, arr) =>
              q.length >= 20 &&
              !/^what is iso\b/i.test(q) &&
              !/^what are the benefits\b/i.test(q) &&
              arr.findIndex(
                (x) =>
                  x.toLowerCase().slice(0, 60) === q.toLowerCase().slice(0, 60),
              ) === i,
          )
          .slice(0, 5);
        if (!cancelled) setDynamicQuestions(cleaned);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      } finally {
        if (!cancelled) setDynamicQuestionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    resolvedContext.isoStandardId,
    resolvedContext.standardTitle,
    chatSimple,
    sessionId,
  ]);

  // Dense AI module shells: keep launcher clear of bottom toolbars
  const isDenseAiShell = Boolean(
    pathname?.includes("/ai-assistant/iso-navigator") ||
      pathname?.includes("/ai-assistant/audit-lens") ||
      pathname?.includes("/ai-assistant/benchmark-ai"),
  );

  // Marketing sticky nav is z-[100] and ~66px tall — reserve top inset so the
  // panel header never paints under it (and raise chat above nav stacking).
  const hasMarketingNav = Boolean(
    pathname &&
      !pathname.includes("/auth") &&
      !pathname.includes("/dashboard") &&
      !pathname.includes("/profile") &&
      !pathname.includes("/ai-assistant"),
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
    setStatusHint("Searching uploaded documents…");
    clearStatusTimers();

    try {
      statusTimersRef.current.push(
        window.setTimeout(() => {
          setStatusHint("Retrieving relevant sections…");
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
    setShowGreeting(false);
    setIsOpen((open) => {
      if (open) setIsMaximized(false);
      return !open;
    });
    if (isOpen && streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  };

  const closeChat = () => {
    setShowGreeting(false);
    setIsMaximized(false);
    setIsOpen(false);
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  };

  const toggleMaximize = () => {
    setIsMaximized((v) => !v);
  };

  const openGreeting = () => {
    if (!isOpen) setShowGreeting(true);
  };

  const closeGreeting = () => setShowGreeting(false);

  useEffect(() => {
    if (!isMaximized) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMaximized]);

  // DP World–style: mid-viewport right dock; panel expands/maximizes from there.
  // Avoid bottom-corner FAB so Ask AI stays visible while scrolling.
  const panelMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, x: 28, scale: 0.96 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 18, scale: 0.97 },
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
      };

  const shellOffsetY = hasMarketingNav
    ? "top-[min(48%,calc(50%+12px))]"
    : "top-1/2";
  const denseNudge = isDenseAiShell ? "max-sm:-translate-y-[18%]" : "";

  // Panel is viewport-fixed (not inside a transformed parent) so maximize
  // can use the full screen and docked mode stays under the marketing nav.
  const dockedPanelClass = hasMarketingNav
    ? "pointer-events-auto fixed right-3 top-[4.85rem] z-[120] h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] sm:right-4 sm:w-[440px]"
    : "pointer-events-auto fixed right-3 top-4 z-[120] h-[min(560px,calc(100dvh-6rem))] w-[calc(100vw-1.5rem)] sm:right-4 sm:w-[440px]";

  const maximizedPanelClass =
    "pointer-events-auto fixed inset-3 z-[130] h-auto w-auto max-w-none sm:inset-4 md:inset-6";

  return (
    <>
      <ActivityTracker
        source="AI_TOOL"
        enabled={isOpen}
        aiToolId={activityToolId}
        documentId={resolvedContext.documentId}
        isoStandardId={resolvedContext.isoStandardId}
        resourceLabel={
          resolvedContext.standardTitle || contextBanner || "Ask AI"
        }
        sessionKey={`ai_${activityToolId}`}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="ask-ai-panel"
            {...panelMotion}
            style={{ transformOrigin: "bottom right" }}
            className={`chatbot-panel flex flex-col overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] shadow-[0_28px_64px_-22px_rgba(11,18,32,0.5)] transition-[inset,width,height,max-width] duration-300 ease-out ${
              isMaximized ? maximizedPanelClass : dockedPanelClass
            }`}
            role="dialog"
            aria-label="Ask AI chat"
            aria-modal={isMaximized}
          >
            <div className="relative z-[1] flex shrink-0 items-center justify-between gap-3 border-b border-[var(--ib-line)] bg-[linear-gradient(180deg,var(--ib-card)_0%,color-mix(in_srgb,var(--ib-card)_88%,var(--ib-accbg))_100%)] px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)]">
                  <Image src="/Icon.png" alt="" width={22} height={22} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[13px] font-bold leading-tight text-[var(--ib-ink)] sm:text-sm">
                    Ask AI
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] leading-tight text-[var(--ib-mute)]">
                    {contextBanner}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={toggleMaximize}
                  aria-label={
                    isMaximized ? "Restore Ask AI chat size" : "Maximize Ask AI chat"
                  }
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-[var(--ib-mute)] transition-colors hover:bg-[var(--ib-accbg)] hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                >
                  {isMaximized ? (
                    <Minimize2 className="size-4" aria-hidden />
                  ) : (
                    <Maximize2 className="size-4" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  aria-label="Close Ask AI chat"
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-[var(--ib-mute)] transition-colors hover:bg-[var(--ib-accbg)] hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              onScroll={handleChatScroll}
              className="custom-thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
            >
              {chatHistory.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--ib-acc)_16%,var(--ib-line))] bg-[var(--ib-accbg)]">
                    <Image src="/Icon.png" alt="" width={32} height={32} />
                  </div>
                  <h3 className="chat-greeting-text mb-2 text-[15px] font-bold leading-snug tracking-[-0.01em]">
                    How can I help you today?
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--ib-mute)]">
                    Ask a question about any uploaded standard or Library document.
                    {!resolvedContext.isoStandardId
                      ? " Tip: open a standard in the Library first for document-specific suggestions."
                      : ""}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    {dynamicQuestions.length > 0
                      ? dynamicQuestions.map((pill, i) => (
                          <button
                            key={i}
                            onClick={() => handleProcess(pill)}
                            className="px-3 py-1.5 rounded-full border border-[var(--ib-line)] bg-[var(--ib-card)] hover:bg-[var(--ib-accbg)] transition-colors text-[11px] text-[var(--ib-mute)] text-left cursor-pointer"
                          >
                            {pill}
                          </button>
                        ))
                      : dynamicQuestionsLoading && resolvedContext.isoStandardId
                        ? (
                            <span className="text-[11px] text-[var(--ib-mute)]">
                              Generating questions from the open document…
                            </span>
                          )
                        : (
                            <span className="text-[11px] text-[var(--ib-mute)] max-w-[280px]">
                              Example: “What does clause 7.5 say about documented information in ISO 45001?”
                            </span>
                          )}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-2xl p-3 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "max-w-[85%] rounded-tr-sm bg-[var(--ib-acc)] font-medium text-white"
                          : "w-full max-w-full rounded-tl-sm border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-mute)]"
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
                                <h3 className="text-[var(--ib-acc)] text-base font-bold" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h4 className="text-[var(--ib-acc)] text-sm font-bold" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="text-[var(--ib-acc)] text-sm font-semibold" {...props} />
                              ),
                              h4: ({ node, ...props }) => (
                                <h4 className="text-[var(--ib-acc)] text-xs font-semibold" {...props} />
                              ),
                              code: ({ node, inline, ...props }: any) =>
                                inline ? (
                                  <code
                                    className="px-1 py-0.5 rounded bg-[var(--ib-accbg)] text-[12px] text-[var(--ib-acc)]"
                                    {...props}
                                  />
                                ) : (
                                  <code
                                    className="block p-2 rounded-lg bg-black/40 text-[11px] overflow-x-auto"
                                    {...props}
                                  />
                                ),
                              table: ({ node, ...props }) => (
                                <div className="scrollable-table my-3 w-full rounded-xl border border-[var(--ib-line)] pb-2 overflow-x-auto">
                                  <table
                                    className="w-full text-left border-collapse text-xs md:text-sm"
                                    {...props}
                                  />
                                </div>
                              ),
                              th: ({ node, ...props }) => (
                                <th
                                  className="border-b border-white/20 px-2 py-2 bg-[var(--ib-card)] font-bold text-[var(--ib-ink)] break-normal"
                                  {...props}
                                />
                              ),
                              td: ({ node, ...props }) => (
                                <td
                                  className="border-b border-[var(--ib-line)] px-2 py-2 break-normal align-top"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {msg.displayedContent ?? msg.content}
                          </ReactMarkdown>
                          {msg.isStreaming && (
                            <span className="inline-block w-0.5 h-3.5 bg-[var(--ib-acc)] ml-0.5 animate-pulse align-middle" />
                          )}
                          {!msg.isStreaming && msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-[var(--ib-line)]">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ib-mute)] mb-1.5">
                                Sources
                              </p>
                              <ul className="space-y-1">
                                {msg.sources.map((src, idx) => (
                                  <li
                                    key={idx}
                                    className="text-[11px] text-[var(--ib-mute)] leading-snug"
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
                                className="text-[10px] border border-white/20 hover:border-[var(--ib-acc)] hover:text-[var(--ib-acc)] transition-colors rounded-full px-2 py-1 text-[var(--ib-mute)] font-medium cursor-pointer"
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
                  <div className="p-3 rounded-2xl bg-[var(--ib-card)] text-[var(--ib-mute)] border border-[var(--ib-line)] rounded-tl-none">
                    <span className="flex items-center gap-2 text-[12px] text-[var(--ib-mute)]">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 bg-[var(--ib-acc)] rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-[var(--ib-acc)] rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-[var(--ib-acc)] rounded-full animate-bounce"
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

            <div className="shrink-0 border-t border-[var(--ib-line)] bg-[var(--ib-card)] p-3">
              <div className="flex items-center gap-2 rounded-full border border-[var(--ib-line)] bg-[var(--ib-bg)] px-3 py-1.5 transition-colors focus-within:border-[color-mix(in_srgb,var(--ib-acc)_45%,var(--ib-line))] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--ib-acc)_14%,transparent)]">
                <input
                  type="text"
                  placeholder="Ask a question about an uploaded document…"
                  className="min-w-0 flex-1 border-none bg-transparent px-2 py-1.5 font-inter text-sm text-[var(--ib-ink)] outline-none placeholder:text-[var(--ib-mute)]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleProcess();
                  }}
                  disabled={isProcessing}
                  aria-label="Ask a question about an uploaded document"
                />
                <button
                  type="button"
                  onClick={() => handleProcess()}
                  disabled={isProcessing || !query.trim()}
                  aria-label="Send message"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--ib-acc)] text-white transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                >
                  <Send className="ml-[-2px] size-4" aria-hidden />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mid-right peek — only when chat is closed (panel header owns close/maximize) */}
      {!isOpen && (
        <div
          className={`pointer-events-none fixed right-0 z-[120] ${shellOffsetY} -translate-y-1/2 ${denseNudge}`}
        >
          <div className="pointer-events-auto relative flex w-[min(440px,calc(100vw-0.75rem))] flex-col items-end">
            <div className="relative z-50 flex w-full items-center justify-end">
              <button
                type="button"
                onClick={toggleChat}
                onMouseEnter={openGreeting}
                onMouseLeave={closeGreeting}
                onFocus={openGreeting}
                onBlur={closeGreeting}
                aria-label="Ask AI"
                aria-expanded={false}
                className="ask-ai-peek group flex h-16 translate-x-1 cursor-pointer items-center gap-3.5 rounded-l-full border border-r-0 border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] bg-[var(--ib-acc)] pl-5 pr-3 text-white shadow-[0_20px_48px_-14px_color-mix(in_srgb,var(--ib-acc)_78%,transparent)] ring-1 ring-white/20 transition-[transform,box-shadow,background-color] duration-300 ease-out hover:translate-x-0 hover:bg-[color-mix(in_srgb,var(--ib-acc)_92%,#0B1530)] hover:shadow-[0_24px_56px_-12px_color-mix(in_srgb,var(--ib-acc)_85%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
              >
                <span className="ask-ai-peek-label whitespace-nowrap text-[15px] font-bold tracking-[-0.015em] sm:text-[16px]">
                  Ask AI
                </span>
                <span
                  className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/30"
                  aria-hidden
                >
                  <span className="ask-ai-orb absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.35),transparent_50%)] opacity-95" />
                  <MessageCircle className="relative z-[1] size-6" />
                </span>
              </button>

              <AnimatePresence>
                {greetingVisible && (
                  <motion.div
                    key="chat-greeting"
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 6 }}
                    transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
                    className="pointer-events-none absolute right-[4.75rem] top-1/2 z-10 -translate-y-1/2"
                    aria-hidden
                  >
                    <div className="chat-greeting-bubble relative flex h-10 items-center rounded-full border border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))] bg-[var(--ib-card)] px-3.5 shadow-[0_12px_32px_-12px_rgba(11,18,32,0.38)]">
                      <p className="chat-greeting-text relative z-[1] m-0 whitespace-nowrap text-[12px] font-semibold leading-none tracking-[-0.01em] sm:text-[12.5px]">
                        How can I help you today?
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
