"use client";

import { BenchmarkData } from "@/types/benchmark";
import {
  AlertTriangle,
  BarChart,
  CheckCircle,
  CheckCircle2,
  FileText,
  Lightbulb,
  Search,
  Sparkles,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import i18n from "@/lib/i18n/client";

export default function ResultsPage({
  result,
  onReset,
  embedded = false,
}: {
  result: BenchmarkData;
  onReset: () => void;
  embedded?: boolean;
}) {
  const params = useParams();
  const lang = params?.lang || "en";

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  const gradeColor =
    result.grade === "A"
      ? "text-emerald-600"
      : result.grade === "B"
        ? "text-amber-600"
        : "text-red-600";

  const ofiItems =
    result.opportunities_for_improvement?.length
      ? result.opportunities_for_improvement
      : (result.recommendations ?? []).map(
          (r) => `${r.title}: ${r.description}`,
        );

  const commonNcItems = result.common_nonconformities ?? [];

  return (
    <div
      className={`${
        embedded
          ? "h-full space-y-5 animate-in fade-in duration-500"
          : "min-h-screen space-y-8 bg-[var(--ib-bg)] p-4 animate-in fade-in duration-500 md:space-y-12 md:p-8"
      }`}
    >
      {!embedded ? (
        <header className="mb-8 space-y-4 px-2 sm:px-0">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full border border-[var(--ib-acc)]/20 bg-[var(--ib-accbg)] px-4 py-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--ib-acc)]">
                BENCHMARK RESULTS
              </span>
            </div>
          </div>
          <h1 className="mb-4 text-center text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--ib-ink)] lg:text-[52px]">
            Benchmark Diagnostic{" "}
            <span className="text-[var(--ib-acc)]">Workspace</span>
          </h1>
          <p className="mx-auto max-w-4xl text-center font-inter text-sm font-medium leading-relaxed text-[var(--ib-mute)] lg:text-lg">
            Compare your document content directly against the latest ISO Library
            edition — with gaps, OFIs, and common non-conformity themes.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onReset}
              className="rounded-xl bg-[var(--ib-acc)] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:opacity-92"
            >
              Analyze another document
            </button>
          </div>
        </header>
      ) : null}

      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-6 shadow-2xl md:p-10">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[var(--ib-accbg)] blur-[60px]" />
          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            {[
              {
                label: "Overall Score",
                value: result.overall_score,
                color: gradeColor,
                bar: "bg-amber-400",
                extra: (
                  <span className={`mt-1 block text-sm font-extrabold ${gradeColor}`}>
                    Grade {result.grade}
                  </span>
                ),
              },
              {
                label: "Completeness",
                value: result.compliance_percentage,
                color: "text-[var(--ib-acc)]",
                bar: "bg-[var(--ib-acc)]",
              },
              {
                label: "Effectiveness",
                value: result.effectiveness_percentage,
                color: "text-emerald-600",
                bar: "bg-emerald-500",
              },
            ].map(({ label, value, color, bar, extra }) => (
              <div key={label} className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--ib-mute)]">
                  {label}
                </p>
                <span
                  className={`font-jetbrains-mono text-4xl font-black tracking-tighter md:text-5xl lg:text-6xl ${color}`}
                >
                  {value ?? "—"}%
                </span>
                {extra}
                <div className="mt-4 h-2 w-full rounded-full bg-[var(--ib-bg)]">
                  <div
                    className={`${bar} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${value ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 border-t border-[var(--ib-line)] pt-4 text-[10px] font-medium text-[var(--ib-mute)] md:mt-8 md:gap-8 md:pt-6 md:text-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-[var(--ib-acc)]" />
              <span>
                <b className="text-[var(--ib-ink)]">Protocol:</b>{" "}
                {result.document_type_detected || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[var(--ib-acc)]" />
              <span>
                <b className="text-[var(--ib-ink)]">Latest ISO Library:</b>{" "}
                {result.standard_analyzed || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="h-3.5 w-3.5 text-[var(--ib-acc)]" />
              <span>
                <b className="text-[var(--ib-ink)]">Focus:</b> Gaps · OFIs · Common NCs
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-6 shadow-2xl md:p-10">
          <h3 className="mb-8 border-l-4 border-[var(--ib-acc)] pl-6 text-xl font-black uppercase tracking-widest text-[var(--ib-ink)]">
            Neural Compliance Matrix
          </h3>
          <div className="space-y-8">
            {(result.clause_compliance ?? []).map((c) => (
              <div key={c.clause_number} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-[var(--ib-ink)] md:text-base">
                      {c.clause_number} {c.clause_title}
                    </span>
                    <p className="text-xs font-medium italic text-[var(--ib-mute)]">
                      Evidence: {c.evidence_found}
                    </p>
                    <p className="text-xs font-medium text-red-600">
                      Gap: {c.gap_description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-lg border px-2 py-1 text-[8px] font-bold uppercase tracking-wider md:px-3 md:text-[10px] ${
                        c.status === "Conforming"
                          ? "border-emerald-500/30 bg-emerald-50 text-emerald-700"
                          : c.status === "Major Gap"
                            ? "border-red-500/30 bg-red-50 text-red-700"
                            : "border-amber-500/30 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="w-10 text-right text-sm font-black text-[var(--ib-ink)] md:w-12 md:text-base">
                      {c.compliance_percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--ib-bg)]">
                  <div
                    className={`${
                      c.status === "Conforming"
                        ? "bg-emerald-500"
                        : c.status === "Major Gap"
                          ? "bg-red-500"
                          : "bg-amber-400"
                    } h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${c.compliance_percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {(result.clause_compliance ?? []).length === 0 ? (
              <p className="text-sm text-[var(--ib-mute)]">
                No clause matrix returned for this run.
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-6 rounded-3xl border border-emerald-500/20 bg-[var(--ib-card)] p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-50 p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <h4 className="text-base font-black uppercase tracking-wider text-[var(--ib-ink)]">
                Strengths
              </h4>
            </div>
            <ul className="space-y-3">
              {(result.strengths ?? []).map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs font-medium leading-relaxed text-[var(--ib-ink)] md:gap-3 md:text-sm"
                >
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 md:h-4 md:w-4" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 rounded-3xl border border-red-500/20 bg-[var(--ib-card)] p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-red-50 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h4 className="text-base font-black uppercase tracking-wider text-[var(--ib-ink)]">
                Identified Gaps
              </h4>
            </div>
            <ul className="space-y-3">
              {(result.identified_gaps ?? []).map((g, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs font-medium leading-relaxed text-[var(--ib-ink)] md:gap-3 md:text-sm"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 md:h-4 md:w-4" />
                  <span>
                    <span className="font-bold text-[var(--ib-ink)]">
                      {g.clause_reference}: {g.gap_title}
                    </span>
                    {" — "}
                    {g.gap_description}
                  </span>
                </li>
              ))}
              {(result.identified_gaps ?? []).length === 0 ? (
                <li className="text-sm text-[var(--ib-mute)]">No gaps flagged.</li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-6 shadow-2xl md:p-10">
          <div className="mb-8 flex items-center gap-4">
            <div className="rounded-xl bg-[var(--ib-accbg)] p-2 text-[var(--ib-acc)]">
              <Sparkles className="h-5 w-5 text-[var(--ib-acc)]" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest text-[var(--ib-ink)]">
                Opportunities for Improvement
              </h3>
              <p className="mt-1 text-xs font-medium text-[var(--ib-mute)]">
                Actionable OFIs to close gaps against the latest Library edition
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {(result.recommendations ?? []).length > 0
              ? (result.recommendations ?? []).map((r, i) => (
                  <div
                    key={i}
                    className="group rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)]/50 p-4 transition-all hover:border-[var(--ib-acc)]/30 hover:shadow-md md:p-6"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ib-ink)] text-xs font-black text-white md:h-8 md:w-8">
                          {i + 1}
                        </div>
                        <span
                          className={`rounded-lg px-2 py-1 text-[8px] font-bold uppercase tracking-wider md:px-3 md:text-[10px] ${
                            r.priority === "High Priority"
                              ? "border border-red-500/20 bg-red-50 text-red-700"
                              : r.priority === "Medium Priority"
                                ? "border border-amber-500/20 bg-amber-50 text-amber-700"
                                : "border border-blue-500/20 bg-blue-50 text-blue-700"
                          }`}
                        >
                          {r.priority}
                        </span>
                      </div>
                      <span className="rounded-lg border border-[var(--ib-line)] bg-[var(--ib-bg)] px-2 py-1 text-[10px] font-bold text-[var(--ib-mute)] md:px-3 md:text-xs">
                        Clause {r.clause_reference}
                      </span>
                    </div>
                    <h4 className="mb-2 text-base font-bold text-[var(--ib-ink)] transition-colors group-hover:text-[var(--ib-acc)] md:text-lg">
                      {r.title}
                    </h4>
                    <p className="mb-4 text-xs font-medium leading-relaxed text-[var(--ib-mute)] md:text-sm">
                      <span className="font-bold text-[var(--ib-ink)]">OFI: </span>
                      {r.description}
                    </p>
                    <div className="flex items-start gap-2 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-3 shadow-sm md:gap-3 md:p-4">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500 md:h-4 md:w-4" />
                      <p className="text-[10px] font-medium text-[var(--ib-mute)] md:text-xs">
                        <span className="font-bold text-[var(--ib-ink)]">Benefit: </span>
                        {r.benefit_statement}
                      </p>
                    </div>
                  </div>
                ))
              : ofiItems.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)]/50 p-4 text-sm font-medium text-[var(--ib-ink)] md:p-5"
                  >
                    {item}
                  </div>
                ))}
            {ofiItems.length === 0 && (result.recommendations ?? []).length === 0 ? (
              <p className="text-sm text-[var(--ib-mute)]">
                No opportunities for improvement returned.
              </p>
            ) : null}
          </div>
        </div>

        {commonNcItems.length > 0 ? (
          <div className="rounded-3xl border border-amber-500/20 bg-[var(--ib-card)] p-6 shadow-2xl md:p-10">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-xl bg-amber-50 p-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-[var(--ib-ink)]">
                  Common Non-Conformities
                </h3>
                <p className="mt-1 text-xs font-medium text-[var(--ib-mute)]">
                  Typical NC themes to watch for this standard / protocol
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {commonNcItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm font-medium text-[var(--ib-ink)]"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black text-amber-700">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {embedded ? (
          <button
            onClick={onReset}
            className="w-full rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] py-3 text-xs font-black uppercase tracking-widest text-[var(--ib-mute)] transition-colors hover:border-[var(--ib-acc)] hover:text-[var(--ib-acc)]"
          >
            Analyze another document
          </button>
        ) : null}
      </div>
    </div>
  );
}
