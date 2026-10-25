"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles } from "lucide-react";

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
    "Double checking standards...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-[12px_12px_12px_4px] border border-[var(--ib-line)] bg-[var(--ib-accbg)] p-3">
      <span className="animate-pulse text-[10px] font-semibold uppercase tracking-wider leading-none text-[var(--ib-acc)] md:text-xs">
        {phrases[phraseIdx]}
      </span>
    </div>
  );
};

const buildMarkdownComponents = (role: "user" | "ai") => {
  const bodyTextClass =
    role === "user" ? "text-white" : "text-[var(--ib-ink)]";
  const strongTextClass =
    role === "user" ? "font-semibold text-white" : "font-semibold text-[var(--ib-ink)]";
  const headingClass =
    role === "user" ? "text-white" : "text-[var(--ib-ink)]";
  const borderColor =
    role === "user" ? "border-white/25" : "border-[var(--ib-line)]";
  const tableHeadBg =
    role === "user" ? "bg-white/15" : "bg-[var(--ib-bg)]";
  const tableBg =
    role === "user" ? "bg-white/10" : "bg-[var(--ib-card)]";

  return {
    h1: (props: React.ComponentProps<"h1">) => (
      <h1
        className={`!text-[12px] sm:!text-[14px] md:!text-[17px] mb-4 border-b pb-2 font-bold tracking-wide ${borderColor} ${headingClass}`}
        {...props}
      />
    ),
    h2: (props: React.ComponentProps<"h2">) => (
      <h2
        className={`!text-[11px] sm:!text-[13px] md:!text-[15px] mt-5 mb-3 font-bold tracking-wide ${headingClass}`}
        {...props}
      />
    ),
    h3: (props: React.ComponentProps<"h3">) => (
      <h3
        className={`!text-[10px] sm:!text-[11px] md:!text-[13px] mt-4 mb-2 font-semibold tracking-wide ${headingClass}`}
        {...props}
      />
    ),
    p: (props: React.ComponentProps<"p">) => (
      <p className={`${bodyTextClass} mb-3 text-sm leading-relaxed`} {...props} />
    ),
    strong: (props: React.ComponentProps<"strong">) => (
      <strong className={strongTextClass} {...props} />
    ),
    ul: (props: React.ComponentProps<"ul">) => (
      <ul className={`mb-4 list-disc space-y-1.5 pl-5 ${bodyTextClass}`} {...props} />
    ),
    ol: (props: React.ComponentProps<"ol">) => (
      <ol className={`mb-4 list-decimal space-y-1.5 pl-5 ${bodyTextClass}`} {...props} />
    ),
    li: (props: React.ComponentProps<"li">) => (
      <li className={`text-sm leading-relaxed ${bodyTextClass}`} {...props} />
    ),
    code: (props: React.ComponentProps<"code">) => (
      <code
        className="rounded-[5px] bg-[var(--ib-accbg)] px-[7px] py-px font-mono text-[11px] font-semibold text-[var(--ib-acc)]"
        {...props}
      />
    ),
    table: (props: React.ComponentProps<"table">) => (
      <div
        className={`my-4 overflow-x-auto rounded-xl border shadow-none ${borderColor} ${tableBg}`}
      >
        <table className="min-w-full border-collapse" {...props} />
      </div>
    ),
    thead: (props: React.ComponentProps<"thead">) => (
      <thead className={tableHeadBg} {...props} />
    ),
    th: (props: React.ComponentProps<"th">) => (
      <th
        className={`whitespace-nowrap border-b px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-[0.15em] md:px-4 md:py-3 md:text-[10px] ${borderColor} ${headingClass}`}
        {...props}
      />
    ),
    td: (props: React.ComponentProps<"td">) => (
      <td
        className={`border-b px-3 py-2 align-top text-[11px] leading-relaxed md:px-4 md:py-3 md:text-sm ${borderColor}/60 ${bodyTextClass}`}
        {...props}
      />
    ),
    tbody: (props: React.ComponentProps<"tbody">) => (
      <tbody
        className="transition-colors [&>tr:nth-child(even)]:bg-[var(--ib-bg)] [&>tr:hover]:bg-[var(--ib-accbg)]"
        {...props}
      />
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
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-[0_24px_60px_-24px_rgba(11,18,32,0.25)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-[var(--ib-line)] bg-[var(--ib-bg)] p-3 md:p-6">
        <div className="shrink-0 rounded-[10px] border border-[var(--ib-line)] bg-[var(--ib-accbg)] p-2">
          <Sparkles className="h-5 w-5 text-[var(--ib-acc)]" />
        </div>
        <div className="min-w-0">
          <h3
            className={`text-sm font-semibold tracking-tight text-[var(--ib-ink)] md:text-base ${titleClassName ?? ""}`.trim()}
          >
            {title}
          </h3>
          <p className="mt-1 truncate text-[12px] font-medium text-[var(--ib-mute)]">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-6 p-3 md:p-8">
        {(messages.length > 0 || isSending) && (
          <div
            ref={containerRef}
            onScroll={onScroll}
            className={`custom-thin-scrollbar flex flex-col space-y-4 overflow-y-auto rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-3 md:space-y-6 md:p-6 ${maxHeightClassName}`.trim()}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`overflow-hidden rounded-2xl text-xs font-medium leading-relaxed sm:text-sm ${
                    msg.role === "user"
                      ? "max-w-[85%] rounded-tr-none border border-[var(--ib-acc)] bg-[var(--ib-acc)] p-2.5 text-white md:p-4"
                      : "w-full rounded-tl-none border border-[var(--ib-line)] bg-[var(--ib-card)] p-2.5 text-[var(--ib-ink)] md:p-4"
                  }`}
                >
                  <div
                    className={`ai-chat-markdown prose prose-sm max-w-none ${
                      msg.role === "user" ? "text-white" : "text-[var(--ib-ink)]"
                    }`}
                  >
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

            {isSending && (
              <div className="flex justify-start">
                <FancyChatLoader />
              </div>
            )}

            {bottomRef ? <div ref={bottomRef} /> : null}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="relative"
        >
          {inputMode === "textarea" ? (
            <textarea
              className={`min-h-[70px] w-full resize-none rounded-[10px] border border-[var(--ib-line)] bg-[var(--ib-card)] p-3 pr-12 text-sm font-medium text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)] transition-all focus:border-[var(--ib-acc)] focus:outline-none focus:ring-2 focus:ring-[var(--ib-acc)]/30 md:min-h-[100px] md:p-4 md:pr-16 ${inputClassName ?? ""}`.trim()}
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />
          ) : (
            <input
              type="text"
              className={`w-full rounded-[10px] border border-[var(--ib-line)] bg-[var(--ib-card)] p-4 pr-14 text-sm font-medium text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)] transition-all focus:border-[var(--ib-acc)] focus:outline-none focus:ring-2 focus:ring-[var(--ib-acc)]/30 md:pr-16 ${inputClassName ?? ""}`.trim()}
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
            />
          )}

          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className={`absolute right-3 ${
              inputMode === "textarea"
                ? "bottom-3 md:bottom-4"
                : "top-1/2 -translate-y-1/2"
            } rounded-[10px] border border-[var(--ib-acc)] bg-[var(--ib-acc)] p-2 text-white transition-all hover:opacity-92 disabled:opacity-30 active:scale-95 md:p-3`}
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
