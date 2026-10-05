"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { X, MessageCircle, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useChatSimpleMutation } from "@/lib/redux/api/auditLensApi";
import { useAskAiPageContext } from "@/components/ask-ai/AskAiPageContext";
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
    return "Document chat · uploaded standards & Library";
  }, [resolvedContext]);

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
                            className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-[11px] text-gray-300 text-left cursor-pointer"
                          >
                            {pill}
                          </button>
                        ))
                      : dynamicQuestionsLoading && resolvedContext.isoStandardId
                        ? (
                            <span className="text-[11px] text-gray-500">
                              Generating questions from the open document…
                            </span>
                          )
                        : (
                            <span className="text-[11px] text-gray-500 max-w-[280px]">
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
                  placeholder="Ask a question about an uploaded document…"
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
