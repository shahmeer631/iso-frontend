"use client";

import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  GraduationCap,
  HardHat,
  Leaf,
  Library,
  Scale,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import GetStartedCard from "@/components/mastery-lab/GetStartedSection";
import { useGenerateQuizMutation } from "@/lib/redux/api/quizApi";
import { toast } from "sonner";
import FullPageLoader from "@/components/Shared/FullPageLoader";

const INDUSTRIES = [
  "Aerospace",
  "Artificial Intelligence",
  "Automotive",
  "Construction & Engineering",
  "Cybersecurity & Data Privacy",
  "Education",
  "Energy & Utilities",
  "Financial Services",
  "Food & Beverage",
  "Government & Public Sector",
  "Healthcare & Medical Services",
  "Information Technology (IT)",
  "Manufacturing",
  "Oil & Gas",
  "Pharmaceuticals",
  "Telecommunications",
].map((item) => ({ label: item, value: item }));

const LEVELS = [
  { label: "Manager", value: "Manager" },
  { label: "Senior", value: "Senior" },
  { label: "Entry", value: "Entry" },
];

const DEPARTMENTS = [
  "Quality Assurance",
  "Information Security (ISMS)",
  "Health & Safety",
  "Environmental Management",
  "Internal Audit",
  "Operations",
  "Compliance",
  "IT (Information Technology)",
  "Human Resources",
  "Engineering",
].map((item) => ({ label: item, value: item }));

const LIBRARY_SLIDES = [
  {
    title: "Quality management",
    code: "ISO 9001",
    desc: "Build consistent products and services with a proven QMS framework.",
    href: "/library/iso-standards",
    icon: Target,
  },
  {
    title: "Information security",
    code: "ISO/IEC 27001",
    desc: "Protect sensitive data with cybersecurity and privacy controls.",
    href: "/library/iso-standards",
    icon: Shield,
  },
  {
    title: "Environmental management",
    code: "ISO 14001",
    desc: "Reduce environmental impact with a structured EMS approach.",
    href: "/library/iso-standards",
    icon: Leaf,
  },
  {
    title: "Occupational health & safety",
    code: "ISO 45001",
    desc: "Lower workplace risk and strengthen safety culture.",
    href: "/library/iso-standards",
    icon: HardHat,
  },
  {
    title: "Compliance management",
    code: "ISO 37301",
    desc: "Govern obligations with a clear compliance management system.",
    href: "/library/iso-standards",
    icon: Scale,
  },
  {
    title: "AI management systems",
    code: "ISO/IEC 42001",
    desc: "Govern responsible AI with an emerging management standard.",
    href: "/library/iso-standards",
    icon: Sparkles,
  },
];

const ACADEMY_SLIDES = [
  {
    title: "Quality management courses",
    desc: "Structured paths for QMS implementation and audit readiness.",
    href: "/academy/quality-management",
    icon: GraduationCap,
  },
  {
    title: "Information security courses",
    desc: "ISMS learning for cybersecurity, privacy, and controls.",
    href: "/academy/information-security",
    icon: Shield,
  },
  {
    title: "Health & safety courses",
    desc: "OHS programs that connect policy to day-to-day practice.",
    href: "/academy/health-safety",
    icon: HardHat,
  },
  {
    title: "Environmental management courses",
    desc: "EMS training focused on impact, evidence, and improvement.",
    href: "/academy/environmental-management",
    icon: Leaf,
  },
  {
    title: "View all courses",
    desc: "Browse the full Academy catalog across every management system.",
    href: "/academy",
    icon: Library,
  },
];

const AI_SLIDES = [
  {
    title: "ISO Navigator",
    desc: "Generate grounded documents, policies, and clause-aligned guidance.",
    href: "/ai-assistant/iso-navigator",
    icon: FileSearch,
  },
  {
    title: "Audit Lens",
    desc: "Walk audits stage by stage with practical, standard-aware support.",
    href: "/ai-assistant/audit-lens",
    icon: ClipboardCheck,
  },
  {
    title: "Benchmark AI",
    desc: "Compare your practices and close gaps with AI-assisted insight.",
    href: "/ai-assistant/benchmark-ai",
    icon: Sparkles,
  },
];

function useAutoIndex(length: number, ms = 4500) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, ms);
    return () => window.clearInterval(id);
  }, [length, ms]);
  return [index, setIndex] as const;
}

function CarouselShell({
  children,
  index,
  setIndex,
  count,
  label,
}: {
  children: ReactNode;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  count: number;
  label: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] shadow-[0_24px_60px_-24px_rgba(11,18,32,0.28)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-card)_90%,var(--ib-accbg))] px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <i className="block size-2 rounded-full bg-[var(--ib-line)]" />
          <i className="block size-2 rounded-full bg-[var(--ib-line)]" />
          <i className="block size-2 rounded-full bg-[var(--ib-line)]" />
          <span className="ml-2 truncate text-[11px] font-medium text-[var(--ib-mute)]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="grid size-7 place-items-center rounded-lg border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-mute)] transition-colors hover:text-[var(--ib-ink)]"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="grid size-7 place-items-center rounded-lg border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-mute)] transition-colors hover:text-[var(--ib-ink)]"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="relative min-h-[280px] p-5 sm:min-h-[300px] sm:p-6">{children}</div>
      <div className="flex items-center justify-center gap-1.5 border-t border-[var(--ib-line)] px-4 py-3">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index
                ? "w-5 bg-[var(--ib-acc)]"
                : "w-1.5 bg-[var(--ib-line)] hover:bg-[var(--ib-mute)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function MasteryVisual() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const [generateQuiz, { isLoading }] = useGenerateQuizMutation();

  const handleStart = async (data: {
    industry: string;
    managementLevel: string;
    department: string;
  }) => {
    try {
      const res = await generateQuiz({
        context: {
          industry: data.industry,
          management_level: data.managementLevel,
          department: data.department,
        },
        num_questions: 10,
        difficulty: "professional",
      }).unwrap();

      const quizData = res.data || res;
      const questionsRaw = quizData.questions || [];
      if (!questionsRaw.length) {
        toast.error("Failed to generate enough questions. Please try again.");
        return;
      }

      const transformedQuestions = questionsRaw
        .map((q: any, idx: number) => {
          const rawOptions = q?.options;
          const options = Array.isArray(rawOptions)
            ? rawOptions.map((text: unknown, i: number) => ({
                label: String.fromCharCode(65 + i),
                text: String(text ?? ""),
              }))
            : rawOptions && typeof rawOptions === "object"
              ? Object.entries(rawOptions).map(([label, text]) => ({
                  label,
                  text: String(text),
                }))
              : [];
          if (!q?.question || options.length === 0) return null;
          return {
            id: idx + 1,
            questionId: q.id ? String(q.id) : undefined,
            question: q.question,
            options,
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            hint: q.hint,
            hintInsight: q.explanation,
          };
        })
        .filter(Boolean);

      localStorage.setItem(
        "active_iso_quiz",
        JSON.stringify({
          title: quizData.quiz_title || "ISO Assessment Evaluation",
          questions: transformedQuestions,
          examSessionIds: quizData.examSessionId
            ? [String(quizData.examSessionId)]
            : [],
          generatedAt: quizData.generated_at || new Date().toISOString(),
          categoryId: data.industry,
          categoryName: data.industry,
          difficulty: data.managementLevel,
          jobFunction: data.department,
        }),
      );
      localStorage.removeItem("mastery_lab_progress");
      localStorage.removeItem("iso_assessment_progress");
      localStorage.removeItem("last_selected_option");
      localStorage.removeItem("all_selected_answers");
      router.push(`/${lang}/mastery-lab/assessment`);
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          "Failed to generate quiz. Our AI might be busy, please try again.",
      );
    }
  };

  return (
    <>
      {isLoading && <FullPageLoader />}
      <div className="rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-1 shadow-[0_24px_60px_-24px_rgba(11,18,32,0.28)]">
        <GetStartedCard
          industries={INDUSTRIES}
          managementLevels={LEVELS}
          departments={DEPARTMENTS}
          buttonText="Start your free assessment"
          onSubmit={handleStart}
        />
      </div>
    </>
  );
}

function LibraryVisual({ lang }: { lang: string }) {
  const [index, setIndex] = useAutoIndex(LIBRARY_SLIDES.length);
  const slide = LIBRARY_SLIDES[index];
  const Icon = slide.icon;

  return (
    <CarouselShell
      index={index}
      setIndex={setIndex}
      count={LIBRARY_SLIDES.length}
      label="ISO Library standards"
    >
      <Link
        href={`/${lang}${slide.href}`}
        className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-5 transition-colors hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))]"
      >
        <div>
          <span className="inline-flex items-center rounded-full border border-[var(--ib-line)] bg-[var(--ib-accbg)] px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[var(--ib-acc)] uppercase">
            {slide.code}
          </span>
          <div className="mt-5 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-[var(--ib-line)] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
              <Icon className="size-5" />
            </span>
            <div>
              <h4 className="mb-0! text-[20px] font-bold tracking-[-0.02em] text-[var(--ib-ink)]">
                {slide.title}
              </h4>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ib-mute)]">
                {slide.desc}
              </p>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--ib-acc)] group-hover:gap-2.5">
          Open in Library <ArrowRight className="size-4" />
        </span>
      </Link>
    </CarouselShell>
  );
}

function AcademyVisual({ lang }: { lang: string }) {
  const [index, setIndex] = useAutoIndex(ACADEMY_SLIDES.length);
  const slide = ACADEMY_SLIDES[index];
  const Icon = slide.icon;

  return (
    <CarouselShell
      index={index}
      setIndex={setIndex}
      count={ACADEMY_SLIDES.length}
      label="ISO Academy courses"
    >
      <Link
        href={`/${lang}${slide.href}`}
        className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-5 transition-colors hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))]"
      >
        <div>
          <span className="inline-flex items-center rounded-full border border-[var(--ib-line)] bg-[var(--ib-accbg)] px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[var(--ib-acc)] uppercase">
            Course track {String(index + 1).padStart(2, "0")}
          </span>
          <div className="mt-5 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-[var(--ib-line)] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
              <Icon className="size-5" />
            </span>
            <div>
              <h4 className="mb-0! text-[20px] font-bold tracking-[-0.02em] text-[var(--ib-ink)]">
                {slide.title}
              </h4>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ib-mute)]">
                {slide.desc}
              </p>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--ib-acc)] group-hover:gap-2.5">
          Explore courses <ArrowRight className="size-4" />
        </span>
      </Link>
    </CarouselShell>
  );
}

function AIVisual({ lang }: { lang: string }) {
  const [index, setIndex] = useAutoIndex(AI_SLIDES.length);
  const slide = AI_SLIDES[index];
  const Icon = slide.icon;

  return (
    <CarouselShell
      index={index}
      setIndex={setIndex}
      count={AI_SLIDES.length}
      label="AI Assistant tools"
    >
      <Link
        href={`/${lang}${slide.href}`}
        className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-5 transition-colors hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))]"
      >
        <div>
          <span className="inline-flex items-center rounded-full border border-[var(--ib-line)] bg-[var(--ib-accbg)] px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[var(--ib-acc)] uppercase">
            Tool {String(index + 1).padStart(2, "0")}
          </span>
          <div className="mt-5 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-[var(--ib-line)] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
              <Icon className="size-5" />
            </span>
            <div>
              <h4 className="mb-0! text-[20px] font-bold tracking-[-0.02em] text-[var(--ib-ink)]">
                {slide.title}
              </h4>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ib-mute)]">
                {slide.desc}
              </p>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--ib-acc)] group-hover:gap-2.5">
          Open tool <ArrowRight className="size-4" />
        </span>
      </Link>
    </CarouselShell>
  );
}

export default function HomeProductVisual({
  productId,
}: {
  productId: string;
}) {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  if (productId === "mastery-lab") return <MasteryVisual />;
  if (productId === "library") return <LibraryVisual lang={lang} />;
  if (productId === "academy") return <AcademyVisual lang={lang} />;
  if (productId === "ai-assistant") return <AIVisual lang={lang} />;
  return null;
}
