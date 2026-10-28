"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Info,
  Search,
  Leaf,
  Lock,
  Cpu,
  Utensils,
  Stethoscope,
  Zap,
  Scale,
  Layers,
  Building2,
  Beaker,
  AlertTriangle,
  Activity,
  Gavel,
  Server,
  Smile,
  Microscope,
  GraduationCap,
  Briefcase,
  Calendar,
  ClipboardList,
  HardHat,
  Shield,
  TrendingUp,
  Users,
  Landmark,
  Banknote,
} from "lucide-react";
import {
  useGetISOStandardsQuery,
  useGetCategoriesQuery,
} from "@/lib/redux/api/isoStandardsApi";
import {
  formatStandardMeta,
  sortStandardsByYearNumberName,
} from "@/lib/library/sortStandards";
import "@/lib/i18n/client";

const getCategoryIcon = (slug: string, name: string = "") => {
  const textToMatch = (slug + " " + name).toLowerCase();

  if (textToMatch.includes("9001") || textToMatch.includes("quality") || textToMatch.includes("qms")) return ClipboardList;
  if (textToMatch.includes("27001") || textToMatch.includes("information security") || textToMatch.includes("isms")) return Shield;
  if (textToMatch.includes("14001") || textToMatch.includes("environmental") || textToMatch.includes("ems")) return Leaf;
  if (textToMatch.includes("45001") || textToMatch.includes("occupational") || textToMatch.includes("ohs")) return HardHat;
  if (textToMatch.includes("artificial intelligence") || textToMatch.includes("aims")) return Cpu;
  if (textToMatch.includes("food safety") || textToMatch.includes("fsms")) return Utensils;
  if (textToMatch.includes("testing") || textToMatch.includes("calibration") || textToMatch.includes("tcl")) return Microscope;
  if (textToMatch.includes("risk") || textToMatch.includes("rmg")) return AlertTriangle;
  if (textToMatch.includes("continuity") || textToMatch.includes("bcm")) return Activity;
  if (textToMatch.includes("bribery") || textToMatch.includes("abms")) return Gavel;
  if (textToMatch.includes("it service") || slug.toLowerCase() === "it") return Server;
  if (textToMatch.includes("customer satisfaction") || slug.toLowerCase() === "cs") return Smile;
  if (textToMatch.includes("medical device") || textToMatch.includes("mdqms")) return Stethoscope;
  if (textToMatch.includes("energy") || textToMatch.includes("enms")) return Zap;
  if (textToMatch.includes("compliance") || textToMatch.includes("cms")) return Scale;
  if (textToMatch.includes("integrated") || textToMatch.includes("ims")) return Layers;
  if (textToMatch.includes("facility") || textToMatch.includes("fms")) return Building2;
  if (textToMatch.includes("educational") || textToMatch.includes("eoms")) return GraduationCap;
  if (textToMatch.includes("asset") || textToMatch.includes("ams")) return Briefcase;
  if (textToMatch.includes("event sustainability") || textToMatch.includes("esms")) return Calendar;
  if (textToMatch.includes("governance")) return Landmark;
  if (textToMatch.includes("lean six sigma") || textToMatch.includes("dmaic")) return TrendingUp;
  if (textToMatch.includes("human resources") || textToMatch.includes("hr ")) return Users;
  if (textToMatch.includes("banking") || textToMatch.includes("finance")) return Banknote;
  if (textToMatch.includes("security") || textToMatch.includes("lock")) return Lock;
  if (textToMatch.includes("lab") || textToMatch.includes("beaker")) return Beaker;

  return Info;
};

const ISOStandardCard = ({
  item,
  onOpenChat,
  category,
}: {
  item: any;
  onOpenChat: (id: string) => void;
  category: any;
}) => {
  const Icon = getCategoryIcon(
    item.category?.slug || category?.slug || "",
    item.category?.name || category?.name || "",
  );
  const meta = formatStandardMeta(item.title || "");
  const overview =
    String(item.description || item.summary || "").trim() ||
    "No overview yet. Open the standard to explore with ISOBrain.AI.";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-6 font-sans sm:p-7"
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
          <Icon className="size-5" />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <span className="rounded-md border border-[var(--ib-line)] bg-[var(--ib-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ib-mute)]">
            {meta.yearLabel}
          </span>
          <span className="rounded-md border border-[color-mix(in_srgb,var(--ib-acc)_20%,var(--ib-line))] bg-[var(--ib-accbg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ib-acc)]">
            {meta.numberLabel}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-2 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ib-mute)]">
          Year · Number · Name
        </p>
        <h3 className="mb-0! text-[16px] font-bold leading-snug tracking-[-0.02em] text-[var(--ib-ink)] transition-colors group-hover:text-[var(--ib-acc)]">
          {meta.nameLabel || item.title}
        </h3>
        <p className="text-[12.5px] font-medium text-[var(--ib-mute)]">
          {item.title}
        </p>
      </div>

      <div className="relative z-10 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-3.5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ib-acc)]">
          Overview
        </p>
        <p className="text-[13.5px] font-medium leading-relaxed text-[var(--ib-mute)] line-clamp-4">
          {overview}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenChat(item.id);
        }}
        className="relative z-10 mt-auto flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--ib-acc)] px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-92"
      >
        Open standard <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};

const CategoryStandardsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const lang = (params?.lang as string) || "en";
  const categoryId = params?.categoryId as string;

  const [searchTerm, setSearchTerm] = useState("");

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: standardsData, isLoading, isError } = useGetISOStandardsQuery({
    categoryId,
  });

  const category = useMemo(() => {
    return categoriesData?.data?.find((c) => c.id === categoryId);
  }, [categoriesData, categoryId]);

  const categoryName = category ? category.name : "Category Standards";
  const categoryDescription =
    category?.description ||
    `Browse and explore detailed ISO standards within the ${categoryName} management system.`;

  const filteredStandards = useMemo(() => {
    const standards = standardsData?.data || [];
    const filtered = !searchTerm
      ? standards
      : standards.filter(
          (s: any) =>
            s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.isoCode &&
              s.isoCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.description &&
              String(s.description)
                .toLowerCase()
                .includes(searchTerm.toLowerCase())),
        );
    return sortStandardsByYearNumberName(filtered);
  }, [standardsData, searchTerm]);

  const handleOpenChat = (id: string) => {
    router.push(`/${lang}/library/iso-standards/chat/${id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--ib-bg)] font-sans text-[var(--ib-ink)] selection:bg-[var(--ib-acc)]/30">
      <section className="relative overflow-hidden px-6 pb-10 pt-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-full max-w-7xl -translate-x-1/2">
          <div className="absolute left-1/4 top-[-10%] h-[480px] w-[520px] rounded-full bg-[color-mix(in_srgb,var(--ib-acc)_10%,transparent)] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="group mb-8 flex items-center gap-2 text-[var(--ib-mute)] transition-colors hover:text-[var(--ib-ink)]"
          >
            <ArrowLeft
              size={20}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span>{t("common.back", "Back")}</span>
          </button>

          <div className="text-center">
            <h1 className="mb-4 text-[28px] font-bold leading-[1.12] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[40px] lg:text-[48px]">
              {categoryName}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-[15px] font-medium leading-relaxed text-[var(--ib-mute)] sm:text-[17px]">
              {categoryDescription}
            </p>

            <div className="relative mx-auto max-w-2xl">
              <div className="relative flex h-14 items-center rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] px-5 transition-all duration-300 focus-within:border-[var(--ib-acc)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--ib-acc)_18%,transparent)]">
                <Search className="size-5 text-[var(--ib-mute)]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by year, number, or name..."
                  className="flex-1 border-none bg-transparent px-4 text-[15px] font-medium text-[var(--ib-ink)] outline-none placeholder:text-[var(--ib-mute)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="mx-auto max-w-7xl">
          {!isLoading && !isError && filteredStandards.length > 0 ? (
            <p className="mb-6 text-center text-[12.5px] font-semibold text-[var(--ib-mute)]">
              Sorted by Year → Number → Name · {filteredStandards.length}{" "}
              standard{filteredStandards.length === 1 ? "" : "s"}
            </p>
          ) : null}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="size-10 animate-spin text-[var(--ib-acc)]" />
              <p className="font-medium text-[var(--ib-mute)]">
                Loading standards...
              </p>
            </div>
          ) : isError ? (
            <div className="py-20 text-center">
              <p className="font-medium text-red-500">
                Failed to load standards. Please try again later.
              </p>
            </div>
          ) : filteredStandards.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-[var(--ib-mute)]">
                No standards found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredStandards.map((std: any) => (
                  <ISOStandardCard
                    key={std.id}
                    item={std}
                    onOpenChat={handleOpenChat}
                    category={category}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryStandardsPage;
