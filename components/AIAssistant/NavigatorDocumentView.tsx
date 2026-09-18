"use client";

import React, { isValidElement, Children, createContext, useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { GeneratedDocumentData } from "@/types/iso-navigator";

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
  const searchScope = content.slice(-1200);
  const terminators = [
    '{"iso_clauses',
    '"iso_clauses',
    "word_count",
    "confidence_score",
  ];
  let cutoffOffset = -1;
  terminators.forEach((term) => {
    const index = searchScope.toLowerCase().indexOf(term.toLowerCase());
    if (index !== -1 && (cutoffOffset === -1 || index < cutoffOffset)) {
      cutoffOffset = index;
    }
  });
  if (cutoffOffset !== -1) {
    const absoluteIndex = content.length - 1200 + cutoffOffset;
    const lastBraceBefore = content.lastIndexOf("{", absoluteIndex);
    if (lastBraceBefore !== -1) {
      content = content.substring(0, lastBraceBefore).trim();
    } else {
      content = content.substring(0, absoluteIndex).trim();
    }
  }
  content = content.replace(/^(#+)([^\s#])/gm, "$1 $2");
  return content.trim();
}

function splitByH3(markdown: string): Array<{ title: string; body: string }> {
  const text = cleanMarkdown(markdown);
  if (!text) return [];
  if (!/^###\s+/m.test(text)) {
    return [{ title: "", body: text }];
  }
  const parts = text.split(/\n(?=###\s+)/);
  const out: Array<{ title: string; body: string }> = [];
  for (const part of parts) {
    const match = part.match(/^###\s+([^\n]+)\n?([\s\S]*)$/);
    if (match) {
      out.push({ title: match[1].trim(), body: match[2].trim() });
    } else if (part.trim()) {
      out.push({ title: "", body: part.trim() });
    }
  }
  return out.filter((p) => p.body.length > 0);
}

function mergeClass(base: string, className?: string) {
  return [base, className].filter(Boolean).join(" ");
}

function isSummaryTitle(title: string) {
  const t = title.toLowerCase();
  return (
    t.includes("executive summary") ||
    t.includes("plain-language") ||
    t.includes("plain language") ||
    t.includes("quick takeaway")
  );
}

function isChecklistTitle(title: string) {
  const t = title.toLowerCase();
  return t.includes("checklist") || t.includes("rollout");
}

const CLAUSE_RE =
  /(\b(?:ISO|IEC|ISO\/IEC)\s*[\d.:/-]+(?:\s*[:§]\s*[\d.A-Za-z]+)?|\bClause\s+[\d.]+(?:\.[\d]+)*|\b§\s*[\d.A-Za-z]+)/gi;

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
            className="inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded-md bg-[#1D4ED8]/15 text-[#93C5FD] font-jetbrains-mono text-[12px] font-medium leading-[1.4] tracking-[0.02em] align-middle"
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

function renderStatusPill(text: string): React.ReactNode | null {
  const v = text.trim();
  const lower = v.replace(/[.;]+$/g, "").toLowerCase();
  let tone = "";
  let mark = "";
  if (/^(conformant|conforming|compliant|conformity)\b/.test(lower)) {
    tone = "bg-emerald-950/70 text-emerald-300 border border-emerald-800/50";
    mark = "✓";
  } else if (/^(non[-\s]?conformant|non[-\s]?compliant|nonconformity)\b/.test(lower)) {
    tone = "bg-red-950/70 text-red-300 border border-red-800/50";
    mark = "✕";
  } else if (/^(minor gap|gap)\b/.test(lower)) {
    tone = "bg-amber-950/70 text-amber-300 border border-amber-800/50";
    mark = "!";
  } else if (/^(observation|observe)\b/.test(lower)) {
    tone = "bg-blue-950/70 text-blue-300 border border-blue-800/50";
    mark = "i";
  }
  if (!tone) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[1.3] ${tone}`}
    >
      <span aria-hidden="true">{mark}</span>
      {v}
    </span>
  );
}

function cellLooksNumeric(text: string) {
  return /^[\d$€£%,.\-\/]+$/.test(text.trim());
}

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
  return found;
}

function stripClauses(text: string) {
  return text.replace(CLAUSE_RE, " ").replace(/\s{2,}/g, " ").trim();
}

const ChecklistMode = createContext(false);

function MdUl({ className, ...props }: any) {
  const checklist = useContext(ChecklistMode);
  const task = className?.includes("contains-task-list") || checklist;
  return (
    <ul
      className={mergeClass(
        task
          ? "list-none pl-0 mb-4 space-y-2 max-w-[768px]"
          : "list-disc pl-5 mb-4 space-y-1.5 text-[14px] leading-[1.6] text-[#CBD5E1] max-w-[768px]",
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
          ? "list-none pl-0 mb-4 space-y-2 max-w-[768px]"
          : "list-decimal pl-5 mb-4 space-y-1.5 text-[14px] leading-[1.6] text-[#CBD5E1] max-w-[768px]",
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
    /((?:evidence(?:\s+required)?|guidance|notes?)\s*:\s*)([\s\S]+)/i,
  );
  let titleText = raw;
  let evidenceText = "";
  if (evidenceMatch && evidenceMatch.index != null) {
    titleText = raw.slice(0, evidenceMatch.index).trim();
    evidenceText = evidenceMatch[2].trim();
  }
  titleText = stripClauses(titleText);

  return (
    <li className={mergeClass("list-none", className)} {...props}>
        <div className="flex items-start gap-3 rounded-xl border border-[#1E293B] bg-[#0B1220]/80 px-4 py-3 hover:border-[#334155] transition-colors">
        {checkbox ? (
          <span className="mt-0.5 shrink-0">{checkbox}</span>
        ) : (
          <span
            aria-hidden="true"
            className="mt-0.5 shrink-0 h-4 w-4 rounded-[4px] border border-[#475569] bg-[#0B1220]"
          />
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="text-[14px] font-medium leading-[1.6] text-[#E2E8F0]">
            {decorateInline(titleText || raw)}
          </div>
          {clauses.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {clauses.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#1D4ED8]/15 text-[#93C5FD] font-jetbrains-mono text-[12px] font-medium tracking-[0.02em]"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          {evidenceText ? (
            <div className="text-[11px] leading-[1.5] text-[#94A3B8] bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 whitespace-pre-wrap">
              {evidenceMatch?.[1]}
              {evidenceText}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

const mdComponents = {
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
        "text-[16px] font-semibold leading-[1.4] tracking-[-0.005em] text-[#F1F5F9] mt-2 mb-3",
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
        "text-[14px] font-semibold leading-[1.4] text-[#E2E8F0] mt-4 mb-2",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }: any) => (
    <p
      className={mergeClass(
        "text-[14px] font-normal leading-[1.6] text-[#CBD5E1] mb-3 max-w-[768px]",
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
  em: ({ className, children, ...props }: any) => (
    <em className={mergeClass("italic text-[#E2E8F0]", className)} {...props}>
      {children}
    </em>
  ),
  blockquote: ({ className, children, ...props }: any) => (
    <blockquote
      className={mergeClass(
        "max-w-[768px] my-4 border-l-2 border-[#3B82F6]/50 bg-[#0B1220] rounded-r-xl px-4 py-3 text-[14px] leading-[1.6] text-[#CBD5E1]",
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ className, children, ...props }: any) => (
    <a
      className={mergeClass(
        "text-[#60A5FA] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }: any) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={mergeClass("font-jetbrains-mono text-[12px] text-[#E2E8F0]", className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={mergeClass(
          "font-jetbrains-mono text-[12px] font-medium tracking-[0.02em] text-[#93C5FD] bg-[#1E293B]/80 px-1.5 py-0.5 rounded-md",
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
        "w-full overflow-x-auto my-4 rounded-xl border border-[#1E293B] bg-[#0B1220] p-4 text-[12px] leading-[1.5]",
        className,
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ className, ...props }: any) => (
    <div className="w-full overflow-x-auto my-4 rounded-xl border border-[#1E293B] bg-[#0B1220]">
      <table
        className={mergeClass("w-full min-w-[520px] border-collapse text-left", className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }: any) => (
    <thead className={mergeClass("bg-[#0F172A]/90 sticky top-0 backdrop-blur-[8px]", className)} {...props} />
  ),
  tbody: ({ className, ...props }: any) => <tbody className={className} {...props} />,
  tr: ({ className, ...props }: any) => (
    <tr className={mergeClass("hover:bg-white/[0.02]", className)} {...props} />
  ),
  th: ({ className, children, ...props }: any) => (
    <th
      className={mergeClass(
        "py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8] border-b border-white/[0.06]",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ className, children, ...props }: any) => {
    const text = flattenText(children).trim();
    const status = text ? renderStatusPill(text) : null;
    const numeric = cellLooksNumeric(text);
    return (
      <td
        className={mergeClass(
          `py-3 px-4 text-[13px] font-medium leading-[1.4] tracking-[0.02em] text-[#E2E8F0] border-b border-white/[0.06] ${
            numeric ? "text-right tabular-nums" : "text-left"
          }`,
          className,
        )}
        style={{ color: "#E2E8F0" }}
        {...props}
      >
        {status || decorateInline(children) || text}
      </td>
    );
  },
  ul: MdUl,
  ol: MdOl,
  li: MdLi,
  input: ({ type, className, checked, disabled, ...props }: any) => {
    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          defaultChecked={!!checked}
          disabled
          aria-label={checked ? "Completed" : "Not completed"}
          className={mergeClass(
            "mt-0.5 shrink-0 h-4 w-4 rounded-[4px] border border-[#475569] bg-[#0B1220] accent-[#3B82F6]",
            className,
          )}
        />
      );
    }
    return <input type={type} className={className} disabled={disabled} {...props} />;
  },
  hr: ({ className, ...props }: any) => (
    <hr className={mergeClass("my-6 border-[#1E293B]", className)} {...props} />
  ),
};

function MarkdownCore({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[[remarkGfm, { table: false }]]} components={mdComponents}>
      {text}
    </ReactMarkdown>
  );
}

const FIELD_LINE =
  /^(?:[-*]\s+)?(?:\*\*(.+?)\*\*|`(.+?)`)\s*(?:[:–—]\s*(.*))?$/;

function parseFieldLine(line: string): { label: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("|")) return null;
  const m = trimmed.match(FIELD_LINE);
  if (!m) return null;
  const label = (m[1] || m[2] || "").trim();
  const value = (m[3] || "").trim();
  if (!label || label.length > 80) return null;
  return { label, value };
}

function splitPipeRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cur = "";
  let escaped = false;
  for (const ch of trimmed) {
    if (escaped) {
      cur += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === "|") {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function decodeTableCell(raw: string) {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function isSeparatorLine(line: string) {
  const t = line.trim();
  if (!t.includes("-")) return false;
  const dashCount = (t.match(/-/g) || []).length;
  return dashCount >= 3 && /^[\s|:.-]+$/.test(t);
}

function isPipeRowLine(line: string) {
  const t = line.trim();
  return t.includes("|") && !isSeparatorLine(t);
}

function parseMdTable(block: string): { headers: string[]; rows: string[][] } | null {
  const lines = block
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  const sepIdx = lines.findIndex(isSeparatorLine);
  if (sepIdx < 1) return null;
  const headerLine = lines[sepIdx - 1];
  if (!headerLine.includes("|")) return null;
  const headers = splitPipeRow(headerLine).map(decodeTableCell);
  const rows = lines.slice(sepIdx + 1).map((line) => {
    const cells = splitPipeRow(line).map(decodeTableCell);
    if (cells.some((c) => c)) return cells;
    const fallback = decodeTableCell(line.replace(/^\|/, "").replace(/\|$/, ""));
    return fallback ? [fallback] : cells;
  });
  if (!headers.length) return null;
  return { headers, rows };
}

function parseHtmlTable(block: string): { headers: string[]; rows: string[][] } | null {
  if (!/<table[\s>]/i.test(block)) return null;
  const rowHtml = [...block.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  if (!rowHtml.length) return null;
  const parseCells = (row: string, tag: "th" | "td") =>
    [...row.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))].map((m) =>
      decodeTableCell(m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")),
    );
  let headers = parseCells(rowHtml[0], "th");
  const bodyStart = headers.length ? 1 : 0;
  if (!headers.length) headers = parseCells(rowHtml[0], "td");
  const rows = rowHtml.slice(headers.length ? 1 : bodyStart).map((row) => {
    const tds = parseCells(row, "td");
    return tds.length ? tds : parseCells(row, "th");
  });
  if (!headers.length) return null;
  return { headers, rows };
}

function isFieldValueTable(table: { headers: string[]; rows: string[][] }) {
  if (table.headers.length !== 2) return false;
  const h = table.headers.map((x) => x.toLowerCase()).join(" ");
  return /(field|label|item|name|control|requirement|parameter)/.test(h) ||
    /(value|description|guidance|entry|input|response|detail)/.test(h);
}

type Segment =
  | { type: "md"; text: string }
  | { type: "form"; fields: Array<{ label: string; value: string }> }
  | { type: "table"; headers: string[]; rows: string[][] };

function segmentMarkdown(text: string): Segment[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const segments: Segment[] = [];
  let i = 0;
  let mdBuf: string[] = [];

  const flushMd = () => {
    const joined = mdBuf.join("\n").trim();
    if (joined) segments.push({ type: "md", text: joined });
    mdBuf = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const next = lines[i + 1] || "";
    const isTableStart = isPipeRowLine(line) && isSeparatorLine(next);

    if (isTableStart) {
      flushMd();
      const tableLines = [line, next];
      i += 2;
      while (i < lines.length && (isPipeRowLine(lines[i]) || isSeparatorLine(lines[i]))) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const raw = tableLines.join("\n");
      const parsed = parseMdTable(raw);
      if (parsed && isFieldValueTable(parsed)) {
        segments.push({
          type: "form",
          fields: parsed.rows.map((r) => ({
            label: r[0] || "",
            value: r.slice(1).join(" | "),
          })),
        });
      } else if (parsed) {
        segments.push({ type: "table", headers: parsed.headers, rows: parsed.rows });
      } else {
        segments.push({
          type: "table",
          headers: splitPipeRow(line).map(decodeTableCell),
          rows: tableLines.slice(2).map((l) => [l]),
        });
      }
      continue;
    }

    if (/<table[\s>]/i.test(line)) {
      flushMd();
      const htmlLines = [line];
      if (!/<\/table>/i.test(line)) {
        i += 1;
        while (i < lines.length && !/<\/table>/i.test(lines[i])) {
          htmlLines.push(lines[i]);
          i += 1;
        }
        if (i < lines.length) htmlLines.push(lines[i]);
      }
      i += 1;
      const parsed = parseHtmlTable(htmlLines.join("\n"));
      if (parsed) {
        segments.push({ type: "table", headers: parsed.headers, rows: parsed.rows });
      } else {
        mdBuf.push(...htmlLines);
      }
      continue;
    }

    const field = parseFieldLine(line);
    if (field) {
      const fields = [field];
      let j = i + 1;
      if (!fields[0].value) {
        while (j < lines.length && !lines[j].trim()) j += 1;
        const peek = (lines[j] || "").trim();
        if (peek && !peek.startsWith("#") && !peek.startsWith("|") && !parseFieldLine(peek)) {
          fields[0].value = peek;
          j += 1;
        }
      }
      while (j < lines.length) {
        if (!lines[j].trim()) {
          j += 1;
          continue;
        }
        const more = parseFieldLine(lines[j]);
        if (!more) break;
        j += 1;
        if (!more.value) {
          while (j < lines.length && !lines[j].trim()) j += 1;
          const peek = (lines[j] || "").trim();
          if (peek && !peek.startsWith("#") && !peek.startsWith("|") && !parseFieldLine(peek)) {
            more.value = peek;
            j += 1;
          }
        }
        fields.push(more);
      }
      if (fields.length >= 2) {
        flushMd();
        segments.push({ type: "form", fields });
        i = j;
        continue;
      }
    }

    mdBuf.push(line);
    i += 1;
  }
  flushMd();
  return segments;
}

function FormField({ label, value }: { label: string; value: string }) {
  const clauses = extractClauses(`${label} ${value}`);
  const wide = value.length > 140 || value.includes("\n");
  return (
    <div className={wide ? "md:col-span-2 min-w-0" : "min-w-0"}>
      <div className="text-[12px] font-medium leading-[1.4] text-[#94A3B8] mb-1.5">
        {stripClauses(label) || label}
      </div>
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2.5 text-[14px] leading-[1.6] text-[#E2E8F0] min-h-[42px]">
        {value ? decorateInline(stripClauses(value) || value) : (
          <span className="text-[#64748B]">—</span>
        )}
      </div>
      {clauses.length > 0 && (
        <p className="mt-1.5 text-[11px] leading-[1.3] text-[#64748B] font-jetbrains-mono tracking-[0.02em]">
          {clauses.join(" · ")}
        </p>
      )}
    </div>
  );
}

function FormGrid({ fields }: { fields: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
      {fields.map((f, idx) => (
        <FormField key={`${f.label}-${idx}`} label={f.label} value={f.value} />
      ))}
    </div>
  );
}

function TableCellText({ text }: { text: string }) {
  if (!text) return null;
  const status = renderStatusPill(text);
  if (status) return status;
  return (
    <span
      style={{
        color: "#E2E8F0",
        fontSize: 13,
        lineHeight: 1.4,
        fontWeight: 500,
        whiteSpace: "pre-wrap",
        display: "block",
      }}
    >
      {text}
    </span>
  );
}

function NativeTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const colCount = Math.max(headers.length, ...rows.map((r) => r.length), 1);
  const paddedHeaders = [...headers, ...Array(Math.max(0, colCount - headers.length)).fill("")];
  return (
    <div className="navigator-output-table w-full overflow-x-auto my-4 rounded-xl border border-[#1E293B] bg-[#0B1220]">
      <table className="w-full min-w-[520px] border-collapse text-left" style={{ color: "#E2E8F0" }}>
        <thead className="bg-[#0F172A]/90 sticky top-0 backdrop-blur-[8px]">
          <tr>
            {paddedHeaders.map((header, idx) => (
              <th
                key={`h-${idx}`}
                className="py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8] border-b border-white/[0.06]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={`r-${rIdx}`} className="hover:bg-white/[0.02]">
              {paddedHeaders.map((_, cIdx) => {
                const cell = row[cIdx] || "";
                const numeric = cellLooksNumeric(cell);
                return (
                  <td
                    key={`c-${rIdx}-${cIdx}`}
                    className={`py-3 px-4 border-b border-white/[0.06] ${
                      numeric ? "text-right tabular-nums" : "text-left"
                    }`}
                    style={{ color: "#E2E8F0" }}
                  >
                    <TableCellText text={cell} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function preserveUnknownHtml(text: string) {
  return text.replace(/<([^>]+)>/g, (full, inner: string) => {
    const tag = inner.trim().split(/[\s/]/)[0].replace(/^\//, "").toLowerCase();
    const allowed = new Set([
      "br", "hr", "sup", "sub", "em", "strong", "b", "i", "code", "span", "a", "img", "del", "ins", "mark",
    ]);
    if (allowed.has(tag)) return full;
    return full.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  });
}

function MarkdownBody({
  text,
  asChecklist = false,
}: {
  text: string;
  asChecklist?: boolean;
}) {
  const cleaned = cleanMarkdown(text);
  const segments = segmentMarkdown(cleaned);
  return (
    <ChecklistMode.Provider value={asChecklist}>
      <div className="font-sans">
        {segments.map((seg, idx) => {
          if (seg.type === "form") {
            return <FormGrid key={`form-${idx}`} fields={seg.fields} />;
          }
          if (seg.type === "table") {
            return <NativeTable key={`tbl-${idx}`} headers={seg.headers} rows={seg.rows} />;
          }
          return <MarkdownCore key={`md-${idx}`} text={preserveUnknownHtml(seg.text)} />;
        })}
      </div>
    </ChecklistMode.Provider>
  );
}

function CopyControl({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  if (!text?.trim()) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-[8px] px-2 py-1 text-[11px] font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
      aria-label={label}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function OutputCard({
  title,
  children,
  variant = "default",
  copyText,
  copyLabel,
}: {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "summary";
  copyText?: string;
  copyLabel?: string;
}) {
  const summary = variant === "summary";
  return (
    <section
      className={`rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12)] ${
        summary
          ? "border-[#3B82F6]/25 bg-[#1D4ED8]/10"
          : "border-[#1E293B] bg-[#111827]"
      }`}
    >
      {(title || copyText) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          {title ? (
            <h3
              className={`min-w-0 ${
                summary
                  ? "text-[14px] font-semibold leading-[1.4] text-[#BFDBFE]"
                  : "text-[14px] font-semibold leading-[1.4] text-[#F1F5F9]"
              }`}
            >
              {title}
            </h3>
          ) : (
            <span />
          )}
          {copyText && copyLabel ? <CopyControl text={copyText} label={copyLabel} /> : null}
        </div>
      )}
      {children}
    </section>
  );
}

function MajorSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3 pb-2 border-b border-[#1E293B]">
        <h2 className="text-[16px] font-semibold leading-[1.4] tracking-[-0.005em] text-[#F8FAFC]">
          {label}
        </h2>
      </div>
      {children}
    </section>
  );
}

function SubBlock({
  title,
  body,
  copyLabel,
}: {
  title: string;
  body?: string;
  copyLabel?: string;
}) {
  if (!body || !String(body).trim()) return null;
  return (
    <OutputCard
      title={title}
      variant={isSummaryTitle(title) ? "summary" : "default"}
      copyText={body}
      copyLabel={copyLabel}
    >
      <MarkdownBody text={body} asChecklist={isChecklistTitle(title)} />
    </OutputCard>
  );
}

function SectionWithSubsections({
  label,
  body,
  discrete,
  copyLabel,
  forceChecklist,
}: {
  label: string;
  body?: string;
  discrete?: Array<{ title: string; body?: string }>;
  copyLabel?: string;
  forceChecklist?: boolean;
}) {
  const named = (discrete || []).filter((d) => d.body && String(d.body).trim());

  return (
    <MajorSection label={label}>
      {named.length > 0 ? (
        <div className="space-y-4">
          {named.map((sub) => (
            <SubBlock key={sub.title} title={sub.title} body={sub.body} copyLabel={copyLabel} />
          ))}
        </div>
      ) : body ? (
        (() => {
          const subs = splitByH3(body);
          const hasNamedSubs = subs.some((s) => s.title);
          if (hasNamedSubs) {
            return (
              <div className="space-y-4">
                {subs.map((sub, idx) =>
                  sub.title ? (
                    <SubBlock
                      key={`${sub.title}-${idx}`}
                      title={sub.title}
                      body={sub.body}
                      copyLabel={copyLabel}
                    />
                  ) : (
                    <OutputCard key={`body-${idx}`} copyText={sub.body} copyLabel={copyLabel}>
                      <MarkdownBody text={sub.body} asChecklist={!!forceChecklist} />
                    </OutputCard>
                  ),
                )}
              </div>
            );
          }
          return (
            <OutputCard copyText={body} copyLabel={copyLabel}>
              <MarkdownBody
                text={body}
                asChecklist={!!forceChecklist || isChecklistTitle(label)}
              />
            </OutputCard>
          );
        })()
      ) : null}
    </MajorSection>
  );
}

export function getNavigatorPlainText(document: GeneratedDocumentData): string {
  const parts = [
    document.title,
    document.documented_template,
    document.implementation_guidance,
    document.purpose_strategic_intent,
    document.rollout_checklist,
    document.prerequisite_dependencies,
    document.critical_success_factors,
    document.common_pitfalls,
    document.daily_usability,
    document.executive_summary,
    document.process_sipoc,
    document.escalation_thresholds,
    document.associated_forms_records,
  ]
    .map((p) => (p ? String(p).trim() : ""))
    .filter(Boolean);

  const content = cleanMarkdown(document.content || "");
  if (!parts.length && content) return content;
  if (content && content.length > 120 && !document.documented_template && !document.implementation_guidance) {
    parts.push(content);
  }
  return parts.join("\n\n");
}

export function extractIsoStandardBadge(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const m = trimmed.match(/\b(?:ISO\/IEC|ISO|IEC)\s*[\d][\dA-Za-z\s:.-]{1,32}/i);
  if (m) {
    const badge = m[0].replace(/\s+/g, " ").trim();
    if (badge.length <= 48) return badge;
  }
  if (trimmed.length <= 48) return trimmed;
  return null;
}

type Props = {
  document: GeneratedDocumentData;
  labels: {
    sectionTemplate: string;
    sectionImplementation: string;
    sectionDailyUsability: string;
    emptyGenerate: string;
    mappedProtocols: string;
    clauseLabel: string;
    copyClipboard?: string;
  };
};

export default function NavigatorDocumentView({ document, labels }: Props) {
  const copyLabel = labels.copyClipboard || "Copy";
  const implDiscrete = [
    { title: "Purpose & Strategic Intent", body: document.purpose_strategic_intent },
    { title: "Step-by-Step Rollout Checklist", body: document.rollout_checklist },
    { title: "Prerequisite Dependencies", body: document.prerequisite_dependencies },
    { title: "Critical Success Factors", body: document.critical_success_factors },
    { title: "Common Pitfalls & Warning Flags", body: document.common_pitfalls },
  ];
  const dailyDiscreteAll = [
    { title: "Plain-Language Executive Summary", body: document.executive_summary },
    { title: "Process Approach / SIPOC", body: document.process_sipoc },
    { title: "Escalation & Exception Thresholds", body: document.escalation_thresholds },
    { title: "Associated Forms, Records & Logs", body: document.associated_forms_records },
  ];

  let summaryTitle = "";
  let summaryBody = "";
  let dailyBody = document.daily_usability;
  const dailyDiscrete = dailyDiscreteAll.filter((d) => {
    if (d.body && isSummaryTitle(d.title)) {
      summaryTitle = d.title;
      summaryBody = String(d.body);
      return false;
    }
    return true;
  });

  if (!summaryBody && dailyBody) {
    const subs = splitByH3(dailyBody);
    const summarySub = subs.find((s) => s.title && isSummaryTitle(s.title));
    if (summarySub) {
      summaryTitle = summarySub.title;
      summaryBody = summarySub.body;
      const remainder = subs
        .filter((s) => s !== summarySub)
        .map((s) => (s.title ? `### ${s.title}\n\n${s.body}` : s.body))
        .join("\n\n")
        .trim();
      dailyBody = remainder || undefined;
    }
  }

  const hasImplDiscrete = implDiscrete.some((d) => d.body && String(d.body).trim());
  const hasDailyDiscrete = dailyDiscrete.some((d) => d.body && String(d.body).trim());

  const hasStructured = !!(
    document.documented_template ||
    document.implementation_guidance ||
    document.daily_usability ||
    hasImplDiscrete ||
    hasDailyDiscrete
  );

  const showTemplate = !!(document.documented_template && String(document.documented_template).trim());
  const showImpl = !!(
    (document.implementation_guidance && String(document.implementation_guidance).trim()) ||
    hasImplDiscrete
  );
  const showDaily = !!(
    (dailyBody && String(dailyBody).trim()) ||
    hasDailyDiscrete
  );

  return (
    <div className="font-sans text-[14px] font-normal leading-[1.6] text-[#CBD5E1] min-w-0">
      {summaryBody ? (
        <div className="mb-8">
          <OutputCard
            title={summaryTitle || "Plain-Language Executive Summary"}
            variant="summary"
            copyText={summaryBody}
            copyLabel={copyLabel}
          >
            <MarkdownBody text={summaryBody} />
          </OutputCard>
        </div>
      ) : null}
      {hasStructured && (showTemplate || showImpl || showDaily) ? (
        <div className="space-y-8">
          {showTemplate && (
            <SectionWithSubsections
              label={labels.sectionTemplate}
              body={document.documented_template}
              copyLabel={copyLabel}
            />
          )}
          {showImpl && (
            <SectionWithSubsections
              label={labels.sectionImplementation}
              body={hasImplDiscrete ? undefined : document.implementation_guidance}
              discrete={hasImplDiscrete ? implDiscrete : undefined}
              copyLabel={copyLabel}
            />
          )}
          {showDaily && (
            <SectionWithSubsections
              label={labels.sectionDailyUsability}
              body={hasDailyDiscrete ? undefined : dailyBody}
              discrete={hasDailyDiscrete ? dailyDiscrete : undefined}
              copyLabel={copyLabel}
            />
          )}
          {document.content &&
            cleanMarkdown(document.content).length > 120 &&
            !(showTemplate && showImpl && showDaily) && (
              <OutputCard copyText={document.content} copyLabel={copyLabel}>
                <MarkdownBody text={document.content} />
              </OutputCard>
            )}
        </div>
      ) : (() => {
          const content = cleanMarkdown(document.content || "");
          if (!content) {
            return <p className="text-[14px] leading-[1.6] text-[#94A3B8]">{labels.emptyGenerate}</p>;
          }
          const h2Parts = content.split(/\n(?=##\s+)/);
          const namedH2 = h2Parts
            .map((part) => {
              const match = part.match(/^##\s+([^\n]+)\n?([\s\S]*)$/);
              if (match) return { title: match[1].trim(), body: match[2].trim() };
              return { title: "", body: part.trim() };
            })
            .filter((p) => p.body);
          if (namedH2.some((p) => p.title)) {
            return (
              <div className="space-y-8">
                {namedH2.map((sec, idx) =>
                  sec.title ? (
                    <SectionWithSubsections
                      key={`${sec.title}-${idx}`}
                      label={sec.title}
                      body={sec.body}
                      copyLabel={copyLabel}
                    />
                  ) : (
                    <OutputCard key={`c-${idx}`} copyText={sec.body} copyLabel={copyLabel}>
                      <MarkdownBody text={sec.body} />
                    </OutputCard>
                  ),
                )}
              </div>
            );
          }
          return (
            <OutputCard copyText={content} copyLabel={copyLabel}>
              <MarkdownBody text={content} />
            </OutputCard>
          );
        })()}

      {Array.isArray(document.iso_clauses_referenced) && document.iso_clauses_referenced.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#1E293B]">
          <p className="text-[11px] font-normal leading-[1.3] uppercase tracking-[0.12em] text-[#64748B] mb-3">
            {labels.mappedProtocols}
          </p>
          <div className="flex flex-wrap gap-2">
            {document.iso_clauses_referenced.map((clause) => (
              <span
                key={clause}
                className="inline-flex items-center px-2 py-1 rounded-md bg-[#1D4ED8]/15 text-[#93C5FD] font-jetbrains-mono text-[12px] font-medium tracking-[0.02em] border border-[#3B82F6]/20"
              >
                {labels.clauseLabel} {clause}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
