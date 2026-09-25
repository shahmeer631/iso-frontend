"use client";

/* react-markdown custom renderers use loose prop shapes (same pattern as Navigator) */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import { ChevronDown, Download, AlertTriangle } from "lucide-react";
import { CopyControl } from "@/components/AIAssistant/CopyControl";

/* ─── helpers ─────────────────────────────────────────────────────────── */

function cleanMarkdown(raw: string) {
  let content = raw || "";
  content = content.replace(/\\n/g, "\n").replace(/&nbsp;/g, " ");
  content = content.trim();
  if (content.startsWith("```")) {
    const firstNewline = content.indexOf("\n");
    if (firstNewline !== -1) content = content.substring(firstNewline + 1);
    const lastFence = content.lastIndexOf("```");
    if (lastFence !== -1) content = content.substring(0, lastFence);
  }
  content = content.replace(/^(#+)([^\s#])/gm, "$1 $2");
  return content.trim();
}

function mergeClass(base: string, className?: string) {
  return [base, className].filter(Boolean).join(" ");
}

function normalizeComparable(text: string) {
  return cleanMarkdown(text).replace(/\s+/g, " ").trim().toLowerCase();
}

const CLAUSE_RE =
  /(\b(?:ISO|IEC|ISO\/IEC)\s*[\d.:/-]+(?:\s*[:§]\s*[\d.A-Za-z]+)?|\bClause\s+[\d.]+(?:\.[\d]+)*|\b§\s*[\d.A-Za-z]+|\bRef\.?\s*:?\s*[\d.A-Za-z]+)/gi;

function flattenText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (isValidElement(node)) {
    return flattenText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

function extractClauses(text: string): string[] {
  const found: string[] = [];
  CLAUSE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CLAUSE_RE.exec(text)) !== null) {
    found.push(match[0].trim());
  }
  return [...new Set(found)];
}

function stripClauses(text: string) {
  return text.replace(CLAUSE_RE, " ").replace(/\s{2,}/g, " ").trim();
}

function decorateInline(children: React.ReactNode): React.ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      CLAUSE_RE.lastIndex = 0;
      if (!CLAUSE_RE.test(child)) return child;
      CLAUSE_RE.lastIndex = 0;
      const parts: React.ReactNode[] = [];
      let last = 0;
      let match: RegExpExecArray | null;
      let i = 0;
      while ((match = CLAUSE_RE.exec(child)) !== null) {
        if (match.index > last) parts.push(child.slice(last, match.index));
        parts.push(
          <span
            key={`c-${i++}-${match.index}`}
            className="inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded-md bg-[#0D9488]/15 text-[#5EEAD4] font-jetbrains-mono text-[13px] font-medium leading-[1.4] tracking-[0.02em] align-middle"
          >
            {match[0]}
          </span>,
        );
        last = match.index + match[0].length;
      }
      if (last < child.length) parts.push(child.slice(last));
      return parts;
    }
    if (isValidElement(child)) {
      const nested = (child.props as { children?: React.ReactNode }).children;
      if (nested == null) return child;
      return React.cloneElement(child, {
        ...(child.props as object),
        children: decorateInline(nested),
      } as any);
    }
    return child;
  });
}

function splitByHeading(
  markdown: string,
  level: "#" | "##" | "###" = "###",
): Array<{ title: string; body: string }> {
  const text = cleanMarkdown(markdown);
  if (!text) return [];
  const re =
    level === "#" ? /^#\s+/m : level === "##" ? /^##\s+/m : /^###\s+/m;
  const splitRe =
    level === "#"
      ? /\n(?=#\s+)/
      : level === "##"
        ? /\n(?=##\s+)/
        : /\n(?=###\s+)/;
  if (!re.test(text)) return [{ title: "", body: text }];
  const parts = text.split(splitRe);
  const out: Array<{ title: string; body: string }> = [];
  for (const part of parts) {
    const match =
      level === "#"
        ? part.match(/^#\s+([^\n]+)\n?([\s\S]*)$/)
        : level === "##"
          ? part.match(/^##\s+([^\n]+)\n?([\s\S]*)$/)
          : part.match(/^###\s+([^\n]+)\n?([\s\S]*)$/);
    if (match) out.push({ title: match[1].trim(), body: match[2].trim() });
    else if (part.trim()) out.push({ title: "", body: part.trim() });
  }
  return out.filter((p) => p.body.length > 0 || p.title.length > 0);
}

/** Parse evidence-style blocks without requiring ### headings. */
function parseEvidenceCards(
  markdown: string,
): Array<{ name: string; body: string; clauses: string[] }> {
  const cleaned = cleanMarkdown(markdown);
  let parts = splitByHeading(cleaned, "###");
  if (parts.length <= 1) parts = splitByHeading(cleaned, "##");

  if (parts.length > 1 || (parts.length === 1 && parts[0].title)) {
    return parts.map((part) => {
      const clauses = extractClauses(`${part.title}\n${part.body}`);
      const body = part.body
        .replace(/\n?\s*\*?Ref\.?\s*:?\s*[\d.A-Za-z]+\*?\s*$/gim, "")
        .trim();
      return {
        name: part.title || "Evidence item",
        body: body || part.body,
        clauses,
      };
    });
  }

  // Bold-title blocks: **Evidence Name** then bullets
  const boldBlocks = cleaned.split(/\n(?=\*\*[^*\n]{3,}\*\*)/);
  if (boldBlocks.length > 1) {
    return boldBlocks
      .map((block) => {
        const m = block.match(/^\*\*([^*]+)\*\*\s*\n?([\s\S]*)$/);
        if (!m) return null;
        const name = m[1].trim();
        const body = m[2].trim();
        return {
          name,
          body,
          clauses: extractClauses(`${name}\n${body}`),
        };
      })
      .filter(Boolean) as Array<{ name: string; body: string; clauses: string[] }>;
  }

  // Numbered items: 1. Name — details
  const numbered = cleaned.match(/^\d+\.\s+.+/gm);
  if (numbered && numbered.length >= 2) {
    const chunks = cleaned.split(/\n(?=\d+\.\s+)/);
    return chunks
      .map((chunk) => {
        const m = chunk.match(/^\d+\.\s+([^\n]+)(?:\n([\s\S]*))?$/);
        if (!m) return null;
        const name = m[1].replace(/\*\*/g, "").trim();
        const body = (m[2] || "").trim() || name;
        return {
          name,
          body: body === name ? "" : body,
          clauses: extractClauses(chunk),
        };
      })
      .filter(Boolean) as Array<{ name: string; body: string; clauses: string[] }>;
  }

  // Bullet evidence lines: - **Name** — action details
  const bulletEvidence = cleaned.match(/^\s*[-*]\s+\*\*[^*]+\*\*.+$/gm);
  if (bulletEvidence && bulletEvidence.length >= 2) {
    return bulletEvidence.map((line) => {
      const m = line.match(/^\s*[-*]\s+\*\*([^*]+)\*\*\s*[:—-]?\s*(.*)$/);
      const name = m?.[1]?.trim() || line;
      const rest = m?.[2]?.trim() || "";
      return {
        name,
        body: rest ? `- ${rest}` : "",
        clauses: extractClauses(line),
      };
    });
  }

  // Plain bullet list → one evidence card with verification actions
  if (/^\s*[-*]\s+/m.test(cleaned) && (cleaned.match(/^\s*[-*]\s+/gm) || []).length >= 2) {
    return [
      {
        name: "Evidence checklist",
        body: cleaned,
        clauses: extractClauses(cleaned),
      },
    ];
  }

  return [{ name: "Evidence item", body: cleaned, clauses: extractClauses(cleaned) }];
}

function extractMarkdownTables(markdown: string): string[][][] {
  const tables: string[][][] = [];
  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (!/\|/.test(lines[i]) || !lines[i + 1] || !/^\s*\|?[\s-:|]+$/.test(lines[i + 1])) {
      i += 1;
      continue;
    }
    const rows: string[][] = [];
    while (i < lines.length && /\|/.test(lines[i])) {
      if (!/^\s*\|?[\s-:|]+$/.test(lines[i])) {
        rows.push(
          lines[i]
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim()),
        );
      }
      i += 1;
    }
    if (rows.length >= 2) tables.push(rows);
  }
  return tables;
}

/** Keep tables + checklist/task lines for the Template tooling view. */
function extractTemplateTooling(markdown: string): string {
  const text = cleanMarkdown(markdown);
  if (!text) return "";
  const lines = text.split("\n");
  const out: string[] = [];
  let i = 0;
  let captured = false;
  while (i < lines.length) {
    const line = lines[i];
    const isTableStart =
      /\|/.test(line) && lines[i + 1] && /^\s*\|?[\s-:|]+$/.test(lines[i + 1]);
    if (isTableStart) {
      while (i < lines.length && /\|/.test(lines[i])) {
        out.push(lines[i]);
        i += 1;
      }
      out.push("");
      captured = true;
      continue;
    }
    if (/^\s*[-*]\s+\[[ xX]?\]/.test(line) || /^\s*\d+\.\s+\[[ xX]?\]/.test(line)) {
      out.push(line);
      captured = true;
      i += 1;
      // keep indented detail lines under the checklist item
      while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
        out.push(lines[i]);
        i += 1;
      }
      continue;
    }
    i += 1;
  }
  if (captured) return out.join("\n").trim();
  // Fall back to bullet lists that look like actionable checklists
  if ((text.match(/^\s*[-*]\s+\S+/gm) || []).length >= 3) return text;
  return text;
}

function stripMarkdownTables(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const isTableStart =
      /\|/.test(lines[i]) && lines[i + 1] && /^\s*\|?[\s-:|]+$/.test(lines[i + 1]);
    if (isTableStart) {
      while (i < lines.length && /\|/.test(lines[i])) i += 1;
      continue;
    }
    out.push(lines[i]);
    i += 1;
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function tablesToCsv(tables: string[][][]): string {
  return tables
    .map((table) =>
      table
        .map((row) =>
          row
            .map((cell) => {
              const v = cell.replace(/"/g, '""');
              return /[",\n]/.test(v) ? `"${v}"` : v;
            })
            .join(","),
        )
        .join("\n"),
    )
    .join("\n\n");
}

function ClauseBadge({ label }: { label: string }) {
  const display = label.replace(/^Ref\.?\s*:?\s*/i, "Ref: ");
  return (
    <span className="inline-flex items-center shrink-0 px-1.5 py-0.5 rounded-md bg-[#0D9488]/15 text-[#5EEAD4] font-jetbrains-mono text-[13px] font-medium tracking-[0.02em] border border-[#0D9488]/25">
      {display}
    </span>
  );
}

/* ─── markdown components ─────────────────────────────────────────────── */

const ChecklistMode = createContext(false);

function MdUl({ className, ...props }: any) {
  const checklist = useContext(ChecklistMode);
  const task = className?.includes("contains-task-list") || checklist;
  return (
    <ul
      className={mergeClass(
        task
          ? "list-none pl-0 mb-4 space-y-2.5 max-w-[768px]"
          : "list-disc pl-5 mb-4 space-y-2 text-[14px] leading-[1.6] text-[#CBD5E1] max-w-[768px]",
        className,
      )}
      {...props}
    />
  );
}

function MdOl({ className, ...props }: any) {
  const checklist = useContext(ChecklistMode);
  return (
    <ol
      className={mergeClass(
        checklist
          ? "list-none pl-0 mb-4 space-y-2.5 max-w-[768px]"
          : "list-decimal pl-5 mb-4 space-y-2 text-[14px] leading-[1.6] text-[#CBD5E1] max-w-[768px]",
        className,
      )}
      {...props}
    />
  );
}

function MdLi({ className, children, ...props }: any) {
  const checklist = useContext(ChecklistMode);
  const isTask = className?.includes("task-list-item") || checklist;
  if (!isTask) {
    return (
      <li className={mergeClass("text-[14px] leading-[1.6] text-[#CBD5E1]", className)} {...props}>
        {decorateInline(children)}
      </li>
    );
  }

  const nodes = Children.toArray(children);
  const checkbox = nodes.find(
    (n) => isValidElement(n) && (n.props as { type?: string }).type === "checkbox",
  );
  const rest = nodes.filter((n) => n !== checkbox);
  const raw = flattenText(rest);
  const clauses = extractClauses(raw);
  const evidenceMatch = raw.match(
    /((?:ensure|verify|check|confirm|evidence|notes?|guidance)\s*[:—-]\s*)([\s\S]+)/i,
  );
  let titleText = raw;
  let detailText = "";
  if (evidenceMatch && evidenceMatch.index != null && evidenceMatch.index > 8) {
    titleText = raw.slice(0, evidenceMatch.index).trim();
    detailText = `${evidenceMatch[1]}${evidenceMatch[2]}`.trim();
  }
  titleText = stripClauses(titleText);

  return (
    <li className={mergeClass("list-none", className)} {...props}>
      <div className="flex items-start gap-3 rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-3.5">
        {checkbox ? (
          <span className="mt-0.5 shrink-0">{checkbox}</span>
        ) : (
          <span
            aria-hidden="true"
            className="mt-0.5 shrink-0 h-4 w-4 rounded-[4px] border border-[#64748B] bg-[#0F172A]"
          />
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="text-[14px] font-medium leading-[1.6] text-[#E2E8F0]">
              {decorateInline(titleText || raw)}
            </div>
            {clauses.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {clauses.map((c) => (
                  <ClauseBadge key={c} label={c} />
                ))}
              </div>
            )}
          </div>
          {detailText ? (
            <p className="text-[13px] leading-[1.6] text-[#94A3B8]">{detailText}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

const mdComponents: any = {
  h1: ({ className, children, ...props }: any) => (
    <h1
      className={mergeClass(
        "text-[20px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#F1F5F9] mb-4 max-w-[768px]",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: any) => (
    <h2
      className={mergeClass(
        "text-[16px] font-semibold leading-[1.4] text-[#F1F5F9] mt-6 mb-3 max-w-[768px]",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: any) => (
    <h3
      className={mergeClass(
        "text-[14px] font-semibold leading-[1.4] text-[#E2E8F0] mt-4 mb-2 max-w-[768px]",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ className, children, ...props }: any) => (
    <h4
      className={mergeClass(
        "text-[13px] font-semibold leading-[1.4] text-[#E2E8F0] mt-3 mb-2 max-w-[768px]",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ className, children, ...props }: any) => (
    <p
      className={mergeClass(
        "text-[14px] font-normal leading-[1.6] text-[#CBD5E1] mb-3.5 max-w-[768px]",
        className,
      )}
      {...props}
    >
      {decorateInline(children)}
    </p>
  ),
  strong: ({ className, children, ...props }: any) => (
    <strong className={mergeClass("font-semibold text-[#F8FAFC]", className)} {...props}>
      {children}
    </strong>
  ),
  blockquote: ({ className, children, ...props }: any) => (
    <blockquote
      className={mergeClass(
        "max-w-[768px] my-4 border-l-2 border-[#0D9488] bg-[#1E293B]/70 rounded-r-xl px-4 py-3 text-[14px] leading-[1.6] text-[#CBD5E1]",
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  ul: MdUl,
  ol: MdOl,
  li: MdLi,
  code: ({ className, children, ...props }: any) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={mergeClass("font-jetbrains-mono text-[13px] text-[#E2E8F0]", className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={mergeClass(
          "font-jetbrains-mono text-[13px] font-medium tracking-[0.02em] text-[#5EEAD4] bg-[#1E293B] px-1.5 py-0.5 rounded-md",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ className, children, ...props }: any) => (
    <pre
      className={mergeClass(
        "w-full overflow-x-auto my-4 rounded-xl border border-[#334155] bg-[#0F172A] p-4 text-[13px] leading-[1.5]",
        className,
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ className, ...props }: any) => (
    <div className="w-full max-w-none overflow-x-auto my-4 rounded-xl border border-[#334155] bg-[#1E293B]/40">
      <table
        className={mergeClass("w-full min-w-[480px] border-collapse text-left", className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }: any) => (
    <thead className={mergeClass("bg-[#0F172A]", className)} {...props} />
  ),
  th: ({ className, children, ...props }: any) => (
    <th
      className={mergeClass(
        "py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8] border-b border-[#334155]",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ className, children, ...props }: any) => (
    <td
      className={mergeClass(
        "py-3 px-4 text-[14px] leading-[1.6] text-[#CBD5E1] border-b border-[#334155]/50 align-top border-x-0",
        className,
      )}
      {...props}
    >
      {decorateInline(children)}
    </td>
  ),
  hr: ({ className, ...props }: any) => (
    <hr className={mergeClass("my-6 border-[#334155] max-w-[768px]", className)} {...props} />
  ),
  input: ({ type, checked, ...props }: any) => {
    if (type === "checkbox") {
      return (
        <span
          aria-hidden="true"
          className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
            checked
              ? "border-[#0D9488] bg-[#0D9488]/30 text-[#5EEAD4]"
              : "border-[#64748B] bg-[#0F172A]"
          }`}
        >
          {checked ? (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6l3 3 5-5" />
            </svg>
          ) : null}
        </span>
      );
    }
    return <input type={type} checked={checked} {...props} />;
  },
};

function MarkdownBody({
  text,
  checklist = false,
  className = "",
}: {
  text: string;
  checklist?: boolean;
  className?: string;
}) {
  const cleaned = cleanMarkdown(text);
  if (!cleaned) return null;
  return (
    <ChecklistMode.Provider value={checklist}>
      <div className={mergeClass("audit-lens-md font-inter", className)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {cleaned}
        </ReactMarkdown>
      </div>
    </ChecklistMode.Provider>
  );
}

/* ─── section renderers ───────────────────────────────────────────────── */

function GuidanceBriefing({
  data,
  copyLabel,
}: {
  data: AuditStepData;
  copyLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const cards: Array<{ title: string; body?: string }> = [
    { title: "What to Do", body: data.what_to_do },
    { title: "When", body: data.when_to_do_it },
    { title: "Why", body: data.why_it_is_necessary },
    { title: "Specification / Requirement", body: data.specification_to_check },
    { title: "Evidence to Look For", body: data.evidence_to_look_for },
    { title: "Audit Questions / Checkpoints", body: data.audit_questions },
  ].filter((c) => c.body && String(c.body).trim());

  const blob = cleanMarkdown(String(data.auditor_guidance || ""));
  if (!cards.length && !blob) return null;

  return (
    <div className="rounded-xl border border-[#334155] bg-[#1E293B]/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#1E293B]/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-[16px] font-semibold leading-[1.4] text-[#F1F5F9]">
            Auditor Guidance
          </h2>
          <p className="text-[12px] leading-[1.3] text-[#64748B] mt-0.5">
            {cards.length
              ? `${cards.length} briefing cards — expand to review`
              : "Expand to review auditor briefing"}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="border-t border-[#334155] px-4 py-4 space-y-3">
          {!cards.length && blob ? (
            <div className="flex justify-end mb-2">
              <CopyControl text={blob} label={copyLabel} />
            </div>
          ) : null}
          {cards.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => {
                const text = cleanMarkdown(String(card.body));
                return (
                  <div
                    key={card.title}
                    className="rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-3.5"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#94A3B8]">
                        {card.title}
                      </h3>
                      <CopyControl text={text} label={copyLabel} />
                    </div>
                    <MarkdownBody text={text} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border-l-2 border-[#0D9488] bg-[#0F172A] px-4 py-4 max-w-[768px]">
              <MarkdownBody text={blob} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function classifyWorkingSection(title: string) {
  const t = title.toLowerCase();
  if (/guideline|iso\s*\d|clause|reference|requirement|standard/.test(t)) return "guideline";
  if (/practical|application|how to|implement|field/.test(t)) return "application";
  if (/key|principle|guidance|important|note/.test(t)) return "key";
  if (/explain|context|background|overview/.test(t)) return "explanation";
  return "other";
}

function WorkingPaperView({ text, copyLabel }: { text: string; copyLabel: string }) {
  const cleaned = cleanMarkdown(text);
  let parts = splitByHeading(cleaned, "###");
  if (parts.length <= 1) parts = splitByHeading(cleaned, "##");

  // Bold section titles when markdown headings are absent
  if (parts.length <= 1 && !parts[0]?.title) {
    const boldParts = cleaned.split(/\n(?=\*\*[^*\n]{4,80}\*\*)/);
    if (boldParts.length > 1) {
      parts = boldParts.map((block) => {
        const m = block.match(/^\*\*([^*]+)\*\*\s*\n?([\s\S]*)$/);
        if (!m) return { title: "", body: block.trim() };
        return { title: m[1].trim(), body: m[2].trim() };
      });
    }
  }

  // Isolate blockquote guidelines from surrounding application text
  if (parts.length <= 1 && !parts[0]?.title && /^>/m.test(cleaned)) {
    const guidelineChunks = cleaned.match(/(?:^|\n)(?:>[^\n]*(?:\n|$))+/g) || [];
    const application = cleaned
      .replace(/(?:^|\n)(?:>[^\n]*(?:\n|$))+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const built: Array<{ title: string; body: string }> = [];
    if (guidelineChunks.length) {
      built.push({
        title: "ISO guideline / reference",
        body: guidelineChunks
          .join("\n")
          .replace(/^>\s?/gm, "")
          .trim(),
      });
    }
    if (application) {
      built.push({ title: "Practical application", body: application });
    }
    if (built.length > 1) parts = built;
  }

  const useCards = parts.length > 1 || (parts.length === 1 && !!parts[0].title);

  // Prefer guideline / application briefing order (guideline boxes on top)
  const ordered = useCards
    ? [...parts].sort((a, b) => {
        const rank = (title: string) => {
          const k = classifyWorkingSection(title);
          if (k === "guideline") return 0;
          if (k === "key") return 1;
          if (k === "explanation") return 2;
          if (k === "application") return 3;
          return 4;
        };
        return rank(a.title) - rank(b.title);
      })
    : parts;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 max-w-[768px]">
        <h2 className="text-[20px] font-semibold leading-[1.3] text-[#F1F5F9]">
          Audit Working Paper
        </h2>
        <CopyControl text={cleaned} label={copyLabel} />
      </div>
      {useCards ? (
        <div className="space-y-3">
          {ordered.map((part, idx) => {
            const kind = classifyWorkingSection(part.title || "");
            const label =
              kind === "guideline"
                ? "ISO guideline / reference"
                : kind === "application"
                  ? "Practical application"
                  : kind === "key"
                    ? "Key audit guidance"
                    : kind === "explanation"
                      ? "Explanation"
                      : null;
            const isGuideline = kind === "guideline" || kind === "key";
            const tint = isGuideline
              ? "bg-[#172554]/35"
              : kind === "application"
                ? "bg-[#1E293B]"
                : "bg-[#1E293B]";
            return (
              <article
                key={`${part.title}-${idx}`}
                className={`rounded-xl border border-[#334155] overflow-hidden ${tint} ${
                  isGuideline ? "" : "max-w-[768px]"
                }`}
              >
                <div className="border-b border-[#334155] bg-[#0F172A]/50 px-4 py-2.5">
                  {label ? (
                    <p className="text-[11px] uppercase tracking-[0.05em] text-[#64748B] mb-0.5">
                      {label}
                    </p>
                  ) : null}
                  {part.title ? (
                    <h3 className="text-[14px] font-semibold leading-[1.4] text-[#E2E8F0]">
                      {part.title}
                    </h3>
                  ) : null}
                </div>
                <div className="border-l-2 border-[#0D9488] px-4 py-4">
                  <MarkdownBody text={part.body} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[#334155] bg-[#1E293B] border-l-2 border-l-[#0D9488] px-4 py-4 max-w-[768px]">
          <MarkdownBody text={cleaned} />
        </div>
      )}
    </div>
  );
}

function DocumentedInfoView({ text, copyLabel }: { text: string; copyLabel: string }) {
  const cleaned = cleanMarkdown(text);
  // Prefer evidence-oriented text; matrices belong in the Template tab
  const evidenceText = stripMarkdownTables(cleaned) || cleaned;
  const cards = parseEvidenceCards(evidenceText);
  const structured =
    cards.length > 1 || (cards.length === 1 && cards[0].name !== "Evidence item");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 max-w-[800px]">
        <h2 className="text-[20px] font-semibold leading-[1.3] text-[#F1F5F9]">
          Documented Information
        </h2>
        <CopyControl text={cleaned} label={copyLabel} />
      </div>

      {structured ? (
        <div className="grid gap-3 max-w-[800px] grid-cols-1">
          {cards.map((card, idx) => (
            <article
              key={`${card.name}-${idx}`}
              className="rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-[#64748B] mb-1">
                    Evidence Name
                  </p>
                  <h3 className="text-[15px] font-semibold leading-[1.4] text-[#F1F5F9]">
                    {card.name}
                  </h3>
                </div>
                {card.clauses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
                    {card.clauses.map((c) => (
                      <ClauseBadge key={c} label={c} />
                    ))}
                  </div>
                ) : null}
              </div>
              {card.body ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-[#64748B] mb-1.5">
                    Verification Action
                  </p>
                  <MarkdownBody text={card.body} />
                </>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-4 max-w-[800px]">
          <MarkdownBody text={evidenceText} />
        </div>
      )}
    </div>
  );
}

function TemplateView({ text, copyLabel }: { text: string; copyLabel: string }) {
  const cleaned = cleanMarkdown(text);
  const looksLikeChecklist =
    /^\s*[-*]\s+\[[ xX]\]/m.test(cleaned) ||
    /checklist|task-list/i.test(cleaned) ||
    /^\s*[-*]\s+\S+/m.test(cleaned);
  const tables = extractMarkdownTables(cleaned);
  const csv = tables.length ? tablesToCsv(tables) : "";
  const [csvDone, setCsvDone] = useState(false);

  const downloadCsv = () => {
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-lens-template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setCsvDone(true);
    window.setTimeout(() => setCsvDone(false), 1600);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-[20px] font-semibold leading-[1.3] text-[#F1F5F9]">
          Template
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <CopyControl text={cleaned} label="Copy as Markdown" />
          {csv ? (
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center gap-1 rounded-lg border border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-[8px] px-2 py-1 text-[11px] font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#0D9488]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              aria-label="Export as CSV"
            >
              <Download className="w-3 h-3" />
              {csvDone ? "Downloaded" : "Export as CSV"}
            </button>
          ) : null}
          {copyLabel ? <span className="sr-only">{copyLabel}</span> : null}
        </div>
      </div>
      <div className="w-full rounded-xl border border-[#334155] bg-[#1E293B]/40 px-3 py-3 sm:px-4 sm:py-4">
        <MarkdownBody text={cleaned} checklist={looksLikeChecklist} />
      </div>
    </div>
  );
}

function CaseStudyView({ text, copyLabel }: { text: string; copyLabel: string }) {
  const cleaned = cleanMarkdown(text);
  let parts = splitByHeading(cleaned, "##");
  if (parts.length <= 1) parts = splitByHeading(cleaned, "###");

  const classify = (title: string) => {
    const t = title.toLowerCase();
    if (/situation|context|scenario|background/.test(t)) return "situation";
    if (/complicat|problem|issue|finding|non[- ]?conform|challenge/.test(t))
      return "complication";
    if (/action|resolution|auditor|response|outcome|remediat/.test(t)) return "action";
    return "other";
  };

  let structured = parts.filter((p) => p.title);
  let hasStructured = structured.some((p) => classify(p.title) !== "other");

  // Bold-label editorial split when headings are missing
  if (!hasStructured) {
    const boldParts = cleaned.split(
      /\n(?=\*\*(?:The\s+)?(?:Situation|Complication|Auditor'?s?\s+Action|Resolution|Context|Problem)\*\*)/i,
    );
    if (boldParts.length > 1) {
      structured = boldParts
        .map((block) => {
          const m = block.match(/^\*\*([^*]+)\*\*\s*\n?([\s\S]*)$/);
          if (!m) return { title: "", body: block.trim() };
          return { title: m[1].trim(), body: m[2].trim() };
        })
        .filter((p) => p.body || p.title);
      hasStructured = structured.some((p) => p.title && classify(p.title) !== "other");
    }
  }

  // Last resort: break multi-paragraph narrative into editorial beats
  if (!hasStructured) {
    const paras = cleaned.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    if (paras.length >= 2) {
      if (paras.length === 2) {
        structured = [
          { title: "The Situation", body: paras[0] },
          { title: "The Auditor's Action", body: paras[1] },
        ];
      } else {
        const third = Math.max(1, Math.floor(paras.length / 3));
        structured = [
          { title: "The Situation", body: paras.slice(0, third).join("\n\n") },
          {
            title: "The Complication",
            body: paras.slice(third, third * 2).join("\n\n"),
          },
          {
            title: "The Auditor's Action",
            body: paras.slice(third * 2).join("\n\n"),
          },
        ];
      }
      hasStructured = true;
    }
  }

  const scenarioTitle =
    structured.find(
      (p) =>
        /scenario|case study|^title$/i.test(p.title) &&
        !/situation|complicat|action|resolution|problem|context/i.test(p.title),
    )?.title || "Case Study";

  return (
    <div className="space-y-5 max-w-[720px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-[0.05em] text-[#64748B] mb-1">
            Case Study
          </p>
          <h2 className="text-[20px] font-semibold leading-[1.3] text-[#F1F5F9]">
            {hasStructured ? scenarioTitle : "Case Study"}
          </h2>
        </div>
        <CopyControl text={cleaned} label={copyLabel} />
      </div>

      {hasStructured ? (
        <div className="space-y-4">
          {structured.map((part, idx) => {
            if (/scenario|title/i.test(part.title) && idx === 0 && !part.body) return null;
            const kind = classify(part.title || "");
            const fallbackTitle =
              kind === "situation"
                ? "The Situation"
                : kind === "complication"
                  ? "The Complication"
                  : kind === "action"
                    ? "The Auditor's Action"
                    : part.title;
            const accent =
              kind === "complication"
                ? "border-l-amber-500/70 bg-amber-950/15"
                : kind === "action"
                  ? "border-l-[#0D9488] bg-[#0D9488]/5"
                  : kind === "situation"
                    ? "border-l-sky-500/60 bg-sky-950/15"
                    : "border-l-[#334155] bg-[#1E293B]/60";
            return (
              <article
                key={`${part.title}-${idx}`}
                className={`rounded-r-xl border border-[#334155] border-l-2 px-4 py-4 ${accent}`}
              >
                <h3 className="text-[16px] font-semibold leading-[1.4] text-[#F1F5F9] mb-2 inline-flex items-center gap-2">
                  {kind === "complication" ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                  ) : null}
                  {fallbackTitle || part.title}
                </h3>
                <MarkdownBody text={part.body} />
              </article>
            );
          })}
        </div>
      ) : (
        <article className="rounded-xl border border-[#334155] bg-[#1E293B]/70 px-4 py-5 space-y-1">
          <MarkdownBody text={cleaned} />
        </article>
      )}
    </div>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#334155] bg-[#1E293B]/30 px-4 py-10 text-center max-w-[768px]">
      <p className="text-[14px] leading-[1.6] text-[#94A3B8]">
        No {label.toLowerCase()} content for this step.
      </p>
    </div>
  );
}

/* ─── main view ───────────────────────────────────────────────────────── */

type AuditStepData = {
  guidance?: string;
  template_preview?: string;
  templatePreview?: string;
  auditor_guidance?: string;
  auditorGuidance?: string;
  audit_paper?: string;
  auditPaper?: string;
  documented_information_template?: string;
  documentedInformationTemplate?: string;
  case_study?: string;
  caseStudy?: string;
  demonstrated_scenario?: string;
  demonstratedScenario?: string;
  what_to_do?: string;
  when_to_do_it?: string;
  why_it_is_necessary?: string;
  specification_to_check?: string;
  evidence_to_look_for?: string;
  audit_questions?: string;
  title?: string;
  stage?: string;
};

type Props = {
  data: AuditStepData;
  emptyMessage?: string;
};

type TabId = "working" | "documented" | "template" | "case";

const TAB_ORDER: TabId[] = ["working", "documented", "template", "case"];

const TAB_LABELS: Record<TabId, string> = {
  working: "Working Paper",
  documented: "Documented Info",
  template: "Template",
  case: "Case Study",
};

/** Read first non-empty markdown field (snake_case, camelCase, or nested text). */
function pickMarkdownField(
  data: AuditStepData,
  ...keys: (keyof AuditStepData)[]
): string {
  for (const key of keys) {
    const value = data[key] as unknown;
    if (typeof value === "string" && value.trim()) {
      return cleanMarkdown(value);
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      for (const nestedKey of ["content", "markdown", "text", "body", "value"]) {
        const nested = obj[nestedKey];
        if (typeof nested === "string" && nested.trim()) {
          return cleanMarkdown(nested);
        }
      }
    }
  }
  return "";
}

function findGuidanceSection(
  sections: Array<{ title: string; body: string }>,
  keywords: string[],
): string {
  for (const section of sections) {
    const title = section.title.toLowerCase();
    if (keywords.some((k) => title.includes(k))) {
      return cleanMarkdown(section.body);
    }
  }
  return "";
}

function looksLikeWorkPaper(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /work\s*paper|working\s*paper|\bwp[-\s]?\d+/i.test(text) ||
    t.includes("certification body audit") ||
    t.includes("audit work paper")
  );
}

/**
 * Collect titled blocks from guidance using ## / # / bold / numbered labels.
 * Models often omit strict `##` spacing or use **2. Audit Paper** instead.
 */
function collectLooseSections(
  markdown: string,
): Array<{ title: string; body: string }> {
  const text = cleanMarkdown(markdown);
  if (!text) return [];

  const h2 = splitByHeading(text, "##");
  if (h2.length > 1 || (h2.length === 1 && h2[0].title)) {
    return h2;
  }

  const h1 = splitByHeading(text, "#");
  if (h1.length > 1 || (h1.length === 1 && h1[0].title)) {
    return h1;
  }

  const lines = text.split("\n");
  const headers: Array<{ index: number; title: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const match =
      line.match(/^#{1,3}\s*(.+)$/) ||
      line.match(/^\*\*((?:\d+\.\s*)?[^*]{3,120})\*\*\s*$/) ||
      line.match(
        /^((?:\d+)\.\s+(?:Auditor Guidance|Audit Paper|Audit Work Paper|Working Paper|Documented Information(?:\s+Template)?|Demonstrated Case Study|Case Study)\b.*)$/i,
      );
    if (match) {
      headers.push({
        index: i,
        title: match[1].replace(/\*+/g, "").trim(),
      });
    }
  }

  if (headers.length < 2) return [];

  const out: Array<{ title: string; body: string }> = [];
  for (let h = 0; h < headers.length; h++) {
    const start = headers[h].index + 1;
    const end = h + 1 < headers.length ? headers[h + 1].index : lines.length;
    out.push({
      title: headers[h].title,
      body: lines.slice(start, end).join("\n").trim(),
    });
  }
  return out.filter((s) => s.title || s.body);
}

const PAPER_SECTION_KEYS = [
  "audit paper",
  "audit work paper",
  "working paper",
  "work paper",
  "2. audit",
];

const DOC_SECTION_KEYS = [
  "documented information",
  "3. documented",
  "documented info",
  "document template",
  "information template",
  "record template",
  "procedure template",
];

const CASE_SECTION_KEYS = [
  "case study",
  "demonstrated case",
  "4. demonstrated",
  "4. case",
  "hypothetical example",
  "illustrative example",
  "educational only",
  "demonstrated scenario",
];

/**
 * Pull a single labeled block from guidance even when collectLooseSections
 * cannot build a multi-section map (common for trailing Case Study headers).
 */
function extractLabeledGuidanceBlock(
  markdown: string,
  titlePattern: RegExp,
): string {
  const text = cleanMarkdown(markdown);
  if (!text) return "";
  const lines = text.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match =
      line.match(/^#{1,3}\s*(.+)$/) ||
      line.match(/^\*\*([^*]{3,160})\*\*\s*$/) ||
      line.match(
        /^((?:\d+)\.\s+(?:Documented Information|Demonstrated Case Study|Case Study)\b.*)$/i,
      );
    if (match && titlePattern.test(match[1].replace(/\*+/g, "").trim())) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return "";
  const body: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim();
    if (
      /^#{1,3}\s+\S/.test(line) ||
      /^\*\*[^*]{3,160}\*\*\s*$/.test(line) ||
      /^\d+\.\s+(?:Auditor Guidance|Audit Paper|Documented Information|Case Study|Demonstrated)\b/i.test(
        line,
      )
    ) {
      break;
    }
    body.push(lines[i]);
  }
  return cleanMarkdown(body.join("\n"));
}

const CASE_TITLE_RE =
  /case\s*study|demonstrated\s+case|\bdemonstrated\b|hypothetical(?:\s+example)?|illustrative\s+example|educational\s+only|demonstrated\s+scenario|not\s+actual\s+audit\s+evidence/i;

function hasMeaningfulCaseStudyText(text: string): boolean {
  const t = cleanMarkdown(text);
  if (!t) return false;
  const withoutLabel = t
    .replace(/\*{0,2}Demonstrated Case Study[^*\n]*\*{0,2}/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (withoutLabel.length >= 40) return true;
  return (
    /situation|complication|auditor|resolution|scenario|hypothetical|evidence/i.test(
      t,
    ) && t.length >= 24
  );
}

/** Object-shaped Case Study → markdown for existing CaseStudyView. */
function caseStudyFromObject(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const o = value as Record<string, unknown>;
  const pairs: Array<[string[], string]> = [
    [["scenario", "scenario_title", "scenarioTitle", "title"], "Scenario Title"],
    [["situation", "context", "background"], "The Situation"],
    [["complication", "problem", "issue", "challenge"], "The Complication"],
    [
      [
        "resolution",
        "action",
        "auditor_action",
        "auditorAction",
        "auditors_action",
        "outcome",
      ],
      "The Auditor's Action",
    ],
  ];
  const parts: string[] = [];
  for (const [keys, heading] of pairs) {
    for (const key of keys) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) {
        parts.push(`### ${heading}\n\n${v.trim()}`);
        break;
      }
    }
  }
  if (parts.length) return parts.join("\n\n");
  for (const nestedKey of ["content", "markdown", "text", "body", "narrative"]) {
    const nested = o[nestedKey];
    if (typeof nested === "string" && hasMeaningfulCaseStudyText(nested)) {
      return cleanMarkdown(nested);
    }
  }
  return "";
}

/**
 * Case-Study-only guidance recovery.
 * Intentionally separate from extractLabeledGuidanceBlock (used by Documented Info)
 * because that helper stops on the bold Hypothetical label and returns "".
 */
function extractCaseStudyFromGuidance(guidance: string): string {
  const text = cleanMarkdown(guidance);
  if (!text) return "";

  const fromSections = findGuidanceSection(collectLooseSections(text), [
    "case study",
    "demonstrated case",
    "demonstrated",
    "4. demonstrated",
    "4. case",
    "hypothetical",
    "illustrative example",
    "educational only",
    "demonstrated scenario",
  ]);
  if (hasMeaningfulCaseStudyText(fromSections)) return fromSections;

  const lines = text.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match =
      line.match(/^#{1,6}\s*(.+)$/) ||
      line.match(/^\*\*([^*]{3,200})\*\*\s*$/) ||
      line.match(/^((?:\d+)\.\s+(?:Demonstrated\s+)?Case\s+Study\b.*)$/i);
    if (!match) continue;
    const title = match[1].replace(/\*+/g, "").trim();
    if (CASE_TITLE_RE.test(title)) {
      start = i + 1;
      break;
    }
  }

  if (start < 0) {
    const inline = text.search(
      /Demonstrated Case Study|Hypothetical Example\s*\(Not Actual Audit Evidence\)/i,
    );
    if (inline < 0) return "";
    const sliced = cleanMarkdown(text.slice(inline));
    return hasMeaningfulCaseStudyText(sliced) ? sliced : "";
  }

  const body: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim();
    const match =
      line.match(/^#{1,6}\s*(.+)$/) ||
      line.match(/^\*\*([^*]{3,200})\*\*\s*$/) ||
      line.match(
        /^((?:\d+)\.\s+(?:Auditor Guidance|Audit Paper|Documented Information|Case Study|Demonstrated)\b.*)$/i,
      );
    if (match) {
      const title = match[1].replace(/\*+/g, "").trim();
      // Keep Case Study sub-labels; stop only on a different major section
      if (
        CASE_TITLE_RE.test(title) ||
        /situation|complicat|auditor|resolution|context|problem/i.test(title)
      ) {
        body.push(lines[i]);
        continue;
      }
      if (
        /^(?:\d+\.\s*)?(?:auditor guidance|audit paper|documented information)\b/i.test(
          title,
        )
      ) {
        break;
      }
      if (/^#{1,6}/.test(line) || /^\d+\.\s+/.test(line)) break;
    }
    body.push(lines[i]);
  }

  const joined = cleanMarkdown(body.join("\n"));
  if (hasMeaningfulCaseStudyText(joined)) return joined;
  const rest = cleanMarkdown(lines.slice(start).join("\n"));
  return hasMeaningfulCaseStudyText(rest) ? rest : "";
}

function resolveCaseStudyContent(
  data: AuditStepData,
  guidance: string,
  caseFromGuidance: string,
): string {
  const fromFields =
    pickMarkdownField(
      data,
      "case_study",
      "caseStudy",
      "demonstrated_scenario",
      "demonstratedScenario",
    ) ||
    caseStudyFromObject(data.case_study) ||
    caseStudyFromObject(data.caseStudy) ||
    caseStudyFromObject(data.demonstrated_scenario) ||
    caseStudyFromObject(data.demonstratedScenario);

  if (fromFields.trim().length >= 20) return fromFields;
  if (hasMeaningfulCaseStudyText(caseFromGuidance)) return caseFromGuidance;

  const fromGuidance = extractCaseStudyFromGuidance(guidance);
  if (hasMeaningfulCaseStudyText(fromGuidance)) return fromGuidance;
  return "";
}

export default function AuditStepGuidanceView({ data, emptyMessage }: Props) {
  const { t } = useTranslation();
  const copyLabel = t("auditLens.copyClipboard") || t("isoNavigator.copyClipboard") || "Copy";

  const guidance = cleanMarkdown(data.guidance || "");

  // Structured fields only — Template resolution must keep using these (unchanged path)
  const structuredWorking = pickMarkdownField(data, "audit_paper", "auditPaper");
  const structuredDocumented = pickMarkdownField(
    data,
    "documented_information_template",
    "documentedInformationTemplate",
  );
  const structuredCase = pickMarkdownField(
    data,
    "case_study",
    "caseStudy",
    "demonstrated_scenario",
    "demonstratedScenario",
  );

  const templateCandidate = cleanMarkdown(
    String(data.template_preview || data.templatePreview || ""),
  );

  /**
   * Template tab content — known-good path. Do not change this algorithm.
   * Uses structured fields only (not guidance fallbacks).
   */
  const template = useMemo(() => {
    const preview = templateCandidate.trim();
    const doc = structuredDocumented.trim();
    const work = structuredWorking.trim();

    if (preview) {
      const p = normalizeComparable(preview);
      if (!work || p !== normalizeComparable(work)) {
        if (doc && p === normalizeComparable(doc)) {
          return extractTemplateTooling(doc) || preview;
        }
        return preview;
      }
    }
    if (doc) return extractTemplateTooling(doc) || doc;
    return "";
  }, [templateCandidate, structuredDocumented, structuredWorking]);

  // Working / Documented / Case: structured → guidance sections → safe preview fallback
  const guidanceSections = collectLooseSections(guidance);
  const workingFromGuidance = findGuidanceSection(
    guidanceSections,
    PAPER_SECTION_KEYS,
  );
  const documentedFromGuidance = findGuidanceSection(
    guidanceSections,
    DOC_SECTION_KEYS,
  );
  const caseFromGuidance = findGuidanceSection(
    guidanceSections,
    CASE_SECTION_KEYS,
  );

  const workingPaper =
    structuredWorking ||
    workingFromGuidance ||
    (templateCandidate && looksLikeWorkPaper(templateCandidate)
      ? templateCandidate
      : "") ||
    // Single work-paper blob in guidance (no multi-section headers)
    (guidanceSections.length < 2 &&
    guidance &&
    looksLikeWorkPaper(guidance)
      ? guidance
      : "");

  // Documented Info only — do not alter Working Paper / Template above.
  // Root cause: gating preview with looksLikeWorkPaper() skipped Template's own
  // template_preview whenever that text mentioned "work paper" / WP refs.
  // Use inequality vs Working Paper instead so Documented Info can share the
  // same existing preview Template already renders.
  const documented =
    structuredDocumented ||
    documentedFromGuidance ||
    extractLabeledGuidanceBlock(
      guidance,
      /documented\s*information|document(?:ed)?\s*template|information\s*template/i,
    ) ||
    (templateCandidate.trim() &&
    normalizeComparable(templateCandidate) !== normalizeComparable(workingPaper)
      ? templateCandidate
      : "");

  // Case Study only — do not alter Working Paper / Documented Info / Template.
  // extractLabeledGuidanceBlock stops on the bold Hypothetical label and yields "".
  // resolveCaseStudyContent recovers case_study fields + guidance ## 4 / trailing labels.
  const caseStudy = resolveCaseStudyContent(data, guidance, caseFromGuidance);

  const hasGuidance =
    !!(
      data.what_to_do ||
      data.when_to_do_it ||
      data.why_it_is_necessary ||
      data.specification_to_check ||
      data.evidence_to_look_for ||
      data.audit_questions ||
      data.auditor_guidance ||
      data.auditorGuidance
    );

  const contentByTab: Record<TabId, string> = {
    working: workingPaper,
    documented: documented,
    template: template,
    case: caseStudy,
  };

  const availableTabs = TAB_ORDER.filter((id) => contentByTab[id]);
  const [userTab, setUserTab] = useState<TabId | null>(null);

  // Reset selection when the step payload changes so stale tab state cannot block clicks
  const stepContentKey = [
    data.title || "",
    data.stage || "",
    guidance.slice(0, 64),
    templateCandidate.slice(0, 64),
    structuredWorking.slice(0, 32),
    structuredDocumented.slice(0, 32),
    structuredCase.slice(0, 32),
  ].join("|");
  const [prevStepKey, setPrevStepKey] = useState(stepContentKey);
  if (prevStepKey !== stepContentKey) {
    setPrevStepKey(stepContentKey);
    setUserTab(null);
  }

  // Keep Template as the default open tab when it has content (current UX)
  const defaultTab: TabId = availableTabs.includes("template")
    ? "template"
    : (availableTabs[0] ?? "working");
  const activeTab =
    userTab && availableTabs.includes(userTab) ? userTab : defaultTab;

  const showFallbackGuidance =
    guidance.length > 120 && !hasGuidance && availableTabs.length === 0;

  if (!hasGuidance && availableTabs.length === 0 && !guidance) {
    return (
      <p className="text-[#94A3B8] text-[14px] leading-[1.6] font-inter">
        {emptyMessage || "No guidance was generated for this step. Please retry."}
      </p>
    );
  }

  return (
    <div className="space-y-5 font-inter text-[#CBD5E1]">
      {hasGuidance ? <GuidanceBriefing data={data} copyLabel={copyLabel} /> : null}

      {(availableTabs.length > 0 || hasGuidance) && (
        <div className="rounded-xl border border-[#334155] bg-[#0F172A] overflow-hidden">
          <div
            role="tablist"
            aria-label="Audit Lens output sections"
            className="flex gap-1 overflow-x-auto border-b border-[#334155] bg-[#0F172A] px-2 py-2 custom-thin-scrollbar"
          >
            {TAB_ORDER.map((id) => {
              const hasContent = !!contentByTab[id];
              const selected = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  disabled={!hasContent}
                  onClick={() => {
                    if (!hasContent) return;
                    setUserTab(id);
                  }}
                  className={`shrink-0 rounded-lg px-3 py-2 text-[12px] font-semibold tracking-[0.02em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] disabled:opacity-35 disabled:cursor-not-allowed ${
                    selected
                      ? "bg-[#0D9488]/20 text-[#5EEAD4] border border-[#0D9488]/40"
                      : "text-[#94A3B8] border border-transparent hover:text-[#E2E8F0] hover:bg-[#1E293B]/60"
                  }`}
                >
                  {TAB_LABELS[id]}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="p-4 sm:p-5 md:p-6 bg-[#0F172A]">
            {activeTab === "working" &&
              (workingPaper ? (
                <WorkingPaperView text={workingPaper} copyLabel={copyLabel} />
              ) : (
                <EmptyTab label={TAB_LABELS.working} />
              ))}
            {activeTab === "documented" &&
              (documented ? (
                <DocumentedInfoView text={documented} copyLabel={copyLabel} />
              ) : (
                <EmptyTab label={TAB_LABELS.documented} />
              ))}
            {activeTab === "template" &&
              (template ? (
                <TemplateView text={template} copyLabel={copyLabel} />
              ) : (
                <EmptyTab label={TAB_LABELS.template} />
              ))}
            {activeTab === "case" &&
              (caseStudy ? (
                <CaseStudyView text={caseStudy} copyLabel={copyLabel} />
              ) : (
                <EmptyTab label={TAB_LABELS.case} />
              ))}
          </div>
        </div>
      )}

      {showFallbackGuidance ? (
        <div className="rounded-xl border border-[#334155] bg-[#1E293B]/50 px-4 py-4 max-w-[768px]">
          <div className="mb-3 flex justify-end">
            <CopyControl text={guidance} label={copyLabel} />
          </div>
          <MarkdownBody text={guidance} />
        </div>
      ) : null}
    </div>
  );
}
