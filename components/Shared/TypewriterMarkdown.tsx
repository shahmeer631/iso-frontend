"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TypewriterMarkdownProps {
  content: string;
  speed?: number;
  onUpdate?: () => void;
}

const TypewriterMarkdown = ({
  content = "",
  speed = 5,
  onUpdate
}: TypewriterMarkdownProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset when a NEW content arrives
    setDisplayedText("");
    setIndex(0);
  }, [content]);

  useEffect(() => {
    if (speed === 0) {
      setDisplayedText(content);
      return;
    }
    if (index < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + content[index]);
        setIndex((prev) => prev + 1);
        onUpdate?.();
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, content, speed, onUpdate]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => <h3 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
        h2: ({ ...props }) => <h3 className="text-lg font-semibold text-gray-200 mt-3 mb-2" {...props} />,
        table: ({ ...props }) => (
          <div className="scrollable-table my-4 w-full rounded-xl border border-white/10 pb-2">
            <table className="w-full text-left border-collapse text-sm md:text-base min-w-[500px]" {...props} />
          </div>
        ),
        th: ({ ...props }) => <th className="border-b border-white/20 px-3 py-2 md:px-4 md:py-3 bg-white/5 font-bold text-white break-normal" {...props} />,
        td: ({ ...props }) => <td className="border-b border-white/10 px-3 py-2 md:px-4 md:py-3 break-normal align-top" {...props} />,
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
};

export default TypewriterMarkdown;
