"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import { CopyControl } from "@/components/AIAssistant/CopyControl";

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

const mdComponents: any = {
  h1: (props: any) => (
    <h1 className="text-2xl md:text-3xl font-black text-[#F8F9FA] mb-6 tracking-tight" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-xl md:text-2xl font-black text-[#F8F9FA] mt-10 mb-4 pb-2 border-b border-[#1E293B]" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-lg md:text-xl font-bold text-[#F8F9FA] mt-8 mb-3" {...props} />
  ),
  h4: (props: any) => (
    <h4 className="text-base md:text-lg font-bold text-[#F8F9FA] mt-6 mb-3" {...props} />
  ),
  p: (props: any) => (
    <p className="text-gray-200 leading-relaxed mb-6 font-medium text-base" {...props} />
  ),
  strong: (props: any) => <strong className="font-black text-[#F8F9FA]" {...props} />,
  ul: ({ className, ...props }: any) => (
    <ul className={`list-disc pl-6 mb-8 space-y-2 !text-white ${className || ""}`} {...props} />
  ),
  ol: ({ className, ...props }: any) => (
    <ol className={`list-decimal pl-6 mb-8 space-y-2 !text-white ${className || ""}`} {...props} />
  ),
  li: ({ className, ...props }: any) => (
    <li className={`!text-white font-medium leading-relaxed ${className || ""}`} {...props} />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-8 border border-[#1E293B] rounded-xl">
      <table className="min-w-full border-collapse" {...props} />
    </div>
  ),
  thead: (props: any) => <thead className="bg-[#131B2D]" {...props} />,
  th: (props: any) => (
    <th className="border-b border-[#1E293B] p-4 text-left font-black text-[#F8F9FA] uppercase tracking-wider text-xs" {...props} />
  ),
  td: (props: any) => (
    <td className="border-b border-[#1E293B]/50 p-4 text-sm text-[#9CA3AF]" {...props} />
  ),
};

type AuditStepData = {
  guidance?: string;
  template_preview?: string;
  auditor_guidance?: string;
  audit_paper?: string;
  documented_information_template?: string;
  case_study?: string;
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

function Section({
  title,
  body,
  copyLabel,
}: {
  title: string;
  body?: string;
  copyLabel: string;
}) {
  if (!body || !String(body).trim()) return null;
  const text = cleanMarkdown(String(body));
  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-3 pb-2 border-b border-[#1E293B]">
        <h2 className="min-w-0 text-xl md:text-2xl font-black text-[#F8F9FA]">{title}</h2>
        <CopyControl text={text} label={copyLabel} />
      </div>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {text}
        </ReactMarkdown>
      </div>
    </section>
  );
}

function SubSection({
  title,
  body,
  copyLabel,
}: {
  title: string;
  body?: string;
  copyLabel: string;
}) {
  if (!body || !String(body).trim()) return null;
  const text = cleanMarkdown(String(body));
  return (
    <div className="mb-6 rounded-2xl border border-[#1E293B] bg-[#111827] px-4 py-4 sm:px-5 sm:py-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[14px] font-semibold leading-[1.4] text-[#F1F5F9]">
          {title}
        </h3>
        <CopyControl text={text} label={copyLabel} />
      </div>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function AuditStepGuidanceView({ data, emptyMessage }: Props) {
  const { t } = useTranslation();
  const copyLabel = t("auditLens.copyClipboard") || t("isoNavigator.copyClipboard") || "Copy";
  const guidance = cleanMarkdown(data.guidance || "");

  const hasDiscreteParts =
    !!(
      data.what_to_do ||
      data.when_to_do_it ||
      data.why_it_is_necessary ||
      data.specification_to_check ||
      data.evidence_to_look_for ||
      data.audit_questions
    );

  const hasMajorSections = !!(
    data.auditor_guidance ||
    data.audit_paper ||
    data.documented_information_template ||
    data.case_study ||
    hasDiscreteParts
  );

  if (!guidance && !hasMajorSections) {
    return (
      <p className="text-[#9CA3AF] text-sm">
        {emptyMessage || "No guidance was generated for this step. Please retry."}
      </p>
    );
  }

  const preview = (data.template_preview || "").trim();
  const showPreview =
    preview.length > 40 &&
    !guidance.includes(preview.slice(0, Math.min(80, preview.length))) &&
    !String(data.audit_paper || "").includes(preview.slice(0, Math.min(80, preview.length))) &&
    !String(data.documented_information_template || "").includes(
      preview.slice(0, Math.min(80, preview.length)),
    );

  const showDiscreteGuidance = hasDiscreteParts;

  const auditorGuidanceBlob = cleanMarkdown(String(data.auditor_guidance || ""));

  return (
    <div className="space-y-10">
      {hasMajorSections ? (
        <>
          {(showDiscreteGuidance || data.auditor_guidance) && (
            <section>
              <div className="mb-4 flex items-start justify-between gap-3 pb-2 border-b border-[#1E293B]">
                <h2 className="min-w-0 text-xl md:text-2xl font-black text-[#F8F9FA]">
                  A. Auditor Guidance
                </h2>
                {!showDiscreteGuidance && auditorGuidanceBlob ? (
                  <CopyControl text={auditorGuidanceBlob} label={copyLabel} />
                ) : null}
              </div>
              {showDiscreteGuidance ? (
                <>
                  <SubSection title="What to Do" body={data.what_to_do} copyLabel={copyLabel} />
                  <SubSection title="When to Do It" body={data.when_to_do_it} copyLabel={copyLabel} />
                  <SubSection
                    title="Why It Is Necessary"
                    body={data.why_it_is_necessary}
                    copyLabel={copyLabel}
                  />
                  <SubSection
                    title="Specification / Requirement to Check"
                    body={data.specification_to_check}
                    copyLabel={copyLabel}
                  />
                  <SubSection
                    title="Evidence to Look For"
                    body={data.evidence_to_look_for}
                    copyLabel={copyLabel}
                  />
                  <SubSection
                    title="Audit Questions / Checkpoints"
                    body={data.audit_questions}
                    copyLabel={copyLabel}
                  />
                </>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {auditorGuidanceBlob}
                  </ReactMarkdown>
                </div>
              )}
            </section>
          )}

          <Section
            title="B. Audit Work Paper / Audit Document"
            body={data.audit_paper}
            copyLabel={copyLabel}
          />
          <Section
            title="C. Documented Information Template"
            body={data.documented_information_template}
            copyLabel={copyLabel}
          />
          <Section
            title="D. Demonstrated Case Study — Hypothetical Example"
            body={data.case_study}
            copyLabel={copyLabel}
          />

          {guidance.length > 120 &&
            !data.auditor_guidance &&
            !showDiscreteGuidance &&
            !(data.audit_paper && data.case_study) && (
              <div className="prose prose-invert max-w-none border-t border-[#1E293B] pt-8">
                <div className="mb-4 flex justify-end">
                  <CopyControl text={guidance} label={copyLabel} />
                </div>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {guidance}
                </ReactMarkdown>
              </div>
            )}
        </>
      ) : (
        <div className="prose prose-invert max-w-none">
          <div className="mb-4 flex justify-end">
            <CopyControl text={guidance} label={copyLabel} />
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {guidance}
          </ReactMarkdown>
        </div>
      )}

      {showPreview && (
        <div className="mt-4 border-t border-[#1E293B] pt-10">
          <div className="mb-6 flex items-start justify-between gap-3">
            <h3 className="min-w-0 text-xl font-black text-[#F8F9FA] uppercase tracking-widest">
              Audit Paper / Template Preview
            </h3>
            <CopyControl text={cleanMarkdown(preview)} label={copyLabel} />
          </div>
          <div className="bg-[#131B2D] p-6 md:p-8 rounded-2xl border border-[#1E293B] overflow-x-auto">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {cleanMarkdown(preview)}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
