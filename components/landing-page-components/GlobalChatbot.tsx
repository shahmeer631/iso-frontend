"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { X, MessageCircle, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useChatSimpleMutation } from "@/lib/redux/api/auditLensApi";
import "@/lib/i18n/client";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  displayedContent?: string;
  isStreaming?: boolean;
}

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSimple, { isLoading: isProcessing }] = useChatSimpleMutation();
  const { t } = useTranslation();
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userScrolledUpRef = useRef(false);
  const lastChatScrollTop = useRef(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (!userScrolledUpRef.current) {
      container.scrollTop = container.scrollHeight;
      lastChatScrollTop.current = container.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  const handleChatScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

    if (container.scrollTop < lastChatScrollTop.current && distanceFromBottom > 60) {
      userScrolledUpRef.current = true;
    } else if (distanceFromBottom <= 60) {
      userScrolledUpRef.current = false;
    }
    lastChatScrollTop.current = container.scrollTop;
  };

  const streamAIMessage = (fullContent: string) => {
    let charIndex = 0;

    setChatHistory((prev) => [
      ...prev,
      { role: "ai", content: fullContent, displayedContent: "", isStreaming: true },
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

  const handleProcess = async () => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: query };
    setChatHistory((prev) => [...prev, userMsg]);
    userScrolledUpRef.current = false;
    setQuery("");

    try {
      const res = await chatSimple({
        messages: [{ content: userMsg.content }],
        context: { full_document_context: "User asked from global chatbot" },
        session_id: "global_" + Math.random().toString(36).substring(7),
      }).unwrap();

      const aiResponse =
        res.messages?.[res.messages.length - 1]?.content ||
        res.data?.response ||
        "I received your message but couldn't generate a response.";

      streamAIMessage(aiResponse);
    } catch (err) {
      streamAIMessage("Sorry, I couldn't process that request right now.");
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
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] max-h-[calc(100vh-8rem)] bg-[#0A0F1C] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <Image src="/Icon.png" alt="Ask AI" width={24} height={24} />
                <span className="font-bold text-white text-sm">Ask AI</span>
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
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
                    Ask me anything about ISO standards, risk management, or compliance.
                  </p>
                  
                  {/* Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    {[
                      t('heroPills.pill1', "What are the requirements of ISO 9001?"),
                      t('heroPills.pill2', "Explain ISO 27001 controls"),
                    ].map((pill, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(pill); }}
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
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              img: ({ node, ...props }) => (
                                <h3 className="text-center">
                                  <img {...props} className="inline-block max-w-full h-auto" alt={props.alt || "image"} />
                                </h3>
                              ),
                              h1: ({ node, ...props }) => <h3 className="text-[#00f0ff]" {...props} />,
                              h2: ({ node, ...props }) => <h4 className="text-[#00f0ff]" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-[#00f0ff]" {...props} />,
                              h4: ({ node, ...props }) => <h4 className="text-[#00f0ff]" {...props} />,
                              table: ({ node, ...props }) => (
                                <div className="scrollable-table my-4 w-full rounded-xl border border-white/10 pb-2 overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-xs md:text-sm" {...props} />
                                </div>
                              ),
                              th: ({ node, ...props }) => <th className="border-b border-white/20 px-2 py-2 bg-white/5 font-bold text-white break-normal" {...props} />,
                              td: ({ node, ...props }) => <td className="border-b border-white/10 px-2 py-2 break-normal align-top" {...props} />,
                            }}
                          >
                            {msg.displayedContent ?? msg.content}
                          </ReactMarkdown>
                          {msg.isStreaming && (
                            <span className="inline-block w-0.5 h-3.5 bg-[#00f0ff] ml-0.5 animate-pulse align-middle" />
                          )}
                          {!msg.isStreaming && (
                            <div className="mt-2 flex justify-end">
                              <button 
                                onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("Copied to clipboard"); }}
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

              {/* Loading dots */}
              {isProcessing && (
                <div className="flex justify-start mb-4">
                  <div className="p-3 rounded-2xl bg-white/5 text-gray-300 border border-white/10 rounded-tl-none">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <div className="flex items-center gap-2 bg-[#0A0F1C] border border-white/10 rounded-full px-3 py-1.5 focus-within:border-[#00f0ff]/50 transition-colors">
                <input
                  type="text"
                  placeholder={t('dynamic.dyn_askaboutISO42001_51', "Ask about ISO compliance...")}
                  className="flex-1 bg-transparent border-none text-white px-2 py-1.5 focus:outline-none placeholder:text-gray-500 font-inter text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleProcess(); }}
                />
                <button
                  onClick={handleProcess}
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

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="w-14 h-14 bg-[#00f0ff] hover:bg-cyan-400 text-black rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50 cursor-pointer"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
