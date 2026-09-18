/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  User,
  LayoutPanelLeft,
  X,
  GraduationCap,
  FileText,
  Brain,
  Layout,
  MessageSquare,
  BookOpen,
  Info,
  Loader2,
  CheckSquare,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Globe,
  Dna,
  LifeBuoy,
  Plus,
  FileUp,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname, useParams } from "next/navigation";
import {
  useGetISOStandardByIdQuery,
  useChatWithISOStandardsMutation,
  useGetChatHistoryQuery,
  useGetChatSessionsQuery,
  useGenerateFlashcardsNewMutation,
  ISODeckData,
  useChatWithISOStandardsNewMutation
} from "@/lib/redux/api/isoStandardsApi";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

import remarkGfm from "remark-gfm";

// --- Types ---
interface Message {
  id: number | string;
  role: "user" | "bot";
  content: string;
  followups?: string[];
  sources?: string[];
  timestamp?: string;
  attachment?: {
    name: string;
    type: string;
    url?: string;
  };
  flashcardDeck?: ISODeckData;
}

interface StudyTool {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

// --- Data ---
// --- Data ---

const standardsData = [
  {
    id: 1,
    category: { name: "Quality Management" },
    title: "ISO 9001:2015 Quality management systems",
    code: "ISO 9001:2015",
    summary: "Sets out the criteria for a quality management system. It can be used by any organization, large or small, regardless of its field of activity.",
  },
  {
    id: 4,
    category: { name: "Food Safety" },
    title: "ISO 22000:2018 Food safety management systems",
    code: "ISO 22000:2018",
    summary: "Sets out the requirements for a food safety management system and can be certified to it. It maps out what an organization needs to do to demonstrate its ability to control food safety hazards.",
  },
  {
    id: 5,
    category: { name: "Information Security" },
    title: "ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection",
    code: "ISO 27001:2022",
    summary: "Specifies the requirements for establishing, implementing, maintaining and continually improving an information security management system within the context of the organization.",
  },
];

// --- Sub-components ---

const ChatHeader = ({
  onToggleLeftSidebar,
  onToggleRightSidebar,
  standardTitle
}: {
  onToggleLeftSidebar: () => void,
  onToggleRightSidebar: () => void,
  standardTitle?: string
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center absolute top-0 left-0 z-50 right-0 justify-between p-4 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 shrink-0">
      <div className="flex-1 flex items-center gap-4">
        <button
          onClick={onToggleLeftSidebar}
          className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-[#FFFFFF] transition-all shadow-sm block lg:hidden "
          title={t('common.openNavigation')}
        >
          <MessageSquare size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-2">
        {standardTitle && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <FileText size={14} className="text-[#818CF8]" />
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider text-center">
              {standardTitle}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-end gap-3 px-2">
        <button
          onClick={onToggleRightSidebar}
          className="xl:hidden p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-[#FFFFFF] transition-all shadow-sm"
          title={t('common.openStudio')}
        >
          <LayoutPanelLeft size={18} />
        </button>
      </div>
    </div>
  );
};

const HistorySidebar = ({
  isMobile,
  onClose,
  standardId,
  currentSessionId,
  onSessionSelect,
  onNewChat
}: {
  isMobile?: boolean,
  onClose?: () => void,
  standardId: string,
  currentSessionId: string | null,
  onSessionSelect: (sessionId: string) => void,
  onNewChat: () => void
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const token = useSelector(selectCurrentToken);
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => { setIsClient(true); }, []);

  const isAuthenticated = !!token || (typeof document !== "undefined" && !!document.cookie.match(/(^| )token=([^;]+)/));

  const { data: sessionsData, isLoading } = useGetChatSessionsQuery(standardId, {
    skip: !isAuthenticated,
  });

  return (
    <div className={` flex flex-col h-full ${isMobile ? "w-full p-8 bg-[#050505]" : "w-64 p-6 bg-[#08080A] border-r border-white/5"}`}>
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-[#FFFFFF] transition-all uppercase tracking-[0.2em] group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {t('library.backToPlatform')}
        </button>
        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
        <button
          onClick={() => {
            onNewChat();
            if (isMobile && onClose) onClose();
          }}
          className="w-full py-3 px-4 rounded-xl bg-[#00f0ff]  text-[#0F111A] font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-brand-cyan/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-6"
        >
          <Plus size={16} strokeWidth={2.5} />
          {t('library.newChat') || "New Chat"}
        </button>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{t('library.history')}</h3>
            <div className="w-8 h-px bg-white/5" />
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sessionsData?.data && sessionsData.data.length > 0 ? (
              sessionsData.data.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    onSessionSelect(session.id);
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full p-3 rounded-xl border transition-all text-left group ${currentSessionId === session.id
                    ? "bg-brand-cyan text-[#0F111A]/10 border-brand-cyan/20 shadow-[0_0_20px_rgba(63,62,237,0.05)]"
                    : "bg-white/2 border-transparent hover:bg-white/5 hover:border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${currentSessionId === session.id ? "bg-brand-cyan text-[#0F111A] shadow-[0_0_8px_#D4AF37]" : "bg-gray-700 group-hover:bg-gray-500"}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11.5px] font-black truncate font-jetbrains-mono ${currentSessionId === session.id ? "text-[#00f0ff]" : "text-gray-400 group-hover:text-gray-200"}`}>
                        {session.title || t('library.newSession')}
                      </p>
                      <p className="text-[9px] font-black text-gray-600 mt-0.5 uppercase tracking-widest font-jetbrains-mono">
                        {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-white/5 bg-white/2 text-center">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{t('library.noHistory')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10">
        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">{t('library.proTip')}</p>
        <p className="text-[11px] text-gray-400 leading-snug font-medium">{t('library.tipSlash')}</p>
      </div> */}
    </div>
  );
};

const StandardOverviewInfo = () => {
  const { t } = useTranslation();
  const infoCards = [
    {
      title: t('library.qualityAlignmentTitle'),
      content: t('library.qualityAlignmentDesc'),
      icon: CheckSquare,
      color: "text-[#166534]",
      bgColor: "bg-green-50",
    },
    {
      title: t('library.globalRecognitionTitle'),
      content: t('library.globalRecognitionDesc'),
      icon: Globe,
      color: "text-[#1e40af]",
      bgColor: "bg-blue-50",
    },
    {
      title: t('library.continuousGrowthTitle'),
      content: t('library.continuousGrowthDesc'),
      icon: Dna,
      color: "text-[#86198f]",
      bgColor: "bg-pink-50",
    },
    {
      title: t('library.expertAssistanceTitle'),
      content: t('library.expertAssistanceDesc'),
      icon: LifeBuoy,
      color: "text-[#92400e]",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full text-left">
      {infoCards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className={`${card.bgColor} p-4 rounded-2xl border border-white shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow`}
        >
          <div className={`${card.color} shrink-0`}>
            <card.icon size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${card.color}`}>
              {card.title}
            </h4>
            <p className="text-[11px] text-gray-500 leading-snug font-medium">
              {card.content}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const DocumentSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-12 w-full h-full relative overflow-hidden bg-[#050505]">
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px]bg-[#00f0ff] text-[#0F111A]/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-[#8B5CF6]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-4xl w-full flex flex-col gap-8 relative z-10">
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="h-12 w-12 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded-full animate-pulse" />
          <div className="h-20 w-full max-w-2xl bg-white/5 rounded-3xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/2 backdrop-blur-sm border border-white/5 rounded-[2rem] p-6 flex gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                <div className="h-3 w-full bg-white/2 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-12">
          <div className="w-1.5 h-1.5 rounded-fullbg-[#00f0ff] text-[#0F111A] animate-bounce shadow-[0_0_8px_#D4AF37]" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-fullbg-[#00f0ff] text-[#0F111A]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-fullbg-[#00f0ff] text-[#0F111A]/30 animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">{t('library.initializingEngine')}</span>
        </div>
      </div>
    </div>
  );
};

const InitialChatView = ({ title, summary, code, category, standardId, onActionClick }: any) => {
  const { t } = useTranslation();

  const [chatWithISOStandards, { isLoading: isFetchingSuggestions }] = useChatWithISOStandardsNewMutation();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!standardId) return;

    let isMounted = true;
    const fetchSuggestions = async () => {
      try {
        const formData = new FormData();
        formData.append("messages", "Can you Give 5 1 liner followup question. Max 10 words standard");
        formData.append("context", JSON.stringify({ isoStandardId: standardId }));

        const result = await chatWithISOStandards(formData as any).unwrap();

        if (isMounted && result?.success && result?.data?.response) {
          const lines = result.data.response.split('\n').filter((l: string) => l.trim().length > 5);
          const cleaned = lines.map((l: string) => l.replace(/^[\d\.\-\*]+\s*/, '').replace(/^"|"$/g, '').trim()).slice(0, 5);
          setSuggestions(cleaned);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    };

    fetchSuggestions();

    return () => { isMounted = false; };
  }, [standardId, chatWithISOStandards]);

  const quickActions = [
    {
      title: t('library.quickSummarize'),
      desc: t('library.quickSummarizeDesc'),
      action: t('library.quickSummarize'),
      icon: Sparkles,
      color: "text-[#818CF8]",
      bgColor: "bg-brand-cyan text-[#0F111A]/10",
      borderColor: "border-white/5",
    },
    {
      title: t('library.quickRequirements'),
      desc: t('library.quickRequirementsDesc'),
      action: t('library.quickRequirements'),
      icon: ShieldCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-white/5",
    },
    {
      title: t('library.quickRisks'),
      desc: t('library.quickRisksDesc'),
      action: t('library.quickRisks'),
      icon: AlertCircle,
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
      borderColor: "border-white/5",
    },
    {
      title: t('library.quickChecklist'),
      desc: t('library.quickChecklistDesc'),
      action: t('library.quickChecklist'),
      icon: CheckSquare,
      color: "text-indigo-400",
      bgColor: "bg-indigo-400/10",
      borderColor: "border-white/5",
    },
  ];

  if (!title) return <DocumentSkeleton />;

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-6 md:px-12 lg:px-24 overflow-y-auto w-full h-full relative no-scrollbar mt-10">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          {/* Welcome Branding */}
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00f0ff] animate-pulse" />
              <div className="text-gray-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.4em] whitespace-nowrap">{t('library.neuralInterface')}</div>
            </div>
            <div className="text-xl sm:text-3xl md:text-4xl lg:text-4xl font-black text-white mb-6 tracking-tight">ISO Brain <span className="text-[#00f0ff]">{t('academy.headingHighlight', 'AI')}</span></div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em]">
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" /> {t('library.realtimeAnalysis')}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" /> {t('library.regulatoryGuardrails')}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500" /> {t('library.auditPreparedness')}
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/2 border border-white/5 rounded-2xl text-gray-400 mb-8">
            <Share2 size={14} className="text-[#818CF8] sm:w-4 sm:h-4" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest">
              {category || "Standard"} • {code}
            </span>
          </div>

          <div className="text-[12px] sm:text-base md:text-xl lg:text-xl font-black text-white mb-8 leading-tight mx-auto max-w-2xl">
            {t('library.redefining')} <span className="text-[#00f0ff]">{title || t('library.standard')}</span> {t('library.complianceThrough')}
          </div>
          <div className="text-[11px] sm:text-base md:text-lg text-gray-400 leading-relaxed font-medium italic max-w-3xl mx-auto mb-8">
            "{summary}"
          </div>

          {isFetchingSuggestions && suggestions.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto mt-8 w-full px-4">
              {[1, 2, 3, 4, 5].map((i, index) => (
                <div
                  key={i}
                  className={`px-5 py-4 bg-[#14151A]/40 border border-white/5 rounded-2xl w-full h-[52px] sm:h-[56px] flex items-center ${index === 4 ? 'md:col-span-2 md:max-w-[calc(50%-6px)] md:mx-auto' : ''}`}
                >
                  <div className="h-3 bg-white/10 rounded-full w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto mt-8 w-full px-4">
              {suggestions.map((quiz, index) => (
                <button
                  key={index}
                  onClick={() => onActionClick(quiz)}
                  className={`px-5 py-4 bg-[#14151A]/80 border border-white/5 rounded-2xl hover:bg-[#1E2028] hover:border-white/10 transition-all text-left text-[13px] sm:text-[14px] text-gray-300 hover:text-white font-medium w-full shadow-lg hover:shadow-brand-cyan/5 ${index === 4 ? 'md:col-span-2 md:max-w-[calc(50%-6px)] md:mx-auto' : ''}`}
                >
                  {quiz}
                </button>
              ))}
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

const TypewriterMarkdown = ({ content, speed = 5, onUpdate }: { content: string, speed?: number, onUpdate?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < content.length) {
      const timeout = setTimeout(() => {
        const chunkSize = 1; // type 1 character at a time for a visible typewriter effect
        const nextIndex = Math.min(index + chunkSize, content.length);
        setDisplayedText(content.substring(0, nextIndex));
        setIndex(nextIndex);
        onUpdate?.();
      }, 15); // 15ms delay per character
      return () => clearTimeout(timeout);
    }
  }, [index, content, onUpdate]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {displayedText}
    </ReactMarkdown>
  );
};

const MessageList = ({ messages, isLoading, onActionClick, onStudyFlashcards }: { messages: Message[], isLoading: boolean, onActionClick: (text: string) => void, onStudyFlashcards: (deck: ISODeckData) => void }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageCount = useRef(messages.length);
  const isUserScrolledUp = useRef(false);

  const scrollToBottom = (behavior: "smooth" | "instant" = "smooth") => {
    if (containerRef.current && !isUserScrolledUp.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      isUserScrolledUp.current = !isAtBottom;
    }
  };

  useEffect(() => {
    if (lastMessageCount.current === 0 && messages.length > 0) {
      scrollToBottom("instant");
    }
    else if (messages.length > lastMessageCount.current) {
      isUserScrolledUp.current = false;
      scrollToBottom("smooth");
    }
    lastMessageCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      scrollToBottom("smooth");
    }
  }, [isLoading]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-2 md:py-12 md:px-6 w-full h-full custom-scrollbar scroll-smooth"
    >
      <div className="max-w-full mx-auto space-y-4 px-0 md:space-y-8 md:px-8">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "bot" && (
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center shrink-0 mt-1 shadow-lg shadow-black/20">
                <Brain size={16} className="text-[#818CF8]" />
              </div>
            )}

            <div className={`flex flex-col gap-2 w-full max-w-full ${msg.role === "user" ? "md:max-w-[85%] md:w-auto items-end" : "md:max-w-[90%] md:w-auto"}`}>
              <div
                className={`px-3.5 py-3 md:px-6 md:py-5 rounded-2xl md:rounded-3xl text-[13px] sm:text-[15px] md:text-[16px] leading-[1.7] ${msg.role === "bot"
                  ? "bg-[#0A0A0B] border border-white/10 text-[#EDEDED] rounded-tl-sm shadow-2xl"
                  : "bg-[#111827] border border-brand-cyan/20 text-white font-medium rounded-tr-sm shadow-lg shadow-black/40"
                  }`}
              >
                {msg.attachment && (
                  <div className="mb-4">
                    {msg.attachment.type.startsWith('image/') ? (
                      <div className="relative rounded-2xl overflow-hidden border border-white/10 max-w-full sm:max-w-[300px] shadow-2xl group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.attachment.url}
                          alt={msg.attachment.name}
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-[10px] text-white font-black truncate">{msg.attachment.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 md:p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="w-10 h-10 rounded-xlbg-[#00f0ff] text-[#0F111A]/10 flex items-center justify-center text-[#818CF8]">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-white truncate">{msg.attachment.name}</p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{msg.attachment.type.split('/')[1] || 'FILE'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {msg.flashcardDeck && (
                  <div className="mb-3 md:mb-4 w-full md:max-w-sm">
                    <div className="flex flex-col gap-3 md:gap-4 p-4 md:p-5 bg-gradient-to-br from-[#16A34A]/10 to-brand-cyan/10 border border-[#16A34A]/20 rounded-2xl md:rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/20">
                          <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider truncate">
                            {msg.flashcardDeck.deck_title}
                          </h4>
                          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5 font-jetbrains-mono">
                            {msg.flashcardDeck.total_cards} Interactive Cards • {msg.flashcardDeck.difficulty}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onStudyFlashcards(msg.flashcardDeck!)}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-brand-cyan hover:from-emerald-400 hover:to-[#4f4eed] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Sparkles size={14} className="text-emerald-300" />
                        {"Study Flashcards"}
                      </button>
                    </div>
                  </div>
                )}
                {msg.role === "bot" ? (
                  <div className="
                    max-w-none text-[#EDEDED]
                    [&_p]:mb-3 md:[&_p]:mb-4 [&_p]:last:mb-0
                    [&_h1]:text-[1.1rem] md:[&_h1]:text-[1.25rem] [&_h1]:font-black [&_h1]:text-white [&_h1]:mb-3 md:[&_h1]:mb-4 [&_h1]:mt-4 md:[&_h1]:mt-6 [&_h1]:tracking-tight
                    [&_h2]:text-[1rem] md:[&_h2]:text-[1.1rem] [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-2 md:[&_h2]:mb-3 [&_h2]:mt-3 md:[&_h2]:mt-5
                    [&_h3]:text-[0.95rem] md:[&_h3]:text-[1rem] [&_h3]:font-bold [&_h3]:text-white/90 [&_h3]:mb-1.5 md:[&_h3]:mb-2 [&_h3]:mt-3 md:[&_h3]:mt-4
                    
                    [&_ul]:list-none [&_ul]:pl-0 [&_ul]:mb-3 md:[&_ul]:mb-4 [&_ul]:space-y-1.5 md:[&_ul]:space-y-2
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 md:[&_ol]:mb-4 [&_ol]:space-y-1.5 md:[&_ol]:space-y-2
                    
                    [&_li]:relative [&_li]:pl-5
                    [&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.6em] [&_ul>li]:before:w-2 [&_ul>li]:before:h-2 [&_ul>li]:before:bg-[#00f0ff] [&_ul>li]:before:rounded-full [&_ul>li]:before:shadow-[0_0_8px_#D4AF37]
                    
                    [&_strong]:font-black [&_strong]:text-[#00f0ff]
                    [&_em]:italic [&_em]:text-gray-500
                    
                    [&_code]:font-jetbrains-mono [&_code]:text-[0.9em] [&_code]:bg-white/10 [&_code]:text-[#818CF8] [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-md
                    [&_pre]:bg-[#020202] [&_pre]:border [&_pre]:border-white/5 [&_pre]:rounded-xl md:[&_pre]:rounded-2xl [&_pre]:p-3 md:[&_pre]:p-6 [&_pre]:my-3 md:[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#D1D5DB] [&_pre_code]:font-jetbrains-mono
                    
                    [&_blockquote]:border-l-4 [&_blockquote]:border-[#818CF8] [&_blockquote]:bg-brand-cyan text-[#0F111A]/5 [&_blockquote]:px-4 md:[&_blockquote]:px-6 [&_blockquote]:py-3 md:[&_blockquote]:py-4 [&_blockquote]:my-3 md:[&_blockquote]:my-6 [&_blockquote]:rounded-r-xl md:[&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:text-gray-300
                    
                    [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:no-scrollbar [&_table]:my-3 md:[&_table]:my-6 [&_table]:border-collapse [&_table]:rounded-xl [&_table]:border [&_table]:border-white/5
                    [&_th]:bg-white/5 [&_th]:text-white [&_th]:font-bold [&_th]:px-2.5 md:[&_th]:px-4 [&_th]:py-2 md:[&_th]:py-3 [&_th]:text-left [&_th]:border-b [&_th]:border-white/10 [&_th]:text-[12px] md:[&_th]:text-sm
                    [&_td]:px-2.5 md:[&_td]:px-4 [&_td]:py-2 md:[&_td]:py-3 [&_td]:border-b [&_td]:border-white/5 [&_td]:text-gray-300 [&_td]:text-[12px] md:[&_td]:text-sm
                  ">
                    {typeof msg.id === "number" && index === messages.length - 1 ? (
                      <TypewriterMarkdown
                        content={msg.content}
                        onUpdate={() => scrollToBottom("smooth")}
                      />
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ) : (
                  msg.content
                )}

                <div className={`mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/5 flex items-center justify-between ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{msg.timestamp}</span>
                    {msg.role === "bot" && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <span className="text-[8px] font-black text-green-500 uppercase">{t('library.verified')}</span>
                      </div>
                    )}
                  </div>

                  {msg.role === "bot" && msg.sources && msg.sources.length > 0 && (
                    <div className="relative group/sources">
                      <button className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-[#FFFFFF] rounded-lg transition-colors">
                        <Info size={14} />
                      </button>
                      <div className="absolute bottom-full left-0 mb-3 w-72 opacity-0 invisible group-hover/sources:opacity-100 group-hover/sources:visible transition-all duration-300 z-50">
                        <div className="bg-[#141416] border border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-xl">
                          <h4 className="text-[10px] font-black text-[#818CF8] uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sparkles size={12} /> {t('library.referenceSources')}
                          </h4>
                          <ul className="space-y-2">
                            {msg.sources.map((source, sIdx) => (
                              <li key={sIdx} className="text-[11px] font-bold text-gray-400 flex items-start gap-2">
                                <div className="w-1 h-1 rounded-fullbg-[#00f0ff] text-[#0F111A] mt-1.5 shrink-0 shadow-[0_0_4px_#D4AF37]" />
                                {source}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="w-3 h-3 bg-[#141416] border-r border-b border-white/10 rotate-45 absolute -bottom-1.5 left-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {msg.followups && msg.followups.length > 0 && index === messages.length - 1 && (
                <div className="mt-2.5 md:mt-4 flex flex-wrap gap-2 justify-start">
                  {msg.followups.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onActionClick(action)}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 hover:bg-brand-cyan hover:text-[#0F111A]/10 text-gray-300 hover:text-[#FFFFFF] border border-white/10 /30 rounded-full text-[11px] md:text-[12px] font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-4 items-start">
            {/* <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full text-[#0F111A] animate-pulse shadow-[0_0_8px_#D4AF37]" />
            </div> */}
            <div className="bg-[#000000] text-[#00f0ff] border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl flex gap-2 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  isLoading,
  showSuggestions,
  placeholder,
  onFileSelect,
  selectedFile,
}: any) => {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('library.askAnything');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pt-1 pb-3 sm:pt-2 sm:pb-4 md:pt-3 md:pb-8 px-3 sm:px-4 md:px-8 bg-transparent shrink-0 relative z-30 mb-4">
      <div className="max-w-[800px] mx-auto">


        <div className="relative group mb-12">
          {/* Tokens Remaining Micro-UI */}
          {/* <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[30%] h-fullbg-[#00f0ff] text-[#0F111A] shadow-[0_0_8px_#D4AF37]" />
            </div>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{t('library.queriesLeft', { count: 7, total: 10 })}</span>
          </div> */}

          <div className="relative flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-[#141416]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group-focus-within:border-brand-cyan/30 group-focus-within:shadow-[0_0_40px_rgba(63,62,237,0.1)] transition-all duration-500 ">
            <div className="relative pl-1 sm:pl-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={`flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-full border transition-all ${selectedFile
                  ? "bg-brand-cyan text-[#0F111A]/20 border-brand-cyan/40 text-[#818CF8]"
                  : "bg-white/5 border-white/5 text-gray-400 hover:text-[#FFFFFF] hover:bg-white/10"
                  } shadow-sm`}
                title={t('library.attachFile') || "Attach file or image"}
              >
                <Plus size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                {selectedFile && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4bg-[#00f0ff] text-[#0F111A] text-[#0A0A0C] text-[8px] sm:text-[9px] rounded-full flex items-center justify-center font-black shadow-[0_0_10px_#D4AF37]">
                    1
                  </div>
                )}
              </button>
            </div>

            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && onSend()}
                placeholder={selectedFile ? `File: ${selectedFile.name}` : resolvedPlaceholder}
                disabled={isLoading}
                className="w-full h-10 sm:h-14 pl-1.5 sm:pl-2 pr-10 sm:pr-14 bg-transparent focus:outline-none placeholder:text-gray-600 font-bold text-[13px] sm:text-[16px] text-white disabled:opacity-50"
              />
              <button
                onClick={() => onSend()}
                disabled={(!value.trim() && !selectedFile) || isLoading}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 bg-gradient-to-br from-brand-cyan to-[#00f0ff] text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_20px_rgba(63,62,237,0.3)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={14} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-4 sm:mt-6 flex items-center justify-center gap-2 text-gray-600 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em]">
          <ShieldCheck size={10} className="text-brand-cyan/40" />
          {t('library.aiEngineBranding')}
        </div>
      </div>
    </div>
  );
};

const StudioSidebar = ({ studyTools, isMobile, onClose, onToolClick }: any) => {
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  return (
    <div
      className={`
    flex flex-col bg-[#0E1116] p-8 shrink-0 h-full
    ${isMobile ? "w-full" : "hidden xl:flex w-[350px] border-l border-white/5"}
  `}
    >
      <div className="flex items-center justify-between mb-8 mt-20">
        <div className="flex flex-col">
          <h2 className="text-base font-black text-white uppercase tracking-wider">{t('library.expertStudio')}</h2>
          <p className="text-[8px] sm:text-[10px] font-bold text-[#818CF8] uppercase tracking-[0.15em] sm:tracking-[0.3em]">{t('library.complianceTools')}</p>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 no-scrollbar">
        <div className="space-y-4">
          {studyTools.map((tool: any, idx: number) => (
            <motion.div
              key={idx}
              whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
              onClick={() => onToolClick(tool)}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/2 cursor-pointer transition-all group /30"
            >
              <div
                className={`p-3 rounded-xl shrink-0 transition-all group-hover:scale-110 shadow-lg ${tool.bgColor} ${tool.color.replace('text-', 'text-opacity-80 text-')}`}
              >
                <tool.icon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[13px] font-black text-gray-200 mb-0.5 group-hover:text-[#FFFFFF] transition-colors uppercase tracking-tight">
                  {tool.title}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  {tool.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Link href={`/${lang}/academy`} className="mt-8 bg-[#00f0ff] text-[#0F111A]  py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-brand-cyan/20 flex items-center justify-center gap-3 group">
        <GraduationCap size={18} className="group-hover:rotate-12 transition-transform" />
        {t('library.getCertified')}
      </Link>
    </div>
  );
};

// --- Main Component ---
const ChatInterface = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pathParams = useParams();
  const standardId = id || (pathParams?.id as string);

  const { data: standardData, isLoading: isStandardLoading } = useGetISOStandardByIdQuery(standardId);

  // Use fallback data immediately while loading for a better user experience
  const standard = useMemo(() => {
    if (standardData?.data) return standardData.data;
    const fallback = (standardsData as any[]).find((s) => s.id.toString() === standardId);
    return fallback || null;
  }, [standardData, standardId]);

  useEffect(() => {
    console.log("Loaded Standard Data:", standard);
  }, [standard]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isDesktopLeftSidebarOpen, setIsDesktopLeftSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => searchParams.get("sessionId"));
  const lastLoadedSessionId = useRef<string | null>(null);

  // --- Flashcard States and Handlers ---
  const [viewMode, setViewMode] = useState<"chat" | "flashcards">("chat");
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [flashcardsData, setFlashcardsData] = useState<ISODeckData | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [generateFlashcards, { isLoading: isGeneratingFlashcards }] = useGenerateFlashcardsNewMutation();

  const handleBuildFlashcards = async () => {
    setViewMode("flashcards");
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setFlashcardsData(null);
    setSwipeDirection(0);

    try {
      const formData = new FormData();
      formData.append("context", JSON.stringify({ isoStandardId: standardId }));
      formData.append("num_cards", "12");
      formData.append("difficulty", "intermediate");
      if (sessionId) {
        formData.append("session_id", sessionId);
      }

      const result = await generateFlashcards(formData).unwrap();
      if (result?.success && result?.data) {
        const deck = result.data;
        setFlashcardsData(deck);

        // Add a message to local chat state representing this flashcard deck
        const newBotMessage: Message = {
          id: Date.now(),
          role: "bot",
          content: `⚡ **Compliance Flashcards Generated**\n\nDeck: **${deck.deck_title}**\nTotal Cards: **${deck.total_cards}**\nDifficulty: **${deck.difficulty}**`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          flashcardDeck: deck,
        };
        setMessages((prev) => [...prev, newBotMessage]);
      } else {
        toast.error(t('library.flashcardsError') || "Failed to generate flashcards");
        setViewMode("chat");
      }
    } catch (err: any) {
      console.error("Flashcards generation error:", err);
      toast.error(err?.data?.message || err?.message || t('library.flashcardsError') || "Failed to generate flashcards");
      setViewMode("chat");
    }
  };

  const studyTools: StudyTool[] = [
    {
      id: "generate_notes",
      title: t('library.generateNotes'),
      description: t('library.generateNotesDesc'),
      icon: FileText,
      color: "text-[#818CF8]",
      bgColor: "bg-brand-cyan text-[#0F111A]/10",
    },
    {
      id: "create_summary",
      title: t('library.createSummary'),
      description: t('library.createSummaryDesc'),
      icon: Brain,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      id: "build_flashcards",
      title: t('library.buildFlashcards'),
      description: t('library.buildFlashcardsDesc'),
      icon: Layout,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "generate_quiz",
      title: t('library.generateQuiz'),
      description: t('library.generateQuizDesc'),
      icon: MessageSquare,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      id: "explain_eli5",
      title: t('library.explainEli5'),
      description: t('library.explainEli5Desc'),
      icon: BookOpen,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  const token = useSelector(selectCurrentToken);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const isAuthenticated = !!token || (typeof document !== "undefined" && !!document.cookie.match(/(^| )token=([^;]+)/));

  // Sync state sessionId with URL query parameter to handle shallow navigation, browser back/forward buttons
  const urlSessionId = searchParams.get("sessionId");
  const lastUrlSessionIdRef = useRef<string | null>(urlSessionId);

  useEffect(() => {
    if (urlSessionId !== lastUrlSessionIdRef.current) {
      lastUrlSessionIdRef.current = urlSessionId;
      if (urlSessionId !== sessionId) {
        setSessionId(urlSessionId);
        setMessages([]);
        setFlashcardsData(null);
        setViewMode("chat");
        lastLoadedSessionId.current = null;
      }
    }
  }, [urlSessionId, sessionId]);

  const [sendChat, { isLoading: isChatSending, error: chatError }] = useChatWithISOStandardsNewMutation();
  const {
    currentData: historyData,
    isFetching: isHistoryFetching,
    isSuccess: isHistorySuccess,
    isError: isHistoryError,
  } = useGetChatHistoryQuery(sessionId || "", {
    skip: !sessionId || !isAuthenticated,
  });

  // Synchronize history messages when query finishes
  useEffect(() => {
    if (!sessionId) return;

    if (isHistorySuccess && historyData?.success && historyData.data) {
      if (lastLoadedSessionId.current !== sessionId) {
        let loadedDeck: ISODeckData | null = null;
        const formattedMessages: Message[] = historyData.data.map((item) => {
          let contentStr = "";
          let deckData: ISODeckData | undefined = undefined;
          if (typeof item.message === "object" && item.message !== null) {
            const deck = item.message as ISODeckData;
            loadedDeck = deck;
            deckData = deck;
            contentStr = `⚡ **Compliance Flashcards Generated**\n\nDeck: **${deck.deck_title}**\nTotal Cards: **${deck.total_cards}**\nDifficulty: **${deck.difficulty}**`;
          } else {
            contentStr = item.message as string;
          }
          return {
            id: item.id,
            role: item.role === "assistant" ? "bot" : "user",
            content: contentStr,
            followups: item.followUps || [],
            sources: item.sources || [],
            timestamp: new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            flashcardDeck: deckData,
          };
        });

        // Delaying the update to the next tick to prevent cascading render warnings
        setTimeout(() => {
          setMessages(formattedMessages);
          if (loadedDeck) {
            setFlashcardsData(loadedDeck);
          }
          lastLoadedSessionId.current = sessionId;

          // Fetch followups for the last message if it's a bot message
          if (formattedMessages.length > 0) {
            const lastMsg = formattedMessages[formattedMessages.length - 1];
            if (lastMsg.role === "bot" && !lastMsg.flashcardDeck) {
              const aiUrl = process.env.NEXT_PUBLIC_API_URL;
              let activeToken = token;
              if (!activeToken && typeof document !== 'undefined') {
                const match = document.cookie.match(/(^| )token=([^;]+)/);
                if (match) activeToken = match[2];
              }
              fetch(`${aiUrl}/ai-assistant/quiz/followup`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {}),
                },
                body: JSON.stringify({
                  context: {
                    topic: standard?.code || standard?.title || "ISO Standard",
                    details: standard?.summary || "Standard guidelines and requirements"
                  },
                  num_questions: 5
                })
              })
                .then(res => res.json())
                .then(data => {
                  if (data && data.data && Array.isArray(data.data.questions)) {
                    setMessages((prev) => {
                      if (prev.length === 0) return prev;
                      const next = [...prev];
                      const lastIdx = next.length - 1;
                      if (next[lastIdx].id === lastMsg.id) {
                        next[lastIdx] = {
                          ...next[lastIdx],
                          followups: data.data.questions
                        };
                      }
                      return next;
                    });
                  }
                })
                .catch(err => console.error("Failed to fetch followup questions for history:", err));
            }
          }
        }, 0);
      }
    } else if (isHistoryError) {
      if (lastLoadedSessionId.current !== sessionId) {
        toast.error(t('library.couldNotGetHistory') || "Failed to load chat history");
        setTimeout(() => {
          lastLoadedSessionId.current = sessionId; // Stop infinite loading skeleton
        }, 0);
      }
    }
  }, [isHistorySuccess, isHistoryError, historyData, sessionId, t, token]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    const fileToSend = selectedFile;
    if ((!messageText.trim() && !fileToSend) || isChatSending) return;

    const newMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment: fileToSend ? {
        name: fileToSend.name,
        type: fileToSend.type,
        url: fileToSend.type.startsWith('image/') ? URL.createObjectURL(fileToSend) : undefined
      } : undefined
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setSelectedFile(null);

    try {
      const formData = new FormData();
      formData.append("messages", messageText);
      formData.append("context", JSON.stringify({ isoStandardId: standardId }));

      if (sessionId) {
        formData.append("session_id", sessionId);
      }

      if (fileToSend) {
        formData.append("file", fileToSend);
      }

      const result = await sendChat(formData as any).unwrap();

      if (result?.success && result?.data?.response) {
        if (result.data.session_id && result.data.session_id !== sessionId) {
          lastLoadedSessionId.current = result.data.session_id;
          setSessionId(result.data.session_id);
          const params = new URLSearchParams(searchParams.toString());
          params.set("sessionId", result.data.session_id);
          router.replace(`${pathname}?${params.toString()}`);
        }

        // Fetch followups from NEXT_PUBLIC_API_URL/ai-assistant/quiz/followup using the response content
        let followups = result.data.suggested_followups || [];
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          let activeToken = token;
          if (!activeToken && typeof document !== 'undefined') {
            const match = document.cookie.match(/(^| )token=([^;]+)/);
            if (match) activeToken = match[2];
          }
          const followupResponse = await fetch(`${apiUrl}/ai-assistant/quiz/followup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {}),
            },
            body: JSON.stringify({
              context: {
                topic: standard?.code || standard?.title || "ISO Standard",
                details: standard?.summary || "Standard guidelines and requirements"
              },
              num_questions: 5
            })
          });
          if (followupResponse.ok) {
            const followupData = await followupResponse.json();
            if (followupData && followupData.data && Array.isArray(followupData.data.questions)) {
              followups = followupData.data.questions;
            }
          }
        } catch (fErr) {
          console.error("Failed to fetch followup questions:", fErr);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            content: result.data.response,
            followups: followups,
            sources: result.data.sources || [],
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Chat error:", error);

      const errorMessage = error?.data?.message || error?.message || t('library.couldNotGetResponse');

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          content: errorMessage,
        },
      ]);
    }
  };

  const isChatStarted = messages.length > 0;
  const isHistoryLoading = isHistoryFetching || (!!sessionId && lastLoadedSessionId.current !== sessionId);

  const handleSessionSelect = (newSessionId: string) => {
    if (newSessionId === sessionId) return;
    setMessages([]);
    lastLoadedSessionId.current = null;
    setFlashcardsData(null);
    setViewMode("chat");
    setSessionId(newSessionId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sessionId", newSessionId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleNewChat = () => {
    setMessages([]);
    lastLoadedSessionId.current = null;
    setFlashcardsData(null);
    setViewMode("chat");
    setSessionId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sessionId");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0C] text-[#EDEDED] overflow-hidden relative">
      {/* Premium background mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%]bg-[#00f0ff] text-[#0F111A]/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-[#8B5CF6]/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%]bg-[#00f0ff] text-[#0F111A]/5 rounded-full blur-[150px]" />
      </div>

      <button
        onClick={() => setIsDesktopLeftSidebarOpen(!isDesktopLeftSidebarOpen)}
        className="hidden lg:flex absolute top-1/2 -translate-y-1/2 z-[100] w-6 h-12 bg-[#18181B] border border-white/10 border-l-0 rounded-r-lg items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-xl"
        style={{ left: isDesktopLeftSidebarOpen ? '256px' : '0' }}
      >
        {isDesktopLeftSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className={`hidden lg:flex flex-col shrink-0 z-50 transition-all duration-300 mt-20 overflow-hidden ${isDesktopLeftSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none'}`}>
        <div className="w-64 h-full">
          <HistorySidebar
            standardId={standardId}
            currentSessionId={sessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden h-full z-0 mt-20">
        <ChatHeader
          onToggleLeftSidebar={() => setIsLeftSidebarOpen(true)}
          onToggleRightSidebar={() => setIsSidebarOpen(true)}
          standardTitle={standard?.title}
        />
        <div className="flex-1 overflow-hidden flex flex-row w-full h-full pt-[64px]">
          {/* Main Chat Area */}
          <div className="w-full flex flex-col h-full border-r border-white/5 transition-all duration-500 relative">

            {/* Back to Chat button inside flashcards view removed from absolute position to avoid overlap */}

            {viewMode === "flashcards" ? (
              <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 sm:p-6 md:p-12 relative overflow-y-auto no-scrollbar bg-[#050505]">
                {/* Visual Ambient Glows specific to flashcard deck */}
                <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px]bg-[#00f0ff] text-[#0F111A]/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-xl flex flex-col min-h-full justify-between relative z-10 py-6">
                  {/* Deck Info Header */}
                  <div className="text-center space-y-4 mb-6 shrink-0">
                    <button
                      onClick={() => setViewMode("chat")}
                      className="inline-flex mx-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-gray-800 to-[#1F2937] hover:from-gray-700 hover:to-gray-800 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all border border-white/10 items-center gap-2.5 backdrop-blur-md shadow-2xl shrink-0"
                    >
                      <ArrowLeft size={13} className="text-gray-400" />
                      {"💬 Back to Chat Support"}
                    </button>
                    <div className="pt-2">
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-[0.25em]">
                        Interactive Study Deck
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight leading-snug mt-2">
                      {flashcardsData?.deck_title}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {flashcardsData?.iso_standard || standard?.code} • {flashcardsData?.difficulty || "intermediate"} level
                    </p>
                  </div>

                  {/* Tactile Card Workspace with Swipe Gestures */}
                  <div className="flex-1 flex items-center justify-center relative w-full my-4">
                    {isGeneratingFlashcards ? (
                      <div className="flex flex-col items-center justify-center gap-6">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                          <div className="absolute inset-0 rounded-full border-2 border-t-[#00F0FF] border-r-[#00F0FF] animate-spin" />
                          <Brain size={24} className="text-[#818CF8] animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] animate-pulse">Generating Flashcards</h4>
                          <p className="text-[10px] text-gray-500 font-bold max-w-[280px]">Our neural engine is analyzing the standard to formulate interactive study aids...</p>
                        </div>
                      </div>
                    ) : flashcardsData && flashcardsData.cards && flashcardsData.cards.length > 0 ? (
                      <div className="w-full relative flex flex-col items-center justify-center px-2 sm:px-4 md:px-12 select-none">

                        {/* Hover navigation arrows on desktop */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block z-20">
                          <button
                            onClick={() => {
                              if (currentCardIndex > 0) {
                                setIsCardFlipped(false);
                                setSwipeDirection(-1);
                                setTimeout(() => {
                                  setCurrentCardIndex(prev => prev - 1);
                                }, 100);
                              }
                            }}
                            disabled={currentCardIndex === 0}
                            className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all disabled:opacity-10 hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Animated Card Holder */}
                        <div className="w-full max-w-md aspect-[4/3] min-h-[240px] sm:min-h-[280px] relative perspective-1000">
                          <AnimatePresence initial={false} custom={swipeDirection} mode="wait">
                            <motion.div
                              key={currentCardIndex}
                              custom={swipeDirection}
                              initial={{ x: swipeDirection > 0 ? 150 : swipeDirection < 0 ? -150 : 0, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: swipeDirection > 0 ? -150 : swipeDirection < 0 ? 150 : 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              drag="x"
                              dragConstraints={{ left: 0, right: 0 }}
                              dragElastic={0.4}
                              onDragEnd={(e, info) => {
                                const swipeThreshold = 60;
                                if (info.offset.x < -swipeThreshold) {
                                  // Drag left -> Next card
                                  if (currentCardIndex < flashcardsData.cards.length - 1) {
                                    setIsCardFlipped(false);
                                    setSwipeDirection(1);
                                    setTimeout(() => {
                                      setCurrentCardIndex(prev => prev + 1);
                                    }, 50);
                                  }
                                } else if (info.offset.x > swipeThreshold) {
                                  // Drag right -> Prev card
                                  if (currentCardIndex > 0) {
                                    setIsCardFlipped(false);
                                    setSwipeDirection(-1);
                                    setTimeout(() => {
                                      setCurrentCardIndex(prev => prev - 1);
                                    }, 50);
                                  }
                                }
                              }}
                              onClick={() => setIsCardFlipped(!isCardFlipped)}
                              className="absolute inset-0 w-full h-full cursor-pointer preserve-3d"
                            >
                              <div className={`relative w-full h-full preserve-3d duration-700 ${isCardFlipped ? "rotate-y-180" : ""}`}>
                                {/* Front Face */}
                                <div className="absolute inset-0 w-full h-full backface-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-[#0E1116]/90 backdrop-blur-2xl p-5 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-[#818CF8] uppercase tracking-[0.2em]bg-[#00f0ff] text-[#0F111A]/10 px-3 py-1 rounded-full border border-brand-cyan/20">
                                      Question
                                    </span>
                                    <Sparkles size={14} className="text-[#818CF8]" />
                                  </div>
                                  <div className="flex-1 flex flex-col justify-center py-4 text-left">
                                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2 font-jetbrains-mono leading-snug">
                                      {flashcardsData.cards[currentCardIndex]?.front?.title}
                                    </h4>
                                    <p className="text-[13px] sm:text-base text-gray-300 font-medium leading-relaxed overflow-y-auto no-scrollbar max-h-[120px] sm:max-h-[160px]">
                                      {flashcardsData.cards[currentCardIndex]?.front?.body}
                                    </p>
                                  </div>
                                  <div className="text-center text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span>👈 Swipe to Navigate 👉</span>
                                    <span>•</span>
                                    <span className="text-gray-400">Click to Flip</span>
                                  </div>
                                </div>

                                {/* Back Face */}
                                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[2rem] sm:rounded-[2.5rem] border border-emerald-500/30 bg-[#0A0D10]/95 backdrop-blur-2xl p-5 sm:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(16,185,129,0.08)]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                      Answer Revealed
                                    </span>
                                    <CheckSquare size={14} className="text-emerald-400" />
                                  </div>
                                  <div className="flex-1 flex flex-col justify-center py-4 text-left">
                                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2 font-jetbrains-mono">
                                      {flashcardsData.cards[currentCardIndex]?.back?.title || "Answer"}
                                    </h4>
                                    <p className="text-[12px] sm:text-[14px] text-gray-200 font-bold leading-relaxed overflow-y-auto no-scrollbar max-h-[120px] sm:max-h-[140px]">
                                      {flashcardsData.cards[currentCardIndex]?.back?.body}
                                    </p>
                                  </div>
                                  <div className="text-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                    Click card to flip back
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block z-20">
                          <button
                            onClick={() => {
                              if (currentCardIndex < flashcardsData.cards.length - 1) {
                                setIsCardFlipped(false);
                                setSwipeDirection(1);
                                setTimeout(() => {
                                  setCurrentCardIndex(prev => prev + 1);
                                }, 100);
                              }
                            }}
                            disabled={currentCardIndex === flashcardsData.cards.length - 1}
                            className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all disabled:opacity-10 hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed"
                          >
                            <ChevronRight size={20} strokeWidth={2.5} />
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center p-8 border border-white/5 rounded-3xl bg-white/2 max-w-sm">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">No flashcards loaded</p>
                        <p className="text-[10px] text-gray-600 font-bold mb-4">Click below to generate compliance cards for this standard.</p>
                        <button
                          onClick={() => handleBuildFlashcards()}
                          className="px-5 py-2.5 bg-gradient-to-br from-brand-cyan to-[#8B5CF6] hover:from-[#4f4eed] hover:to-[#906cf7] text-white rounded-xl text-[11px] font-black uppercase tracking-wider shadow-lg shadow-brand-cyan/20"
                        >
                          Generate Deck
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Horizontal Progress Bar & Pagination (Mobile-friendly) */}
                  {flashcardsData && flashcardsData.cards && (
                    <div className="space-y-4 px-6 md:px-12 shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          Card {currentCardIndex + 1} of {flashcardsData.cards.length}
                        </span>
                        <span className="text-[10px] font-black text-emerald-400 font-jetbrains-mono">
                          {Math.round(((currentCardIndex + 1) / flashcardsData.cards.length) * 100)}% Complete
                        </span>
                      </div>

                      {/* Premium Progress Bar */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-brand-cyan shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentCardIndex + 1) / flashcardsData.cards.length) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>

                      {/* Small touch navigation buttons for mobile sizes */}
                      <div className="flex justify-between md:hidden pt-2">
                        <button
                          onClick={() => {
                            if (currentCardIndex > 0) {
                              setIsCardFlipped(false);
                              setSwipeDirection(-1);
                              setTimeout(() => {
                                setCurrentCardIndex(prev => prev - 1);
                              }, 100);
                            }
                          }}
                          disabled={currentCardIndex === 0}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white disabled:opacity-20 transition-all"
                        >
                          Prev Card
                        </button>
                        <button
                          onClick={() => {
                            if (currentCardIndex < flashcardsData.cards.length - 1) {
                              setIsCardFlipped(false);
                              setSwipeDirection(1);
                              setTimeout(() => {
                                setCurrentCardIndex(prev => prev + 1);
                              }, 100);
                            }
                          }}
                          disabled={currentCardIndex === flashcardsData.cards.length - 1}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white disabled:opacity-20 transition-all"
                        >
                          Next Card
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-hidden flex flex-col gap-1">
                  {isHistoryLoading ? (
                    <DocumentSkeleton />
                  ) : !isChatStarted ? (
                    !standard && isStandardLoading ? (
                      <DocumentSkeleton />
                    ) : (
                      <InitialChatView
                        title={standard?.title || t('library.isoStandardAnalysis')}
                        summary={standard?.summary || t('library.analyzingDetails')}
                        code={standard?.code || "SC-0000"}
                        category={standard?.category?.name || t('library.isoCompliance')}
                        standardId={standardId}
                        onActionClick={(action: string) => handleSend(action)}
                      />
                    )
                  ) : (
                    <MessageList
                      messages={messages}
                      isLoading={isChatSending}
                      onActionClick={(action: string) => handleSend(action)}
                      onStudyFlashcards={(deck) => {
                        setFlashcardsData(deck);
                        setViewMode("flashcards");
                        setCurrentCardIndex(0);
                        setIsCardFlipped(false);
                        setSwipeDirection(0);
                      }}
                    />
                  )}
                </div>

                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={(text?: string) => handleSend(text)}
                  isLoading={isChatSending}
                  showSuggestions={!isChatStarted}
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                />
              </>
            )}
          </div>

          {/* Standard Text Split View (Desktop) */}
          {/* {isChatStarted && standard && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="hidden xl:flex flex-col w-[40%] bg-[#0E1116] border-l border-white/5 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0A0A0C]/50 backdrop-blur-md">
                <div className="flex flex-col">
                  <h3 className="text-xs font-black text-[#818CF8] uppercase tracking-[0.2em] mb-1">{t('library.sourceMaterial')}</h3>
                  <p className="text-[11px] font-bold text-white truncate max-w-[300px]">{standard.title}</p>
                </div>
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400">
                  <FileText size={16} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-white leading-tight">{standard.title}</h4>
                    <div className="h-1 w-20bg-[#00f0ff] text-[#0F111A]" />
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-gray-400 leading-relaxed text-[15px] font-medium italic">
                      {standard.summary}
                    </p>
                    <div className="mt-8 space-y-6">
                      <div className="p-6 bg-white/2 border border-white/5 rounded-3xl">
                        <h5 className="text-[10px] font-black text-[#818CF8] uppercase tracking-widest mb-3">{t('library.contextTitle')}</h5>
                        <p className="text-gray-500 text-[13px] leading-relaxed font-medium">{t('library.contextDesc')}</p>
                      </div>
                      <div className="p-6 bg-white/2 border border-white/5 rounded-3xl">
                        <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">{t('library.leadershipTitle')}</h5>
                        <p className="text-gray-500 text-[13px] leading-relaxed font-medium">{t('library.leadershipDesc')}</p>
                      </div>
                      <div className="p-6 bg-white/2 border border-white/5 rounded-3xl">
                        <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">{t('library.planningTitle')}</h5>
                        <p className="text-gray-500 text-[13px] leading-relaxed font-medium">{t('library.planningDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )} */}
        </div>
      </div>

      <StudioSidebar
        studyTools={studyTools}
        onToolClick={(tool: StudyTool) => {
          if (tool.id === "build_flashcards") {
            handleBuildFlashcards();
          } else {
            handleSend(`Can you ${tool.title.toLowerCase()}?`);
          }
        }}
      />

      <AnimatePresence>
        {isLeftSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeftSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[140] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-[#0A0A0C] z-[150] lg:hidden shadow-2xl border-r border-white/5"
            >
              <HistorySidebar
                isMobile
                onClose={() => setIsLeftSidebarOpen(false)}
                standardId={standardId}
                currentSessionId={sessionId}
                onSessionSelect={handleSessionSelect}
                onNewChat={handleNewChat}
              />
            </motion.div>
          </>
        )}

        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[140] xl:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-[#0E1116] z-[150] xl:hidden shadow-2xl border-l border-white/5"
            >
              <StudioSidebar
                studyTools={studyTools}
                isMobile
                onClose={() => setIsSidebarOpen(false)}
                onToolClick={(tool: StudyTool) => {
                  if (tool.id === "build_flashcards") {
                    handleBuildFlashcards();
                  } else {
                    handleSend(`Can you ${tool.title.toLowerCase()} for this standard?`);
                  }
                  setIsSidebarOpen(false);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(63, 62, 237, 0.4);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.02);
        }
      ` }} />
    </div>
  );
};

export default ChatInterface;
