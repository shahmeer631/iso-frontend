"use client";

// UploadPage.tsx



import { useEffect, useRef, useState } from "react";

import { useRouter, useParams } from 'next/navigation';

import { toast } from 'sonner';

import {

  Eye,

  Brain,

  Search,

  Award,

  Upload,

  FileCheck,

  Lock,

  Type,

  BarChart,

  Lightbulb,

  Bot,

  Loader2,

  FileText,

  CheckCircle2,

  Sparkles,

  MessageSquare,

  Send,

  Info,

  X,

  Target,

  ClipboardList,

  Pin,

  File as FileIcon,

  AlertTriangle,

  Pencil

} from "lucide-react";

import {

  useAnalyzeFileMutation,

  useAnalyzeTextMutation,

  useChatSimpleMutation,

  useGetISOSuggestionsMutation,

} from "@/lib/redux/api/benchmarkApi";

import { useAppDispatch } from "@/lib/redux/hooks";

import { setAnalysisResults } from "@/lib/redux/features/benchmarkSlice";

import { BenchmarkTextRequest } from "@/types/benchmark";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import TypewriterMarkdown from "@/components/Shared/TypewriterMarkdown";

import FullPageLoader from "@/components/Shared/FullPageLoader";

import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";


import { ISOSuggestion } from "@/types/benchmark";



export default function UploadPage({ onAnalyze }: { onAnalyze: () => void }) {
  const dispatch = useAppDispatch();
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


  const [analyzeFile] = useAnalyzeFileMutation();

  const [analyzeText] = useAnalyzeTextMutation();

  const [getISOSuggestions] = useGetISOSuggestionsMutation();



  const [uploadType, setUploadType] = useState<"file" | "text">("file");

  const [fileName, setFileName] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const [textContent, setTextContent] = useState("");

  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(false);

  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);



  // ISO Suggestions state

  const [isoSuggestions, setIsoSuggestions] = useState<ISOSuggestion[]>([]);

  const [selectedSuggestion, setSelectedSuggestion] = useState<ISOSuggestion | null>(null);

  const [improvementGoal, setImprovementGoal] = useState("");

  const [selectedISODetail, setSelectedISODetail] = useState<ISOSuggestion | null>(null);

  const [messageIndex, setMessageIndex] = useState(0);



  const LOADING_MESSAGES = [

    "Loading personalized suggestions",

    "AI is thinking",

    "Analyzing document",

    "Generating recommendations",

  ];



  const STEPS = [

    { icon: Eye, label: "Document Parser", sub: "OCR text extraction" },

    { icon: Brain, label: "Semantic AI", sub: "Secure processing" },

    { icon: Search, label: "Gap Analyzer", sub: "Variance analysis" },

    { icon: Award, label: "Action Roadmap", sub: "Optimization roadmap" },

  ];



  const EXAMPLES = [

    "Quality management policies...",

    "Information security procedures...",

    "Environmental compliance reviews...",

  ];



  const LOADING_STEPS = [

    { icon: Eye, label: "Parsing document structure..." },

    { icon: Brain, label: "Extracting semantic clauses..." },

    { icon: Search, label: "Comparing with standard guidelines..." },

    { icon: Award, label: "Compiling gap analysis report..." },

  ];



  // Chat state

  const [chatSimple, { isLoading: aiLoading }] = useChatSimpleMutation();

  const [sessionId, setSessionId] = useState<string>("bench_upload_" + Math.random().toString(36).substring(7));

  const [aiQ, setAiQ] = useState("");

  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isUserScrolledUp = useRef(false);

  const [chatLoaderIdx, setChatLoaderIdx] = useState(0);

  const CHAT_LOADER_PHRASES = [

    "AI is thinking...",

    "Analyzing your context...",

    "Benchmarking compliance data...",

    "Formulating expert response...",

    "Cross-referencing standards...",

  ];



  useEffect(() => {

    if (!aiLoading) { setChatLoaderIdx(0); return; }

    const timer = setInterval(() => {

      setChatLoaderIdx((prev) => (prev + 1) % CHAT_LOADER_PHRASES.length);

    }, 1500);

    return () => clearInterval(timer);

  }, [aiLoading]);



  // Scroll to bottom of chat

  useEffect(() => {

    if (!isUserScrolledUp.current) {

      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    }

  }, [chatHistory, aiLoading]);



  // Handle text input - no auto-fetch, user clicks button

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    const text = e.target.value;

    setTextContent(text);

  };



  // Prevent body scroll when modal is open

  useEffect(() => {

    if (selectedISODetail) {

      document.body.style.overflow = 'hidden';

    } else {

      document.body.style.overflow = '';

    }

    return () => {

      document.body.style.overflow = '';

    };

  }, [selectedISODetail]);



  // Cycle through loading messages

  useEffect(() => {

    if (!suggestionsLoading) {

      setMessageIndex(0);

      return;

    }

    const timer = setInterval(() => {

      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);

    }, 1500);

    return () => clearInterval(timer);

  }, [suggestionsLoading]);



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



    try {

      const contextStr = `ISO Compliance Benchmark Assistant. Improving document: ${fileName || "Text Content"}. Selected ISO: ${selectedSuggestion?.standard || "Pending"}. Improvement Goal: ${improvementGoal || "General Benchmark"}`;



      const response = await chatSimple({

        messages: [{ content: userMessage }],

        context: {

          benchmark_upload_context: contextStr

        },

        session_id: sessionId,

      }).unwrap();



      const aiResponse = response.messages?.[response.messages.length - 1]?.content || response.data?.response;



      if (aiResponse) {

        setChatHistory(prev => [...prev, { role: "ai", content: aiResponse }]);

        if (response.session_id) setSessionId(response.session_id);



        // Ensure we scroll to bottom when AI starts typing

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



  function handleFile(file: File) {

    if (file.type !== "application/pdf") {

      setError("Only PDF files are supported at this time.");

      return;

    }

    setFileName(file.name);

    setFile(file);

    setError(null);

    setIsoSuggestions([]);

    setSelectedSuggestion(null);

    // Auto-fetch ISO suggestions

    fetchISOSuggestions(file);

  }



  function handleDrop(e: React.DragEvent) {

    e.preventDefault();

    setDragging(false);

    const f = e.dataTransfer.files[0];

    if (f) handleFile(f);

  }



  // Auto-fetch ISO suggestions after file/text upload

  async function fetchISOSuggestions(uploadFile?: File) {

    setSuggestionsLoading(true);

    setError(null);

    try {

      const formData = new FormData();



      if (uploadFile) {

        // File mode: only send file

        formData.append("file", uploadFile);

      } else if (textContent.trim()) {

        if (textContent.trim().length < 50) {

          setError("Please provide at least 50 characters for a meaningful analysis.");

          setSuggestionsLoading(false);

          return;

        }

        // Text mode: send text content as category

        formData.append("category", textContent.trim());

      } else {

        setError("Please provide file or text");

        setSuggestionsLoading(false);

        return;

      }



      const response = await getISOSuggestions(formData).unwrap();



      if (response.success && response.data?.suggestions) {

        setIsoSuggestions(response.data.suggestions);

      } else {

        setError(response.message || "Analysis failed. Please check the inputs.");

      }

    } catch (err: any) {

      console.error("ISO suggestions error:", err);

      const errorMessage = err?.data?.message || err?.message || "An unexpected error occurred.";

      setError(errorMessage);

    } finally {

      setSuggestionsLoading(false);

    }

  }



  // Call main benchmark API with selected suggestion

  async function analyzeBenchmark(suggestion: ISOSuggestion) {

    setAnalyzeLoading(true);

    setError(null);

    try {

      let response;



      if (uploadType === "file" && file) {

        const formData = new FormData();

        formData.append("file", file);

        formData.append("improvement_goal", improvementGoal.trim());

        formData.append("target_standard", `${suggestion.standard} - ${suggestion.title}`);

        response = await analyzeFile(formData).unwrap();

      } else if (uploadType === "text" && textContent.trim()) {

        const payload: BenchmarkTextRequest = {

          document_text: textContent,

          improvement_goal: improvementGoal.trim(),

          target_standard: `${suggestion.standard} - ${suggestion.title}`,

        };

        response = await analyzeText(payload).unwrap();

      } else {

        setError("No valid content for analysis");

        setAnalyzeLoading(false);

        return;

      }



      if (response.success) {

        dispatch(setAnalysisResults(response.data));

        onAnalyze();

      } else {

        setError(response.message || "Analysis failed. Please check the inputs.");

      }

    } catch (err: any) {

      console.error("Benchmark analysis error:", err);

      if (err?.status === 403 || err?.data?.statusCode === 403 || err?.data?.message?.includes("ULTRA plan")) {

        toast.error(err?.data?.message || "Please upgrade to the ULTRA plan to access this feature.");

        router.push(`/${lang}/pricing`);

      } else {

        const errorMessage = err?.data?.message || err?.message || "An unexpected error occurred.";

        setError(errorMessage);

      }

    } finally {

      setAnalyzeLoading(false);

    }

  }



  return (

    <div className="min-h-screen bg-[#0A0F1C] space-y-6 md:space-y-12 animate-in fade-in duration-500 p-2 md:p-8">

      {/* Header */}
      <header className="space-y-3 md:space-y-4 px-2 sm:px-0 mb-6 md:mb-10 mt-8 md:mt-16 animate-in fade-in duration-700">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="px-3 md:px-4 py-0.5 md:py-1bg-[#00f0ff]/10 border border-[#00f0ff] rounded-full">
            <span className="border-[#00f0ff] text-[#00f0ff] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">{t('benchmarkAi.badge')}</span>
          </div>
        </div>
        <h1 className="space-grotesk text-4xl sm:text-5xl lg:text-[52px] font-semibold text-white leading-[1.1] tracking-tight text-center mb-8">
          {t('benchmarkAi.title')}
        </h1>
        <p className="text-[#A1A1A6] text-sm lg:text-lg max-w-4xl mx-auto leading-relaxed text-center font-inter mb-12">
          <span className="font-semibold text-white/80 block mb-2">{t('benchmarkAi.subtitle')}</span>
          {t('benchmarkAi.description')}
        </p>
      </header>



      {/* Body */}

      <div className="w-full py-4 md:py-8 grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">

        {/* Left – form */}

        <div className="bg-[#131B2D] rounded-3xl border border-[#1E293B] shadow-2xl p-4 md:p-6 lg:p-8 h-full flex flex-col justify-between">

          <div>

            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="p-1.5 md:p-2bg-[#00f0ff] text-[#0F111A]/10 rounded-xl">
                <Upload className="w-4 md:w-5 h-4 md:h-5 text-brand-cyan" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl font-black text-[#F1F5F9] tracking-wider uppercase">{t('benchmarkAi.benchmarkPortal')}</h2>
            </div>

            {/* Drop zone */}
            <p className="text-[9px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-3 md:mb-4">
              {t('benchmarkAi.uploadProtocol')}</p>

            {/* Upload Type Toggle */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4 md:mb-6">
              <button
                onClick={() => {
                  setUploadType("file");
                  setTextContent("");
                  setIsoSuggestions([]);
                  setSelectedSuggestion(null);
                }}
                className={`flex-1 py-2.5 md:py-3 px-2 md:px-4 rounded-xl font-black text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${uploadType === "file"
                  ? "bg-cyan-300 text-black hover:bg-cyan-200"
                  : "bg-[#0A0F1C] border border-[#1E293B] text-[#94A3B8] hover:border-brand-cyan/50"
                  }`}
                title={t('benchmarkAi.uploadFile')}
              >
                <FileIcon className="w-4 h-4" />
                <span>{t('benchmarkAi.uploadFile')}</span>
              </button>

              <button
                onClick={() => {
                  setUploadType("text");
                  setFile(null);
                  setFileName(null);
                  setIsoSuggestions([]);
                  setSelectedSuggestion(null);
                }}
                className={`flex-1 py-2.5 md:py-3 px-2 md:px-4 rounded-xl font-black text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${uploadType === "text"
                  ? "bg-cyan-300 text-black hover:bg-cyan-200"
                  : "bg-[#0A0F1C] border border-[#1E293B] text-[#94A3B8] hover:border-brand-cyan/50"
                  }`}
                title={t('benchmarkAi.pasteText')}
              >
                <Pencil className="w-4 h-4" />
                <span>{t('benchmarkAi.pasteText')}</span>
              </button>
            </div>



            {/* File Upload */}

            {uploadType === "file" && (

              <>

                <div

                  onClick={() => fileRef.current?.click()}

                  onDragOver={(e) => {

                    e.preventDefault();

                    setDragging(true);

                  }}

                  onDragLeave={() => setDragging(false)}

                  onDrop={handleDrop}

                  className={`border-2 border-dashed rounded-2xl p-4 md:p-8 lg:p-12 text-center cursor-pointer transition-all ${dragging

                    ? "border-brand-cyanbg-[#00f0ff] text-[#0F111A]/10"

                    : "border-[#1E293B] hover:border-brand-cyan/50 hover:bg-[#1A243A]"

                    }`}

                >

                  <div className="w-8 md:w-10 lg:w-12 h-8 md:h-10 lg:h-12 rounded-fullbg-[#00f0ff] text-[#00f0ff] flex items-center justify-center mx-auto mb-3 md:mb-4 lg:mb-6 border border-brand-cyan/20">

                    <Upload className="w-4 md:w-5 lg:w-6 h-4 md:h-5 lg:h-6 text-brand-cyan" />

                  </div>

                  <p className="text-[11px] sm:text-xs md:text-sm lg:text-base font-black text-[#F1F5F9] uppercase tracking-widest">
                    {t('benchmarkAi.dragDropPdf')}
                  </p>
                  <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[#94A3B8] mt-1 md:mt-2 font-bold uppercase tracking-widest">
                    {t('benchmarkAi.advancedOcr')}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>

                {fileName && (
                  <div className="mt-2 md:mt-4 flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl animate-in zoom-in-95 duration-300">
                    <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm shrink-0">
                      <FileCheck className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] md:text-sm font-bold text-[#1E293B] truncate">{fileName}</p>
                      <p className="text-[9px] md:text-xs text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t('benchmarkAi.uploadComplete')}
                      </p>
                    </div>
                  </div>
                )}

              </>

            )}



            {/* Text Input */}

            {uploadType === "text" && (

              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">

                <label className="text-[10px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">

                  Paste your document text

                </label>

                <div className="relative">

                  <textarea

                    value={textContent}

                    onChange={handleTextChange}

                    rows={6}

                    placeholder="Paste document content here..."

                    className={`w-full border bg-[#0A0F1C] rounded-2xl p-3 md:p-5 pr-12 md:pr-14 text-xs md:text-sm text-[#F1F5F9] placeholder:text-[#4B5563] resize-none focus:outline-none focus:ring-2 transition-all shadow-inner font-medium ${textContent.length > 0 && textContent.length < 50

                      ? "border-amber-500/50 focus:ring-amber-500/30"

                      : "border-[#1E293B] focus:ring-brand-cyan/50"

                      }`}

                  />

                  <button

                    onClick={() => {

                      if (textContent.trim().length >= 50 && !suggestionsLoading) {

                        setIsoSuggestions([]);

                        setSelectedSuggestion(null);

                        fetchISOSuggestions();

                      }

                    }}

                    disabled={textContent.trim().length < 50 || suggestionsLoading}

                    className="absolute bottom-2 md:bottom-3 right-2 md:right-3 p-1.5 md:p-2bg-[#00f0ff] text-[#0F111A] text-white hover:bg-[#3433D6] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all active:scale-95 flex items-center justify-center"

                  >

                    {suggestionsLoading ? (

                      <Loader2 className="w-4 h-4 animate-spin" />

                    ) : (

                      <Send className="w-4 h-4" />

                    )}

                  </button>

                </div>

                {textContent.length > 0 && textContent.length < 50 && (

                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1 flex items-center gap-1">

                    <AlertTriangle className="w-3 h-3" /> Minimum 50 characters required for AI analysis ({textContent.length}/50)

                  </p>

                )}

                {textContent && (

                  <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">

                    <CheckCircle2 className="w-3.5 md:w-4 h-3.5 md:h-4 text-green-600 shrink-0" />

                    <p className="text-[10px] md:text-xs text-green-600 font-bold truncate">

                      {textContent.length} characters ready for analysis

                    </p>

                  </div>

                )}

              </div>

            )}



            {/* Category Display for Text Mode (Read-only) */}

            {uploadType === "text" && selectedSuggestion && isoSuggestions.length > 0 && (

              <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">

                <label className="text-[10px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">

                  Selected Category

                </label>

                <input

                  type="text"

                  value={selectedSuggestion.standard}

                  readOnly

                  className="w-full bg-[#0A0F1C] border border-brand-cyan rounded-xl p-3 md:p-4 text-xs md:text-sm font-bold text-white! cursor-not-allowed"

                />

              </div>

            )}



            {error && (

              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs md:text-sm font-medium">

                {error}

              </div>

            )}



            {/* ISO Suggestions Loading State */}

            {suggestionsLoading && isoSuggestions.length === 0 && (

              <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">

                <label className="text-[10px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] flex items-center gap-2">

                  <Target className="w-3.5 h-3.5" /> Recommended ISO Standards ({LOADING_MESSAGES[messageIndex]})

                </label>

                <div className="space-y-1.5 md:space-y-2">

                  {[1, 2, 3].map((idx) => (

                    <div

                      key={idx}

                      className="bg-[#0A0F1C] border border-[#1E293B] rounded-xl p-2 md:p-3 animate-pulse space-y-1.5 md:space-y-2"

                    >

                      <div className="h-4 bg-[#1E293B] rounded w-32"></div>

                      <div className="h-3 bg-[#1E293B] rounded w-full"></div>

                      <div className="h-3 bg-[#1E293B] rounded w-5/6"></div>

                    </div>

                  ))}

                </div>

              </div>

            )}



            {/* ISO Suggestions Display */}

            {isoSuggestions.length > 0 && (

              <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">

                <div className="space-y-3 md:space-y-4">

                  <div className="flex items-center justify-between gap-2">

                    <label className="text-[10px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] truncate flex items-center gap-2">

                      <Target className="w-3.5 h-3.5" /> {isoSuggestions.length} ISO Standards Found

                    </label>

                    {suggestionsLoading && (

                      <Loader2 className="w-3.5 md:w-4 h-3.5 md:h-4 animate-spin text-brand-cyan shrink-0" />

                    )}

                  </div>

                  <div className="space-y-1.5 md:space-y-2 max-h-[250px] md:max-h-[400px] overflow-y-auto custom-thin-scrollbar">

                    {isoSuggestions.map((suggestion, idx) => (

                      <div

                        key={idx}

                        onClick={() => {

                          setSelectedSuggestion(suggestion);

                          setImprovementGoal("");

                        }}

                        className={`bg-[#0A0F1C] border rounded-xl p-2 md:p-3 text-[10px] md:text-xs cursor-pointer transition-all flex gap-2 md:gap-3 items-start ${selectedSuggestion?.standard === suggestion.standard

                          ? "border-[#00f0ff] bg-gray-800 text-white shadow-[0_0_20px_rgba(63,62,237,0.1)]"

                          : "border-[#1E293B] hover:border-[#4B5563] hover:bg-[#0F1318]"

                          }`}

                      >

                        <div className="flex-1 min-w-0">

                          <div className="flex items-start justify-between gap-2">

                            <div className="flex-1">

                              <p

                                className={`font-black text-[11px] ${selectedSuggestion?.standard === suggestion.standard

                                  ? "text-brand-cyan"

                                  : "text-[#F1F5F9]"

                                  }`}

                              >

                                {suggestion.standard}

                              </p>

                              <p

                                className={`text-[10px] font-medium ${selectedSuggestion?.standard === suggestion.standard

                                  ? "text-brand-cyan/80"

                                  : "text-[#94A3B8]"

                                  }`}

                              >

                                {suggestion.title}

                              </p>

                            </div>

                          </div>

                          <p

                            className={`text-[9px] leading-relaxed line-clamp-2 mt-2 ${selectedSuggestion?.standard === suggestion.standard

                              ? "text-brand-cyan/70"

                              : "text-[#4B5563]"

                              }`}

                          >

                            {suggestion.relevance}

                          </p>

                        </div>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            setSelectedISODetail(suggestion);

                          }}

                          className="shrink-0 p-1.5 hover:bg-brand-cyan hover:text-[#0F111A]/20 rounded-lg transition-colors"

                          title="View Details"

                        >

                          <Info

                            className={`w-4 h-4 ${selectedSuggestion?.standard === suggestion.standard

                              ? "text-brand-cyan"

                              : "text-[#4B5563] hover:text-[#94A3B8]"

                              }`}

                          />

                        </button>

                      </div>

                    ))}

                  </div>

                </div>



                {/* Improvement Goal Section */}

                <div className="space-y-3 border-t border-[#1E293B] pt-6">

                  <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] flex items-center gap-2">

                    <ClipboardList className="w-3.5 h-3.5" /> Improvement Goal

                  </label>

                  {/* Improvement Goals List */}
                  {selectedSuggestion?.improvements && selectedSuggestion?.improvements?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-[#64748B] font-medium">Select an improvement goal:</p>
                      <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto custom-thin-scrollbar">
                        {selectedSuggestion.improvements.map((goal, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImprovementGoal(goal)}
                            className={`p-2 md:p-3 text-left text-xs md:text-sm rounded-xl border transition-all ${improvementGoal === goal ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.1)]" : "bg-[#0A0F1C] border-[#1E293B] text-[#94A3B8] hover:border-[#00f0ff]/40 hover:bg-[#0F1318]"}`}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Editable textarea for selected/custom goal */}
                  <textarea
                    value={improvementGoal}
                    onChange={(e) => setImprovementGoal(e.target.value)}
                    placeholder={selectedSuggestion?.improvements?.length ? "Select a goal above or type a custom one..." : "Enter your improvement goal..."}
                    rows={3}
                    className="w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-4 text-sm text-[#F1F5F9] placeholder:text-[#4B5563] resize-none focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all shadow-inner font-medium"
                  />

                </div>



                {/* Initialize Benchmark Button */}

                <button

                  onClick={() => {

                    if (selectedSuggestion && improvementGoal.trim()) {

                      analyzeBenchmark(selectedSuggestion);

                    }

                  }}

                  disabled={analyzeLoading || !selectedSuggestion || !improvementGoal.trim()}

                  className="w-full mt-6 md:mt-8 px-4 md:px-6 py-3 md:py-4 bg-cyan-300/70 text-black hover:bg-cyan-300 cursor-pointer hover:bg-[#3433D6] disabled:bg-[#4B5563] disabled:opacity-50 rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 md:gap-3"

                >

                  {analyzeLoading ? (

                    <>

                      <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" />

                      <span>Analyzing...</span>

                    </>

                  ) : (

                    <>

                      <Sparkles className="w-4 md:w-5 h-4 md:h-5" />

                      <span>Initialize Benchmark</span>

                    </>

                  )}

                </button>

              </div>

            )}

          </div>



          {/* Security Info */}
          <div className="mt-8 grid grid-cols-1 gap-2 md:gap-4 border-t border-[#1E293B]/50 pt-6">
            <div className="flex items-center gap-4 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
              <Lock className="w-4 h-4 text-[#14B8A6]" />
              <span>{t('benchmarkAi.secureSandbox')}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
              <Type className="w-4 h-4 text-[#14B8A6]" />
              <span>{t('benchmarkAi.intelligentOcr')}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
              <BarChart className="w-4 h-4 text-[#14B8A6]" />
              <span>{t('benchmarkAi.instantGapAnalysis')}</span>
            </div>
          </div>
        </div>

        {/* Right – info panel (hidden on mobile and narrow desktops) */}
        <div className="hidden xl:flex bg-[#131B2D] rounded-3xl border border-[#1E293B] shadow-2xl p-8 md:p-12 flex-col items-center justify-center text-center h-full">
          <div className="w-24 h-24 rounded-3xl border-2 border-[#1E293B] flex items-center justify-center mb-8 bg-[#0A0F1C] group hover:border-brand-cyan/50 transition-all duration-500">
            <FileText className="w-10 h-10 text-[#4B5563] group-hover:text-brand-cyan transition-colors" />
          </div>
          <h3 className="text-xl font-black text-[#F1F5F9] uppercase tracking-widest mb-4">
            {t('benchmarkAi.readyForBenchmark')}
          </h3>
          <p className="text-sm text-[#94A3B8] max-w-sm leading-relaxed font-medium mb-12">
            {t('benchmarkAi.readyForBenchmarkDesc')}
          </p>

          <div className="grid grid-cols-2 gap-4 w-full">
            {[
              {
                label: t('benchmarkAi.neuralOcr'),
                sub: t('benchmarkAi.neuralOcrSub'),
                icon: FileText,
              },
              { label: t('benchmarkAi.gapLogic'), sub: t('benchmarkAi.gapLogicSub'), icon: Brain },
              { label: t('benchmarkAi.isoMatrix'), sub: t('benchmarkAi.isoMatrixSub'), icon: Award },
              { label: t('benchmarkAi.resolutionProtocol'), sub: t('benchmarkAi.resolutionProtocolSub'), icon: Type },
            ].map((f) => (
              <div
                key={f.label}
                className="bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-5 text-left transition-all hover:border-brand-cyan/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <f.icon className="w-4 h-4 text-[#14B8A6]" />
                  <p className="text-[10px] font-black text-[#F1F5F9] uppercase tracking-widest">{f.label}</p>
                </div>
                <p className="text-[10px] text-[#94A3B8] font-medium leading-tight">
                  {f.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>



      {/* Ask AI Section */}

      <div className="mt-8 md:mt-12 bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="p-2 sm:p-3 md:p-6 flex items-center gap-2 md:gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50">

          <div className="p-2 bg-[#00f0ff] text-[#0F111A]/10 rounded-xl">

            <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-black" />

          </div>

          <div>
            <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-[#F1F5F9] uppercase tracking-wider">
              {t('benchmarkAi.chatTitle')}
            </div>
            <p className="text-[8px] text-[#4B5563] font-black uppercase tracking-widest mt-0.5 md:mt-1">
              {t('benchmarkAi.chatDesc')}
            </p>
          </div>

        </div>



        <div className="p-1.5 sm:p-2.5 md:p-8 space-y-4 md:space-y-6 max-w-[94.5vw] sm:max-w-[80vw] md:max-w-[90vw] lg:max-w-[93.5vw]">

          {(chatHistory.length > 0 || aiLoading) && (

            <div

              ref={chatContainerRef}

              onScroll={handleChatScroll}

              className="w-full min-w-0 bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-1.5 sm:p-2.5 md:p-6 overflow-y-auto max-h-[200px] md:max-h-[300px] lg:max-h-[400px] flex flex-col space-y-3 md:space-y-6 custom-thin-scrollbar animate-in slide-in-from-bottom-4 duration-300"

            >

              {chatHistory.map((msg, i) => (

                <div

                  key={i}

                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} min-w-0`}

                >

                  <div

                    className={`max-w-full md:max-w-[80%] p-1.5 sm:p-2.5 md:p-4 rounded-2xl text-xs md:text-sm font-medium leading-relaxed min-w-0 ${msg.role === "user"

                      ? "bg-[#67E8F9] text-[#0F111A] rounded-tr-none shadow-[0_4px_15px_-3px_rgba(103,232,249,0.35)]"

                      : "bg-[#131B2D] border border-[#1E293B] text-[#F1F5F9] rounded-tl-none w-full"

                      }`}

                  >

                    <div className={`max-w-none prose prose-sm w-full min-w-0 ${msg.role === "user" ? "text-black" : "prose-invert text-[#F1F5F9]"}`}>

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

                  <div className="flex items-center gap-3 p-3 bg-[#131B2D] border border-[#67E8F9]/20 rounded-2xl rounded-tl-none shadow-[0_0_15px_rgba(103,232,249,0.1)]">

                    <span className="text-[10px] md:text-xs font-semibold text-white uppercase tracking-wider animate-pulse leading-none">

                      {CHAT_LOADER_PHRASES[chatLoaderIdx]}

                    </span>

                  </div>

                </div>

              )}

              <div ref={chatEndRef} />

            </div>

          )}



          <div className="relative">

            <textarea

                className="w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-3 md:p-6 pr-12 md:pr-16 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#67E8F9]/30 focus:border-[#67E8F9] transition-all min-h-[70px] md:min-h-[100px] resize-none font-medium text-[#F1F5F9] placeholder-[#4B5563]"

              placeholder={t('benchmarkAi.chatPlaceholder')}

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

                className="absolute bottom-3 md:bottom-6 right-3 md:right-6 p-2 md:p-3 bg-[#67E8F9] text-[#0F111A] hover:bg-[#22D3EE] rounded-xl disabled:opacity-50 transition-all shadow-lg active:scale-95"

            >

              <Send className="w-4 md:w-[18px] h-4 md:h-[18px]" />

            </button>

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

          border-radius: 5px;

        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {

          background: #94a3b8;

        }

      `}</style>



      {/* ISO Details Modal */}

      {selectedISODetail && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">

          <div className="bg-[#0A0F1C] border border-[#1E293B] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}

            <div className="sticky top-0 bg-[#0A0F1C] border-b border-[#1E293B] p-4 md:p-6 flex items-start justify-between gap-3">

              <div className="flex-1 min-w-0">

                <h2 className="text-lg md:text-2xl font-black text-[#F1F5F9] mb-1 md:mb-2 truncate">

                  {selectedISODetail.standard}

                </h2>

                <p className="text-base md:text-lg text-brand-cyan font-bold truncate">

                  {selectedISODetail.title}

                </p>

              </div>

              <button

                onClick={() => setSelectedISODetail(null)}

                className="p-1.5 md:p-2 hover:bg-[#1E293B] rounded-lg transition-colors shrink-0"

              >

                <X className="w-4 md:w-5 h-4 md:h-5 text-[#94A3B8]" />

              </button>

            </div>



            {/* Modal Content */}

            <div className="p-6 space-y-6">

              {/* Relevance */}

              <div className="space-y-3">

                <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] flex items-center gap-2">

                  <Pin className="w-3.5 h-3.5" /> Relevance

                </h3>

                <p className="text-sm text-[#E0E7FF] leading-relaxed">

                  {selectedISODetail.relevance}

                </p>

              </div>



              {/* Documents Section */}

              {selectedISODetail.documents && selectedISODetail.documents.length > 0 && (

                <div className="space-y-3 border-t border-[#1E293B] pt-6">

                  <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] flex items-center gap-2">

                    <FileIcon className="w-3.5 h-3.5" /> Required Documents

                  </h3>

                  <div className="space-y-2">

                    {selectedISODetail.documents.map((doc, idx) => (

                      <div

                        key={idx}

                        className="bg-[#0F1318] border border-[#1E293B] rounded-xl p-3 text-sm text-[#E0E7FF]"

                      >

                        <p className="font-bold text-brand-cyan mb-1">{doc.title}</p>

                        <p className="text-xs text-[#94A3B8]">Clause: {doc.clause}</p>

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* Records Section */}

              {selectedISODetail.records && selectedISODetail.records.length > 0 && (

                <div className="space-y-3 border-t border-[#1E293B] pt-6">

                  <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] flex items-center gap-2">

                    <ClipboardList className="w-3.5 h-3.5" /> Required Records

                  </h3>

                  <div className="space-y-2">

                    {selectedISODetail.records.map((rec, idx) => (

                      <div

                        key={idx}

                        className="bg-[#0F1318] border border-[#1E293B] rounded-xl p-3 text-sm text-[#E0E7FF]"

                      >

                        <p className="font-bold text-brand-cyan mb-1">{rec.title}</p>

                        <p className="text-xs text-[#94A3B8]">Clause: {rec.clause}</p>

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* Action Buttons */}

              <div className="border-t border-[#1E293B] pt-6 flex gap-3">

                <button

                  onClick={() => setSelectedISODetail(null)}

                  className="flex-1 px-6 py-3 bg-[#1E293B] hover:bg-[#2D3142] text-[#F1F5F9] rounded-xl text-sm font-bold uppercase tracking-wider transition-all"

                >

                  {t('dynamic.dyn_close_113')}</button>

                <button

                  onClick={() => {

                    setSelectedSuggestion(selectedISODetail as ISOSuggestion);

                    setImprovementGoal("");

                    setSelectedISODetail(null);

                  }}

                  className="flex-1 px-6 py-3bg-[#00f0ff] text-[#0F111A] text-white hover:bg-[#3433D6] rounded-xl text-sm font-bold uppercase tracking-wider transition-all"

                >

                  Select

                </button>

              </div>

            </div>

          </div>

        </div>

      )}



      <FullPageLoader

        isLoading={loading || analyzeLoading}

        title={analyzeLoading ? "Generating Gap Analysis..." : "Processing Document..."}

        description={analyzeLoading ? "Retrieving relevant clauses and comparing them..." : "Performing OCR and parsing structure..."}

        steps={[

          "Uploading document",

          "Analyzing context & suggestions",

          "Generating report",

          "Preparing interactive workspace"

        ]}

      />

    </div>

  );

}

