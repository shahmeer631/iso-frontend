"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

function Section({ title, body }: { title: string; body?: string }) {
  if (!body || !String(body).trim()) return null;
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-black text-[#F8F9FA] mb-4 pb-2 border-b border-[#1E293B]">
        {title}
      </h2>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {cleanMarkdown(String(body))}
        </ReactMarkdown>
      </div>
    </section>
  );
}

function SubSection({ title, body }: { title: string; body?: string }) {
  if (!body || !String(body).trim()) return null;
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-[#F8F9FA] mt-4 mb-2">{title}</h3>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {cleanMarkdown(String(body))}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function AuditStepGuidanceView({ data, emptyMessage }: Props) {
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

  // Prefer discrete What/When/Why fields when present; else auditor_guidance blob
  const showDiscreteGuidance = hasDiscreteParts;

  return (
    <div className="space-y-10">
      {hasMajorSections ? (
        <>
          {(showDiscreteGuidance || data.auditor_guidance) && (
            <section>
              <h2 className="text-xl md:text-2xl font-black text-[#F8F9FA] mb-4 pb-2 border-b border-[#1E293B]">
                1. Auditor Guidance
              </h2>
              {showDiscreteGuidance ? (
                <>
                  <SubSection title="What to Do" body={data.what_to_do} />
                  <SubSection title="When to Do It" body={data.when_to_do_it} />
                  <SubSection title="Why It Is Necessary" body={data.why_it_is_necessary} />
                  <SubSection
                    title="Specification / Requirement to Check"
                    body={data.specification_to_check}
                  />
                  <SubSection title="Evidence to Look For" body={data.evidence_to_look_for} />
                  <SubSection title="Audit Questions / Checkpoints" body={data.audit_questions} />
                </>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {cleanMarkdown(String(data.auditor_guidance))}
                  </ReactMarkdown>
                </div>
              )}
            </section>
          )}

          <Section title="2. Audit Paper / Document" body={data.audit_paper} />
          <Section
            title="3. Documented Information Template"
            body={data.documented_information_template}
          />
          <Section title="4. Demonstrated Case Study" body={data.case_study} />

          {/* Only dump full guidance if we lack the major structured pieces */}
          {guidance.length > 120 &&
            !data.auditor_guidance &&
            !showDiscreteGuidance &&
            !(data.audit_paper && data.case_study) && (
              <div className="prose prose-invert max-w-none border-t border-[#1E293B] pt-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {guidance}
                </ReactMarkdown>
              </div>
            )}
        </>
      ) : (
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {guidance}
          </ReactMarkdown>
        </div>
      )}

      {showPreview && (
        <div className="mt-4 border-t border-[#1E293B] pt-10">
          <h3 className="text-xl font-black text-[#F8F9FA] uppercase tracking-widest mb-6">
            Audit Paper / Template Preview
          </h3>
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
