"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { clearResults } from "@/lib/redux/features/benchmarkSlice";
import { ISOSuggestion } from "@/types/benchmark";
import {
  Upload,
  BookOpen,
  ChevronRight,
  Lock,
  Type,
  BarChart,
  Sparkles,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { ISOSuggestionModal } from "./ISOSuggestionModal";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";

interface ISOSuggestionsPageProps {
  suggestions: ISOSuggestion[];
  onReset: () => void;
}

export default function ISOSuggestionsPage({
  suggestions,
  onReset,
}: ISOSuggestionsPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const lang = params?.lang || "en";
  const { t } = useTranslation();

  // Sync i18n language with the URL [lang] param
  React.useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  const [selectedSuggestion, setSelectedSuggestion] = useState<ISOSuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuggestionClick = (suggestion: ISOSuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsModalOpen(true);
  };

  const handleReset = () => {
    dispatch(clearResults());
    onReset();
  };

  return (
    <div className="min-h-screen bg-[var(--ib-bg)] space-y-8 md:space-y-12 animate-in fade-in duration-500 p-4 md:p-8">
      {/* Header */}
      <header className="space-y-4 px-2 sm:px-0 mb-12">
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1 bg-[var(--ib-accbg)]  border border-[var(--ib-acc)]/20 rounded-full">
            <span className=" text-[10px] text-[var(--ib-acc)]  uppercase tracking-[0.3em]">
              {t('benchmarkAi.badgeResults') || "ISO Suggestions"}
            </span>
          </div>
        </div>
        <h1 className="text-5xl lg:text-[52px] font-semibold text-white leading-[1.1] tracking-tight text-center mb-8 animate-in fade-in duration-500">
          {t('benchmarkAi.suggestionsHeading') || "Recommended ISO Standards"}
        </h1>

        <p className="text-[var(--ib-mute)] text-sm lg:text-lg max-w-4xl mx-auto leading-relaxed text-center font-inter mb-12">
          {t('benchmarkAi.suggestionsDesc') || "Explore applicable ISO standards based on your document content"}
        </p>
      </header>

      <div className="w-full py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* ── Sidebar ── */}
        <aside className="bg-[var(--ib-card)] rounded-3xl border border-[var(--ib-line)] shadow-2xl p-6 space-y-6 self-start">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[var(--ib-accbg)] text-[var(--ib-acc)] rounded-xl">
              <Sparkles className="w-4 h-4 text-[var(--ib-acc)]" />
            </div>
            <h2 className="text-sm font-black text-[var(--ib-ink)] uppercase tracking-wider">
              {t('benchmarkAi.suggestions') || "Suggestions"}
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-[var(--ib-mute)] uppercase tracking-widest">
              Found {suggestions.length} applicable standards
            </p>
            <div className="text-[12px] text-[var(--ib-mute)] space-y-2">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#1A243A] cursor-pointer transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <BookOpen className="w-3 h-3 text-[var(--ib-acc)]" />
                  <span className="line-clamp-2 font-medium">{suggestion.standard}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-4 rounded-xl bg-[var(--ib-acc)] text-white text-white hover:bg-[var(--ib-acc)]/90 text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 inline-block mr-2" />
            {t('benchmarkAi.uploadAnother') || "Upload Another"}
          </button>

          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 text-xs text-green-700 flex items-start gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span>{t('benchmarkAi.suggestionsReady') || "Suggestions ready to review"}</span>
          </div>

          <div className="text-[10px] text-[var(--ib-mute)] space-y-2 pt-4 border-t border-[var(--ib-line)] font-medium">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-blue-500" />
              <span>{t('benchmarkAi.processedSecurely')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Type className="w-3 h-3 text-blue-500" />
              <span>{t('benchmarkAi.ocrTech')}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="w-3 h-3 text-blue-500" />
              <span>{t('benchmarkAi.isoCompliance')}</span>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="space-y-5">
          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-[var(--ib-card)] rounded-3xl border border-[var(--ib-line)] shadow-2xl p-6 md:p-8 cursor-pointer transition-all hover:border-[var(--ib-acc)]/50 hover:shadow-[0_0_30px_rgba(27, 77, 219,0.2)] group"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-[var(--ib-accbg)] text-[var(--ib-acc)] rounded-xl border border-[var(--ib-acc)]/20 group-hover:bg-[var(--ib-acc)] group-hover:text-white group-hover:border-[var(--ib-acc)] transition-all">
                        <BookOpen className="w-5 h-5 text-[var(--ib-acc)] group-hover:text-[var(--ib-ink)]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[var(--ib-ink)] mb-1">
                          {suggestion.standard}
                        </h3>
                        <p className="text-sm font-bold text-[var(--ib-acc)]">
                          {suggestion.title}
                        </p>
                      </div>
                    </div>

                    {/* Relevance */}
                    <p className="text-sm text-[var(--ib-mute)] leading-relaxed mb-6 ml-16">
                      {suggestion.relevance}
                    </p>

                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ml-16">
                      <div className="bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-xl p-3">
                        <p className="text-[10px] text-[var(--ib-mute)] font-bold uppercase tracking-wider mb-1">
                          Documents
                        </p>
                        <p className="text-lg font-black text-[var(--ib-ok)]">
                          {suggestion.documents.length}
                        </p>
                      </div>
                      <div className="bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-xl p-3">
                        <p className="text-[10px] text-[var(--ib-mute)] font-bold uppercase tracking-wider mb-1">
                          Records
                        </p>
                        <p className="text-lg font-black text-[var(--ib-acc)]">
                          {suggestion.records.length}
                        </p>
                      </div>
                      <div className="bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-xl p-3 col-span-2 md:col-span-1">
                        <p className="text-[10px] text-[var(--ib-mute)] font-bold uppercase tracking-wider mb-1">
                          {t('dynamic.dyn_items_400')}</p>
                        <p className="text-lg font-black text-[var(--ib-ok)]">
                          {suggestion.documents.length + suggestion.records.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-center pt-1">
                    <button className="p-3 bg-[var(--ib-accbg)] text-[var(--ib-acc)] border border-[var(--ib-acc)]/20 rounded-xl group-hover:bg-[var(--ib-acc)] group-hover:text-white group-hover:border-[var(--ib-acc)] transition-all shadow-lg">
                      <ChevronRight className="w-6 h-6 text-[var(--ib-acc)] group-hover:text-[var(--ib-ink)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-[var(--ib-card)] rounded-3xl border border-[var(--ib-line)] shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ib-accbg)] blur-[60px] rounded-full" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-black text-[var(--ib-ink)] uppercase tracking-widest flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" /> How to Use These Suggestions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-[var(--ib-accbg)] text-[var(--ib-acc)] rounded-lg h-fit">
                    <BookOpen className="w-5 h-5 text-[var(--ib-acc)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--ib-ink)] mb-1">Review Standards</p>
                    <p className="text-sm text-[var(--ib-mute)]">
                      Click on any standard to see required documents and records
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-[var(--ib-accbg)] text-[var(--ib-acc)] rounded-lg h-fit">
                    <CheckCircle2 className="w-5 h-5 text-[var(--ib-ok)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--ib-ink)] mb-1">Plan Implementation</p>
                    <p className="text-sm text-[var(--ib-mute)]">
                      Use the detailed information to plan your compliance journey
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ISOSuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        suggestion={selectedSuggestion}
      />
    </div>
  );
}
