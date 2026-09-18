"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Send, Sparkles } from "lucide-react";

export type AiAssistantChatMessage = {
  role: "user" | "ai";
  content: string;
};

type ChatInputMode = "input" | "textarea";

interface AiAssistantChatPanelProps {
  title: string;
  description: string;
  messages: AiAssistantChatMessage[];
  isSending: boolean;
  inputValue: string;
  placeholder: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  inputMode?: ChatInputMode;
  inputRef?: React.RefObject<HTMLDivElement | null>;
  bottomRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  maxHeightClassName?: string;
  inputClassName?: string;
  titleClassName?: string;
}

const FancyChatLoader = () => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phrases = [
    "AI is thinking...",
    "Analyzing your context...",
    "Mapping compliance protocols...",
    "Formulating expert response...",
    "Double checking standards..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 bg-[#131B2D] border border-[#67E8F9]/20 rounded-2xl rounded-tl-none shadow-[0_0_15px_rgba(103,232,249,0.1)]">
      <span className="text-[10px] md:text-xs font-semibold text-white uppercase tracking-wider animate-pulse leading-none">
        {phrases[phraseIdx]}
      </span>
    </div>
  );
};

/**
 * Build markdown component renderers.
 *
 * Key table strategy (mirrors iso-navigator / audit-lens pattern):
 *   - Outer card has `overflow-hidden`  → hard clip at card boundary
 *   - Message bubble has `overflow-hidden` → hard clip at bubble boundary
 *   - Table wrapper has `overflow-x-auto` → creates its own horizontal scroll
 *   - <table> uses `min-w-full`          → fills wrapper; wrapper scrolls, NOT the page
 *
 * This is exactly how iso-navigator handles large tables inside its
 * `overflow-y-auto` content panel.
 */
const buildMarkdownComponents = (role: "user" | "ai") => {
  const bodyTextClass   = role === "user" ? "text-[#0A0F1C]"             : "text-[#D1D5DB]";
  const strongTextClass = role === "user" ? "font-black text-[#0A0F1C]"  : "font-black text-[#F8F9FA]";
  const headingClass    = role === "user" ? "text-[#0A0F1C]"             : "text-[#F8F9FA]";
  const borderColor     = role === "user" ? "border-[#0A0F1C]/20"        : "border-[#1E293B]";
  const tableHeadBg     = role === "user" ? "bg-[#67E8F9]/20"            : "bg-[#0A0F1C]";
  const tableBg         = role === "user" ? "bg-[#67E8F9]/10"            : "bg-[#0A0F1C]/30";

  return {
    // ── Headings ─────────────────────────────────────────────────────────────
    h1: (props: React.ComponentProps<"h1">) => (
      <h1
        className={`!text-[12px] sm:!text-[14px] md:!text-[17px] font-black mb-4 border-b ${borderColor} pb-2 uppercase tracking-wide ${headingClass}`}
        {...props}
      />
    ),
    h2: (props: React.ComponentProps<"h2">) => (
      <h2
        className={`!text-[11px] sm:!text-[13px] md:!text-[15px] font-black mt-5 mb-3 uppercase tracking-wide ${headingClass}`}
        {...props}
      />
    ),
    h3: (props: React.ComponentProps<"h3">) => (
      <h3
        className={`!text-[10px] sm:!text-[11px] md:!text-[13px] font-bold mt-4 mb-2 uppercase tracking-wide ${headingClass}`}
        {...props}
      />
    ),

    // ── Inline elements ───────────────────────────────────────────────────────
    p:      (props: React.ComponentProps<"p">)      => <p      className={`${bodyTextClass} mb-3 leading-relaxed text-sm`}  {...props} />,
    strong: (props: React.ComponentProps<"strong">) => <strong className={strongTextClass}                                  {...props} />,

    // ── Lists ─────────────────────────────────────────────────────────────────
    ul: (props: React.ComponentProps<"ul">) => (
      <ul className={`list-disc pl-5 mb-4 space-y-1.5 ${bodyTextClass}`} {...props} />
    ),
    ol: (props: React.ComponentProps<"ol">) => (
      <ol className={`list-decimal pl-5 mb-4 space-y-1.5 ${bodyTextClass}`} {...props} />
    ),
    li: (props: React.ComponentProps<"li">) => (
      <li className={`leading-relaxed text-sm ${bodyTextClass}`} {...props} />
    ),

    // ── Code ─────────────────────────────────────────────────────────────────
    code: (props: React.ComponentProps<"code">) => (
      <code
        className="bg-[#0A0F1C] text-[#67E8F9] rounded px-1.5 py-0.5 text-[11px] font-mono"
        {...props}
      />
    ),

    // ── TABLE — iso-navigator / audit-lens pattern ────────────────────────────
    //
    //  ┌─ bubble: overflow-hidden ─────────────────────────────────────────┐
    //  │ ┌─ table wrapper: overflow-x-auto ───────────────────────────┐   │
    //  │ │  <table min-w-full>  ← fills wrapper; wrapper scrolls      │   │
    //  │ └────────────────────────────────────────────────────────────┘   │
    //  └───────────────────────────────────────────────────────────────────┘
    //
    table: (props: React.ComponentProps<"table">) => (
      <div
        className={`overflow-x-auto my-4 rounded-xl border ${borderColor} ${tableBg} shadow-inner`}
      >
        <table
          className="min-w-full border-collapse"
          {...props}
        />
      </div>
    ),
    thead: (props: React.ComponentProps<"thead">) => (
      <thead className={tableHeadBg} {...props} />
    ),
    th: (props: React.ComponentProps<"th">) => (
      <th
        className={`border-b ${borderColor} px-3 py-2 md:px-4 md:py-3 text-left text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap ${headingClass}`}
        {...props}
      />
    ),
    td: (props: React.ComponentProps<"td">) => (
      <td
        className={`border-b ${borderColor}/60 px-3 py-2 md:px-4 md:py-3 text-[11px] md:text-sm align-top leading-relaxed ${bodyTextClass}`}
        {...props}
      />
    ),
    tbody: (props: React.ComponentProps<"tbody">) => (
      <tbody className="[&>tr:nth-child(even)]:bg-white/[0.03] [&>tr:hover]:bg-[#67E8F9]/[0.05] transition-colors" {...props} />
    ),
  };
};

export default function AiAssistantChatPanel({
  title,
  description,
  messages,
  isSending,
  inputValue,
  placeholder,
  onInputChange,
  onSubmit,
  inputMode = "input",
  inputRef,
  bottomRef,
  onScroll,
  maxHeightClassName = "max-h-[400px]",
  inputClassName,
  titleClassName,
}: AiAssistantChatPanelProps) {
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const containerRef = inputRef ?? fallbackRef;

  return (
    // ① Outer card — `overflow-hidden` is the hard boundary for everything inside.
    //   This is the same pattern as the right-column card in iso-navigator (line 710).
    <div className="w-full bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="p-2 sm:p-3 md:p-6 flex items-center gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50">
        <div className="p-2 bg-[#67E8F9]/10 rounded-xl border border-[#67E8F9]/20 shrink-0">
          <Sparkles className="w-5 h-5 text-brand-cyan" />
        </div>
        <div className="min-w-0">
          <h3 className={`text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-[#F1F5F9] uppercase tracking-wider ${titleClassName ?? ""}`.trim()}>
            {title}
          </h3>
          <p className="text-[10px] text-[#4B5563] font-black uppercase tracking-widest mt-1 truncate">
            {description}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-2 sm:p-3 md:p-8 space-y-6">

        {/* ② Messages scroll area — `overflow-y-auto` ONLY (no overflow-x-hidden!).
              Mirrors iso-navigator's `div className="…flex-1 overflow-y-auto…"` (line 768).
              overflow-x is handled by ① (the outer card's overflow-hidden). */}
        {(messages.length > 0 || isSending) && (
          <div
            ref={containerRef}
            onScroll={onScroll}
            className={`bg-[#0A0F1C] border border-[#67E8F9]/15 rounded-2xl p-2 sm:p-3 md:p-6 overflow-y-auto custom-thin-scrollbar flex flex-col space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300 ${maxHeightClassName}`.trim()}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* ③ Message bubble — `overflow-hidden` clips table at bubble edge.
                      User bubble: fixed max-width (chat-style).
                      AI bubble:   full width so wide tables have maximum room. */}
                <div
                  className={`
                    overflow-hidden rounded-2xl text-xs sm:text-sm font-medium leading-relaxed
                    ${msg.role === "user"
                      ? "max-w-[85%] bg-[#67E8F9] text-[#0A0F1C] rounded-tr-none p-1.5 sm:p-2.5 md:p-4 shadow-[0_4px_15px_-3px_rgba(103,232,249,0.35)] border border-[#67E8F9]/30"
                      : "w-full bg-[#131B2D] border border-[#67E8F9]/15 text-[#9CA3AF] rounded-tl-none p-1.5 sm:p-2.5 md:p-4"
                    }
                  `}
                >
                  {/* ④ Prose wrapper — `max-w-none` lets content fill the bubble.
                        The `overflow-x-auto` on the TABLE WRAPPER (inside buildMarkdownComponents)
                        creates the actual horizontal scroll context for wide tables. */}
                  <div className={`ai-chat-markdown prose prose-sm max-w-none ${msg.role === "user" ? "text-black" : "prose-invert text-[#9CA3AF]"}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={buildMarkdownComponents(msg.role)}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isSending && (
              <div className="flex justify-start">
                <FancyChatLoader />
              </div>
            )}

            {bottomRef ? <div ref={bottomRef} /> : null}
          </div>
        )}

        {/* ── Input form ── */}
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="relative"
        >
          {inputMode === "textarea" ? (
            <textarea
              className={`w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-3 md:p-6 pr-12 md:pr-16 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#67E8F9]/30 focus:border-[#67E8F9] transition-all min-h-[70px] md:min-h-[100px] resize-none font-medium text-[#F1F5F9] placeholder-[#4B5563] ${inputClassName ?? ""}`.trim()}
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
              }}
            />
          ) : (
            <input
              type="text"
              className={`w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-4 md:p-6 pr-14 md:pr-16 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#67E8F9]/30 focus:border-[#67E8F9] transition-all font-medium text-[#F1F5F9] placeholder-[#4B5563] ${inputClassName ?? ""}`.trim()}
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
            />
          )}

          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className={`absolute right-3 ${inputMode === "textarea" ? "bottom-3 md:bottom-6" : "top-1/2 -translate-y-1/2"} p-2 md:p-3 bg-[#67E8F9] text-[#0A0F1C] rounded-xl hover:bg-[#22D3EE] disabled:opacity-30 transition-all shadow-[0_10px_20px_-8px_rgba(103,232,249,0.45)] active:scale-95`}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}