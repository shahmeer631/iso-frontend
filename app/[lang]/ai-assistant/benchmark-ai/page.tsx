"use client";

import ResultsPage from "@/components/AIAssistant/Banchmark/ResultPage";
import UploadPage from "@/components/AIAssistant/Banchmark/uploadPage";
import { ActivityTracker } from "@/components/activity/ActivityTracker";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearResults } from "@/lib/redux/features/benchmarkSlice";
import {
  useChatSimpleMutation,
  useGetBenchmarkChatSessionsQuery,
  useLazyGetBenchmarkChatHistoryQuery,
} from "@/lib/redux/api/benchmarkApi";
import { selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { BenchmarkChatHistoryItem } from "@/types/benchmark";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Award,
  BarChart,
  Brain,
  FileText,
  History,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  Sparkles,
  Type,
} from "lucide-react";

export default function BenchmarkAIPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { t } = useTranslation();
  const token = useSelector(selectCurrentToken);
  const { analysisResults } = useAppSelector((state) => state.benchmark);

  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [aiQ, setAiQ] = useState("");
  const [chatHistory, setChatHistory] = useState<BenchmarkChatHistoryItem[]>([]);
  const [chatSimple, { isLoading: aiLoading }] = useChatSimpleMutation();
  const { data: benchmarkSessions = [] } = useGetBenchmarkChatSessionsQuery(undefined, {
    skip: !token,
  });
  const [fetchBenchmarkHistory] = useLazyGetBenchmarkChatHistoryQuery();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  useEffect(() => {
    if (!isUserScrolledUp.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, aiLoading]);

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 80;
  };

  const handleReset = () => {
    dispatch(clearResults());
    setAnalyzing(false);
  };

  async function askAI() {
    if (!aiQ.trim() || aiLoading) return;
    const userMessage = aiQ.trim();
    setAiQ("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    isUserScrolledUp.current = false;

    try {
      const contextStr = analysisResults
        ? `ISO Compliance Benchmark Results for ${analysisResults.document_type_detected || "document"}.
Standard: ${analysisResults.standard_analyzed || "N/A"}.
Overall Score: ${analysisResults.overall_score ?? "N/A"} (Grade ${analysisResults.grade ?? "N/A"}).
Compliance: ${analysisResults.compliance_percentage ?? "N/A"}%, Effectiveness: ${analysisResults.effectiveness_percentage ?? "N/A"}%.
Strengths: ${analysisResults.strengths?.join(", ") ?? "N/A"}.
Key Gaps: ${analysisResults.identified_gaps?.map((g) => g.gap_title).join(", ") ?? "N/A"}.
Focus: opportunities for improvement and common non-conformity gaps vs the latest ISO Library edition.`
        : `ISO Compliance Benchmark Assistant. Help identify opportunities for improvement, potential gaps, and common non-conformities against the latest ISO Library standards.`;

      const response = await chatSimple({
        messages: [{ content: userMessage }],
        context: {
          purpose: "benchmark_ai",
          isoStandardId: analysisResults?.isoStandardId,
          benchmark_analysis_context: contextStr,
        },
        session_id: sessionId || undefined,
      }).unwrap();

      const aiResponse =
        response.messages?.[response.messages.length - 1]?.content ||
        response.response ||
        response.data?.response;

      if (aiResponse) {
        setChatHistory((prev) => [...prev, { role: "ai", content: String(aiResponse) }]);
        if (response.session_id) setSessionId(String(response.session_id));
      }
    } catch (error: any) {
      console.error("Benchmark chat failed", error);
      if (
        error?.status === 403 ||
        error?.data?.statusCode === 403 ||
        error?.data?.message?.includes("ULTRA plan")
      ) {
        toast.error(
          error?.data?.message ||
            "Please upgrade to the ULTRA plan to access this feature.",
        );
        router.push(`/${lang}/pricing`);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: "ai", content: "Sorry, I encountered an error. Please try again." },
        ]);
      }
    }
  }

  return (
    <div className="min-h-screen w-full space-y-6 bg-[var(--ib-bg)] p-2 animate-in fade-in duration-500 md:space-y-10 md:p-8">
      <ActivityTracker
        source="AI_TOOL"
        aiToolId="BENCHMARK_AI"
        resourceLabel="Benchmark AI"
        sessionKey="ai_benchmark"
      />

      <header className="mb-4 mt-10 space-y-4 px-2 sm:px-0 md:mb-8 md:mt-16">
        <div className="mb-4 flex justify-center md:mb-6">
          <div className="rounded-full border border-[var(--ib-acc)] bg-[var(--ib-accbg)] px-3 py-0.5 md:px-4 md:py-1">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--ib-acc)] md:text-[10px]">
              {t("benchmarkAi.badge")}
            </span>
          </div>
        </div>
        <h1 className="mb-4 text-center text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--ib-ink)] sm:text-5xl lg:text-[52px]">
          {t("benchmarkAi.title")}
        </h1>
        <p className="mx-auto mb-6 max-w-4xl text-center font-inter text-sm leading-relaxed text-[var(--ib-mute)] lg:text-lg">
          <span className="mb-2 block font-semibold text-[var(--ib-ink)]">
            {t("benchmarkAi.subtitle")}
          </span>
          {t("benchmarkAi.description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ib-line)] bg-[var(--ib-card)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ib-mute)] transition-colors hover:border-[var(--ib-acc)] hover:text-[var(--ib-acc)]"
          >
            {leftPanelCollapsed ? (
              <PanelLeftOpen className="size-3.5" aria-hidden />
            ) : (
              <PanelLeftClose className="size-3.5" aria-hidden />
            )}
            {leftPanelCollapsed ? "Show portal" : "Collapse portal"}
          </button>
          {token ? (
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ib-line)] bg-[var(--ib-card)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ib-mute)] transition-colors hover:border-[var(--ib-acc)] hover:text-[var(--ib-acc)]"
            >
              <History className="size-3.5" aria-hidden />
              {historyOpen ? "Hide history" : "Chat history"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setChatHistory([]);
              setSessionId("");
              setHistoryOpen(false);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ib-acc)]/30 bg-[var(--ib-accbg)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ib-acc)] transition-colors hover:border-[var(--ib-acc)]"
          >
            <Plus className="size-3.5" aria-hidden />
            New chat
          </button>
          {analysisResults ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ib-line)] bg-[var(--ib-card)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ib-mute)] transition-colors hover:border-[var(--ib-acc)] hover:text-[var(--ib-acc)]"
            >
              Reset analysis
            </button>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-4 md:gap-5 xl:grid-cols-12 xl:min-h-[640px]">
        <div className={`${leftPanelCollapsed ? "hidden" : "xl:col-span-4"} space-y-6`}>
          <UploadPage
            panelMode
            onAnalyze={() => setAnalyzing(false)}
            onAnalyzeStart={() => setAnalyzing(true)}
            onAnalyzeEnd={() => setAnalyzing(false)}
            hideChat
          />
        </div>

        <div
          className={`${leftPanelCollapsed ? "xl:col-span-12" : "xl:col-span-8"} min-w-0`}
        >
          {analyzing ? (
            <div className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-3xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-8 text-center shadow-2xl md:p-12">
              <div className="relative mb-10 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-[var(--ib-acc)]/10 border-t-[var(--ib-acc)]" />
                <Loader2 className="h-6 w-6 animate-spin text-[var(--ib-acc)]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[var(--ib-ink)] md:text-2xl">
                Generating Gap Analysis...
              </h3>
              <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-[var(--ib-mute)]">
                Retrieving relevant clauses and comparing them against the latest
                ISO Library edition…
              </p>
              <div className="mt-8 flex w-full max-w-[320px] flex-col gap-3">
                {[
                  "Uploading document",
                  "Analyzing context & suggestions",
                  "Generating report",
                  "Preparing interactive workspace",
                ].map((step) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-5 py-3 text-left"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[var(--ib-acc)]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--ib-ink)] md:text-[11px]">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : analysisResults ? (
            <ResultsPage
              result={analysisResults}
              onReset={handleReset}
              embedded
            />
          ) : (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-8 text-center shadow-2xl md:p-12">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-[var(--ib-line)] bg-[var(--ib-bg)] transition-all duration-500 hover:border-[var(--ib-acc)]/50">
                <FileText className="h-10 w-10 text-[var(--ib-mute)]" />
              </div>
              <h3 className="mb-4 text-xl font-black uppercase tracking-widest text-[var(--ib-ink)]">
                {t("benchmarkAi.readyForBenchmark")}
              </h3>
              <p className="mb-10 max-w-sm text-sm font-medium leading-relaxed text-[var(--ib-mute)]">
                {t("benchmarkAi.readyForBenchmarkDesc")}
              </p>
              <div className="grid w-full grid-cols-2 gap-4">
                {[
                  {
                    label: t("benchmarkAi.neuralOcr"),
                    sub: t("benchmarkAi.neuralOcrSub"),
                    icon: FileText,
                  },
                  {
                    label: t("benchmarkAi.gapLogic"),
                    sub: t("benchmarkAi.gapLogicSub"),
                    icon: Brain,
                  },
                  {
                    label: t("benchmarkAi.isoMatrix"),
                    sub: t("benchmarkAi.isoMatrixSub"),
                    icon: Award,
                  },
                  {
                    label: t("benchmarkAi.resolutionProtocol"),
                    sub: t("benchmarkAi.resolutionProtocolSub"),
                    icon: Type,
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-5 text-left transition-all hover:border-[var(--ib-acc)]/30"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <f.icon className="h-4 w-4 text-[var(--ib-ok)]" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--ib-ink)]">
                        {f.label}
                      </p>
                    </div>
                    <p className="text-[10px] font-medium leading-tight text-[var(--ib-mute)]">
                      {f.sub}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--ib-mute)]">
                <span className="inline-flex items-center gap-2">
                  <BarChart className="h-3.5 w-3.5 text-[var(--ib-ok)]" />
                  Latest ISO Library
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--ib-ok)]" />
                  OFI & gap focus
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 xl:mt-8">
        {token && historyOpen ? (
          <div className="mb-4 max-h-[240px] overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)]">
            <div className="border-b border-[var(--ib-line)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--ib-mute)]">
              Saved Benchmark AI chats
            </div>
            <div className="custom-thin-scrollbar max-h-[200px] overflow-y-auto p-2">
              {benchmarkSessions.length === 0 ? (
                <p className="px-3 py-4 text-xs text-[var(--ib-mute)]">
                  No saved chats yet.
                </p>
              ) : (
                benchmarkSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={async () => {
                      try {
                        const rows = await fetchBenchmarkHistory(session.id).unwrap();
                        const mapped: BenchmarkChatHistoryItem[] = (rows || []).map(
                          (m) => {
                            const raw =
                              typeof m.message === "string"
                                ? m.message
                                : String(m.message || "");
                            let content = raw;
                            try {
                              const parsed = JSON.parse(raw);
                              if (Array.isArray(parsed) && parsed[0]?.content) {
                                content = String(parsed[0].content);
                              } else if (parsed?.content) {
                                content = String(parsed.content);
                              }
                            } catch {
                              /* plain text */
                            }
                            return {
                              role:
                                m.role === "assistant" || m.role === "ai"
                                  ? "ai"
                                  : "user",
                              content,
                            };
                          },
                        );
                        setChatHistory(mapped);
                        setSessionId(session.id);
                        setHistoryOpen(false);
                        toast.success("Chat history loaded");
                      } catch {
                        toast.error("Could not load chat history");
                      }
                    }}
                    className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                      sessionId === session.id
                        ? "bg-[var(--ib-acc)]/15 text-[var(--ib-acc)]"
                        : "text-[var(--ib-ink)] hover:bg-[var(--ib-accbg)]"
                    }`}
                  >
                    <span className="line-clamp-2 font-semibold leading-snug">
                      {(session.title || "Benchmark AI chat").replace(
                        /^Benchmark AI\s*[—\-]\s*/i,
                        "",
                      ) || "Benchmark AI chat"}
                    </span>
                    <span className="mt-1 block text-[10px] text-[var(--ib-mute)]">
                      {session.updatedAt
                        ? new Date(session.updatedAt).toLocaleString()
                        : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-2xl">
          <div className="flex items-center gap-3 border-b border-[var(--ib-line)] bg-[var(--ib-bg)]/50 p-3 md:gap-4 md:p-6">
            <div className="rounded-xl bg-[var(--ib-accbg)] p-2 text-[var(--ib-acc)]">
              <Sparkles className="h-4 w-4 text-[var(--ib-acc)] md:h-5 md:w-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[var(--ib-ink)] md:text-base">
                {t("benchmarkAi.chatTitle")}
              </div>
              <p className="mt-0.5 text-[8px] font-black uppercase tracking-widest text-[var(--ib-mute)] md:mt-1">
                {t("benchmarkAi.chatDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-3 md:space-y-6 md:p-8">
            {(chatHistory.length > 0 || aiLoading) && (
              <div
                ref={chatContainerRef}
                onScroll={handleChatScroll}
                className="custom-thin-scrollbar flex max-h-[420px] min-h-[180px] w-full min-w-0 flex-col space-y-4 overflow-y-auto rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-4 md:p-6"
              >
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex min-w-0 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`min-w-0 max-w-full rounded-2xl p-4 text-sm font-medium leading-relaxed md:max-w-[85%] ${
                        msg.role === "user"
                          ? "rounded-tr-none bg-[var(--ib-acc)] text-white"
                          : "w-full rounded-tl-none border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-ink)]"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none w-full min-w-0">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: (props) => (
                              <span
                                className={`mb-3 block text-[12px] font-black uppercase tracking-wide md:text-[14px] ${
                                  msg.role === "user"
                                    ? "text-white"
                                    : "text-[var(--ib-ink)]"
                                }`}
                                {...props}
                              />
                            ),
                            h2: (props) => (
                              <span
                                className={`mb-2 mt-4 block text-[11px] font-black uppercase tracking-wide md:text-[13px] ${
                                  msg.role === "user"
                                    ? "text-white"
                                    : "text-[var(--ib-ink)]"
                                }`}
                                {...props}
                              />
                            ),
                            h3: (props) => (
                              <span
                                className={`mb-1.5 mt-3 block text-[10px] font-bold uppercase tracking-wide md:text-[12px] ${
                                  msg.role === "user"
                                    ? "text-white"
                                    : "text-[var(--ib-ink)]"
                                }`}
                                {...props}
                              />
                            ),
                            p: (props) => (
                              <p
                                className={`mb-2 text-xs leading-relaxed md:text-sm ${
                                  msg.role === "user"
                                    ? "font-semibold text-white"
                                    : "text-[var(--ib-ink)]"
                                }`}
                                {...props}
                              />
                            ),
                            ul: (props) => (
                              <ul
                                className={`mb-3 list-disc space-y-1 pl-4 ${
                                  msg.role === "user"
                                    ? "text-white"
                                    : "text-[var(--ib-ink)]"
                                }`}
                                {...props}
                              />
                            ),
                            ol: (props) => (
                              <ol
                                className={`mb-3 list-decimal space-y-1 pl-4 ${
                                  msg.role === "user"
                                    ? "text-white"
                                    : "text-[var(--ib-ink)]"
                                }`}
                                {...props}
                              />
                            ),
                            li: (props) => (
                              <li
                                className={`text-xs leading-relaxed md:text-sm ${
                                  msg.role === "user"
                                    ? "text-white"
                                    : "text-[var(--ib-ink)]"
                                }`}
                                {...props}
                              />
                            ),
                            strong: (props) => (
                              <strong
                                className={
                                  msg.role === "user"
                                    ? "font-bold text-white"
                                    : "font-bold text-[var(--ib-ink)]"
                                }
                                {...props}
                              />
                            ),
                            table: ({ ...props }) => (
                              <div className="my-4 w-full overflow-x-auto rounded-xl border border-[var(--ib-line)] pb-2">
                                <table
                                  className="w-full min-w-[500px] border-collapse text-left text-sm"
                                  {...props}
                                />
                              </div>
                            ),
                            th: ({ ...props }) => (
                              <th
                                className="border-b border-[var(--ib-line)] bg-[var(--ib-bg)] px-3 py-2 font-bold text-[var(--ib-ink)]"
                                {...props}
                              />
                            ),
                            td: ({ ...props }) => (
                              <td
                                className="border-b border-[var(--ib-line)] px-3 py-2 align-top text-[var(--ib-mute)]"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="animate-pulse rounded-2xl rounded-tl-none border border-[var(--ib-line)] bg-[var(--ib-card)] p-4">
                      <Loader2 className="animate-spin text-[var(--ib-acc)]" size={18} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            <div className="relative">
              <textarea
                className="min-h-[100px] w-full resize-none rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-5 pr-16 text-sm font-medium text-[var(--ib-ink)] placeholder-[var(--ib-mute)] transition-all focus:border-[var(--ib-acc)] focus:outline-none focus:ring-2 focus:ring-[var(--ib-acc)]/30 md:p-6"
                placeholder={t("benchmarkAi.chatPlaceholder")}
                value={aiQ}
                onChange={(e) => setAiQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    askAI();
                  }
                }}
              />
              <button
                onClick={askAI}
                disabled={!aiQ.trim() || aiLoading}
                className="absolute bottom-5 right-5 rounded-xl bg-[var(--ib-acc)] p-3 text-white shadow-lg transition-all hover:opacity-92 active:scale-95 disabled:opacity-50 md:bottom-6 md:right-6"
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
