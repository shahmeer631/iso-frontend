"use client";
// ResultsPage.tsx

import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { BenchmarkData } from "@/types/benchmark";
import {
  Eye,
  Brain,
  Search,
  Award,
  Upload,
  FileCheck,
  CheckCircle2,
  Lock,
  Type,
  BarChart,
  FileText,
  Loader2,
  Send,
  Bot,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { useChatSimpleMutation } from "@/lib/redux/api/benchmarkApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";

export default function ResultsPage({
  result,
  onReset,
}: {
  result: BenchmarkData;
  onReset: () => void;
}) {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';
  const { t } = useTranslation();

  // Sync i18n language with the URL [lang] param
  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  const STEPS = [
    { icon: Eye, label: "Scanned", sub: "OCR Extraction" },
    { icon: Brain, label: "Analyzed", sub: "Secure Processing" },
    { icon: Search, label: "Evaluation", sub: "Variance Analysis" },
    { icon: Award, label: "Grade Label", sub: "Optimization Roadmap" },
  ];

  const [chatSimple, { isLoading: aiLoading }] = useChatSimpleMutation();
  const [sessionId, setSessionId] = useState<string>(result.conversation_id || "bench_" + result.analysis_id);
  const [aiQ, setAiQ] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);

  useEffect(() => {
    if (!isUserScrolledUp.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, aiLoading]);

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isUserScrolledUp.current = (scrollHeight - scrollTop - clientHeight) > 80;
  };

  const scrollToBottom = (force = false) => {
    if (force || !isUserScrolledUp.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  async function askAI() {
    if (!aiQ.trim() || aiLoading) return;

    const userMessage = aiQ.trim();
    setAiQ("");
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    isUserScrolledUp.current = false;

    try {
      const contextStr = `ISO Compliance Benchmark Results for ${result.document_type_detected}. 
Standard: ${result.standard_analyzed}. 
Overall Score: ${result.overall_score} (Grade ${result.grade}).
Compliance: ${result.compliance_percentage}%, Effectiveness: ${result.effectiveness_percentage}%.
Strengths: ${result.strengths?.join(', ') ?? 'N/A'}.
Key Gaps: ${result.identified_gaps?.map(g => g.gap_title).join(', ') ?? 'N/A'}.`;

      const response = await chatSimple({
        messages: [{ content: userMessage }],
        context: {
          benchmark_analysis_context: contextStr
        },
        session_id: sessionId,
      }).unwrap();

      const aiResponse = response.messages?.[response.messages.length - 1]?.content || response.data?.response;

      if (aiResponse) {
        setChatHistory(prev => [...prev, { role: "ai", content: aiResponse }]);
        if (response.session_id) setSessionId(response.session_id);

        isUserScrolledUp.current = false;
        setTimeout(() => {
          scrollToBottom(true);
        }, 100);
      }
    } catch (error: any) {
      console.error("Benchmark chat failed", error);
      if (error?.status === 403 || error?.data?.statusCode === 403 || error?.data?.message?.includes("ULTRA plan")) {
        toast.error(error?.data?.message || "Please upgrade to the ULTRA plan to access this feature.");
        router.push(`/${lang}/pricing`);
      } else {
        setChatHistory(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again." }]);
      }
    }
  }

  const gradeColor =
    result.grade === "A"
      ? "text-emerald-500"
      : result.grade === "B"
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="min-h-screen bg-[#0A0F1C] space-y-8 md:space-y-12 animate-in fade-in duration-500 p-4 md:p-8">
      {/* Header */}
      <header className="space-y-4 px-2 sm:px-0 mb-12">
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1bg-[#00f0ff]/10 border border-brand-cyan/20 rounded-full">
            <span className="text-[#00f0ff] text-[10px] font-black uppercase tracking-[0.3em]">BENCHMARK RESULTS</span>
          </div>
        </div>
        <h1 className="space-grotesk text-5xl lg:text-[52px] font-semibold text-white leading-[1.1] tracking-tight text-center mb-8">
          Benchmark Diagnostic <span className="text-brand-cyan">Workspace</span>
        </h1>

        <p className="text-[#A1A1A6] text-sm lg:text-lg max-w-4xl mx-auto leading-relaxed text-center font-inter mb-12">
          Compare your document content directly against ISO compliance definitions.
        </p>
      </header>

      <div className="overflow-x-auto hidden md:block">
        <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border transition-all ${i === 3 ? "border-brand-cyanbg-[#00f0ff] text-[#0F111A]/10 text-white" : "border-[#1E293B] bg-[#131B2D] text-[#94A3B8]"}`}
            >
              <div
                className={`p-2 rounded-xl ${i === 3 ? "bg-brand-cyan text-[#0F111A]/20" : "bg-[#0A0F1C]"}`}
              >
                <s.icon
                  className={`w-5 h-5 ${i === 3 ? "text-brand-cyan" : "text-[#94A3B8]"}`}
                />
              </div>
              <span className="font-bold text-xs">
                {i + 1}. {s.label}
              </span>
              <span className="text-[10px] text-center font-medium opacity-80">
                {s.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* ── Sidebar ── */}
        <aside className="bg-[#131B2D] rounded-3xl border border-[#1E293B] shadow-2xl p-6 space-y-6 self-start">
          <div className="flex items-center gap-3">
            <div className="p-1.5bg-[#00f0ff] text-[#0F111A]/10 rounded-xl">
              <Upload className="w-4 h-4 text-brand-cyan" />
            </div>
            <h2 className="text-sm font-black text-[#F1F5F9] uppercase tracking-wider">
              Document Input
            </h2>
          </div>
          <div className="border-2 border-dashed border-[#1E293B] rounded-2xl p-6 text-center text-xs text-[#94A3B8] group hover:border-brand-cyan/50 transition-all">
            <Upload className="w-6 h-6 mx-auto mb-2 text-[#4B5563] group-hover:text-brand-cyan" />
            Click or drag files
            <br />
            <span className="text-[10px] font-medium opacity-80 text-[#94A3B8]">
              PDF format only
            </span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[#14B8A6]/5 border border-[#14B8A6]/20 rounded-xl">
            <FileCheck className="w-4 h-4 text-[#14B8A6]" />
            <div>
              <p className="text-[11px] font-black text-[#F1F5F9] line-clamp-1 uppercase tracking-wider">
                {result.document_type_detected}
              </p>
              <p className="text-[10px] text-[#14B8A6] font-black uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Scanned
              </p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em] mb-3">
              Improvement Goal
            </p>
            <div className="border border-[#1E293B] bg-[#0A0F1C] rounded-xl px-4 py-3 text-xs text-[#94A3B8] flex justify-between font-medium">
              <span className="line-clamp-1">Analyzed...</span>
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
            </div>
          </div>
          <button
            onClick={onReset}
            className="w-full py-4 rounded-xlbg-[#00f0ff] text-[#0F111A] text-white hover:bg-[#3433D6] text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Reset Analysis</span>
          </button>
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 text-xs text-green-700 flex items-start gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span>Analysis Complete</span>
          </div>
          <button
            onClick={onReset}
            className="w-full text-xs text-[#64748B] hover:text-brand-cyan underline transition-colors font-medium"
          >
            Analyze another document
          </button>
          <div className="text-[10px] text-[#94A3B8] space-y-2 pt-4 border-t border-[#1E293B] font-medium">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-blue-500" />
              <span>Processed Securely</span>
            </div>
            <div className="flex items-center gap-2">
              <Type className="w-3 h-3 text-blue-500" />
              <span>OCR Tech Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="w-3 h-3 text-blue-500" />
              <span>ISO Requirements Sandbox</span>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="space-y-5">
          {/* Score overview */}
          <div className="bg-[#131B2D] rounded-3xl border border-[#1E293B] shadow-2xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32bg-[#00f0ff] text-[#0F111A]/5 blur-[60px] rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
              {[
                {
                  label: "Overall Score",
                  value: result.overall_score,
                  color: gradeColor,
                  bar: "bg-amber-400",
                  extra: (
                    <span
                      className={`text-sm font-extrabold ${gradeColor} mt-1 block`}
                    >
                      Grade {result.grade}
                    </span>
                  ),
                },
                {
                  label: "Completeness",
                  value: result.compliance_percentage,
                  color: "text-blue-600",
                  bar: "bg-blue-600",
                },
                {
                  label: "Effectiveness",
                  value: result.effectiveness_percentage,
                  color: "text-violet-600",
                  bar: "bg-violet-600",
                },
              ].map(({ label, value, color, bar, extra }) => (
                <div key={label} className="space-y-1">
                  <p className="text-[10px] text-[#4B5563] font-black uppercase tracking-[0.3em]">
                    {label}
                  </p>
                  <span className={`text-4xl md:text-5xl lg:text-6xl font-black ${color} font-jetbrains-mono tracking-tighter`}>
                    {value}%
                  </span>
                  {extra}
                  <div className="w-full bg-[#0A0F1C] rounded-full h-2 mt-4">
                    <div
                      className={`${bar} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-[#1E293B] flex flex-wrap gap-4 md:gap-8 text-[10px] md:text-xs text-[#64748B] font-medium">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                <span>
                  <b className="text-[#F1F5F9]">Protocol:</b>{" "}
                  {result.document_type_detected}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-brand-cyan" />
                <span>
                  <b className="text-[#F1F5F9]">ISO Standards:</b> {result.standard_analyzed}
                </span>
              </div>
            </div>
          </div>

          {/* Clause compliance */}
          <div className="bg-[#131B2D] rounded-3xl border border-[#1E293B] shadow-2xl p-6 md:p-10">
            <h3 className="text-xl font-black text-[#F1F5F9] uppercase tracking-widest mb-10 border-l-4 border-brand-cyan pl-6">
              Neural Compliance Matrix
            </h3>
            <div className="space-y-8">
              {(result.clause_compliance ?? []).map((c) => (
                <div key={c.clause_number} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-sm md:text-base font-bold text-[#F1F5F9]">
                        {c.clause_number} {c.clause_title}
                      </span>
                      <p className="text-xs text-[#94A3B8] font-medium italic">
                        Evidence: {c.evidence_found}
                      </p>
                      <p className="text-xs text-red-400 font-medium">
                        Gap: {c.gap_description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider px-2 md:px-3 py-1 rounded-lg border ${c.status === "Conforming" ? "bg-emerald-100/10 text-emerald-400 border-emerald-500/20" :
                          c.status === "Major Gap" ? "bg-red-100/10 text-red-400 border-red-500/20" :
                            "bg-amber-100/10 text-amber-400 border-amber-500/20"
                          }`}
                      >
                        {c.status === "Conforming" ? "Conforming" :
                          c.status === "Major Gap" ? "Major Gap" :
                            "Minor Gap"
                        }
                      </span>
                      <span className="text-sm md:text-base font-black text-[#F1F5F9] w-10 md:w-12 text-right">
                        {c.compliance_percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#0A0F1C] rounded-full h-2">
                    <div
                      className={`${c.status === "Conforming" ? "bg-emerald-500" :
                        c.status === "Major Gap" ? "bg-red-500" :
                          "bg-amber-400"
                        } h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${c.compliance_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Strengths",
                icon: CheckCircle2,
                iconColor: "text-emerald-500",
                bgColor: "bg-emerald-50/5",
                border: "border-emerald-500/10",
                bullet: CheckCircle,
                bulletColor: "text-emerald-500",
                items: result.strengths,
              },
              {
                title: "Identified Gaps",
                icon: AlertTriangle,
                iconColor: "text-red-500",
                bgColor: "bg-red-50/5",
                border: "border-red-500/10",
                bullet: AlertTriangle,
                bulletColor: "text-red-500",
                items: (result.identified_gaps ?? []).map(g => `${g.clause_reference}: ${g.gap_title} - ${g.gap_description}`),
              },
            ].map(
              ({
                title,
                icon: Icon,
                iconColor,
                bgColor,
                border,
                bullet: Bullet,
                bulletColor,
                items,
              }) => (
                <div
                  key={title}
                  className={`bg-[#131B2D] rounded-3xl border ${border} shadow-2xl p-6 space-y-6`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 ${bgColor} rounded-xl`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <h4 className="text-base font-black text-[#F1F5F9] uppercase tracking-wider">
                      {title}
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {(items ?? []).map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-[#94A3B8] font-medium leading-relaxed"
                      >
                        <Bullet
                          className={`${bulletColor} w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 shrink-0`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-[#131B2D] rounded-3xl border border-[#1E293B] shadow-2xl p-6 md:p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-2bg-[#00f0ff] text-[#0F111A]/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-brand-cyan" />
              </div>
              <h3 className="text-xl font-black text-[#F1F5F9] uppercase tracking-widest">
                Optimization Roadmap
              </h3>
            </div>
            <div className="space-y-4">
              {(result.recommendations ?? []).map((r, i) => (
                <div
                  key={i}
                  className="border border-[#1E293B] rounded-2xl p-4 md:p-6 bg-[#0A0F1C]/50 transition-all hover:border-brand-cyan/30 hover:shadow-md group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-black text-xs">
                        {i + 1}
                      </div>
                      <span
                        className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider px-2 md:px-3 py-1 rounded-lg ${r.priority === "High Priority" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          r.priority === "Medium Priority" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                      >
                        {r.priority}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-[#94A3B8] bg-[#0A0F1C] px-2 md:px-3 py-1 rounded-lg border border-[#1E293B]">
                      Clause {r.clause_reference}
                    </span>
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-[#F1F5F9] mb-2 group-hover:text-brand-cyan transition-colors">
                    {r.title}
                  </h4>
                  <p className="text-xs md:text-sm text-[#94A3B8] font-medium leading-relaxed mb-4">
                    <span className="font-bold text-[#F1F5F9]">
                      Recommendation:{" "}
                    </span>
                    {r.description}
                  </p>
                  <div className="flex items-start gap-2 md:gap-3 bg-[#0A0F1C] border border-[#1E293B] rounded-xl p-3 md:p-4 shadow-sm">
                    <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] md:text-xs text-[#94A3B8] font-medium">
                      <span className="font-bold text-[#F1F5F9]">
                        Benefit:{" "}
                      </span>
                      {r.benefit_statement}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ask AI */}
          <div className="mt-12 bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-5 md:p-6 flex items-center gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50">
              <div className="p-2 bg-[#00f0ff] text-[#0F111A]/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-base md:text-lg font-black text-[#F1F5F9] uppercase tracking-wider">
                  Interactive compliance AI Chat
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8 space-y-6 max-w-[94.5vw] sm:max-w-[80vw] md:max-w-[90vw] lg:max-w-[99vw]">
              {(chatHistory.length > 0 || aiLoading) && (
                <div
                  ref={chatContainerRef}
                  onScroll={handleChatScroll}
                  className="w-full min-w-0 bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-6 overflow-y-auto max-h-[400px] flex flex-col space-y-6 custom-thin-scrollbar animate-in slide-in-from-bottom-4 duration-300"
                >
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} min-w-0`}
                    >
                      <div
                        className={`max-w-full md:max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed min-w-0 ${msg.role === "user"
                          ? "bg-[#67E8F9] text-[#0F111A] rounded-tr-none shadow-[0_4px_15px_-3px_rgba(103,232,249,0.35)]"
                          : "bg-[#131B2D] border border-[#1E293B] text-[#F1F5F9] rounded-tl-none w-full"
                          }`}
                      >
                        <div className="max-w-none prose prose-invert prose-sm w-full min-w-0">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: (props) => <span className={`block font-black mb-3 uppercase tracking-wide text-[10px] sm:text-[12px] md:text-[14px] ${msg.role === "user" ? "text-black font-bold" : "text-white font-bold"}`} {...props} />,
                              h2: (props) => <span className={`block font-black mt-4 mb-2 uppercase tracking-wide text-[9px] sm:text-[11px] md:text-[13px] ${msg.role === "user" ? "text-black font-bold" : "text-white font-bold"}`} {...props} />,
                              h3: (props) => <span className={`block font-bold mt-3 mb-1.5 uppercase tracking-wide text-[8px] sm:text-[10px] md:text-[12px] ${msg.role === "user" ? "text-black" : "text-white"}`} {...props} />,
                              p: (props) => <p className={`mb-2 text-[10px] sm:text-xs md:text-sm leading-relaxed ${msg.role === "user" ? "text-black font-semibold" : "text-gray-300"}`} {...props} />,
                              ul: (props) => <ul className={`list-disc pl-4 mb-3 space-y-1 ${msg.role === "user" ? "text-black" : "text-gray-100"}`} {...props} />,
                              ol: (props) => <ol className={`list-decimal pl-4 mb-3 space-y-1 ${msg.role === "user" ? "text-black" : "text-gray-100"}`} {...props} />,
                              li: (props) => <li className={`text-[10px] sm:text-xs md:text-sm leading-relaxed ${msg.role === "user" ? "text-black" : "text-gray-100"}`} {...props} />,
                              table: ({ ...props }) => (
                                <div className="scrollable-table my-4 w-full overflow-x-auto rounded-xl border border-white/10 pb-2">
                                  <table className="w-full text-left border-collapse text-sm md:text-base min-w-[500px]" {...props} />
                                </div>
                              ),
                              th: ({ ...props }) => <th className="border-b border-white/20 px-3 py-2 md:px-4 md:py-3 bg-white/5 font-bold text-white break-normal" {...props} />,
                              td: ({ ...props }) => <td className="border-b border-white/10 px-3 py-2 md:px-4 md:py-3 break-normal align-top text-gray-300" {...props} />,
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
                      <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-none animate-pulse">
                        <Loader2 className="animate-spin text-brand-cyan" size={18} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              <div className="relative">
                <textarea
                  className="w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-6 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#67E8F9]/30 focus:border-[#67E8F9] transition-all min-h-[100px] resize-none font-medium text-[#F1F5F9] placeholder-[#4B5563]"
                  placeholder="Ask any question about compliance, standards, or how to improve..."
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
                  className="absolute bottom-6 right-6 p-3 bg-[#67E8F9] text-[#0F111A] rounded-xl hover:bg-[#22D3EE] disabled:opacity-50 transition-all shadow-lg active:scale-95"
                >
                  <Send className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .prose tr:nth-child(even) {
          background-color: #1e293b;
        }

        .prose th {
          background-color: #0f172a;
        }
      `}</style>
    </div>
  );
}
