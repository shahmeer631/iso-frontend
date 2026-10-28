/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  LayoutGrid,
  ArrowRight,
  Loader2,
  Leaf,
  Cpu,
  Utensils,
  Stethoscope,
  Zap,
  Scale,
  Layers,
  Building2,
  AlertTriangle,
  Activity,
  Gavel,
  Server,
  Smile,
  Microscope,
  GraduationCap,
  Briefcase,
  Calendar,
  Info,
  ClipboardList,
  HardHat,
  Shield,
  TrendingUp,
  Users,
  Landmark,
  Banknote,
} from "lucide-react";
import React, { useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
import "@/lib/i18n/client";

const ease = [0.22, 1, 0.36, 1] as const;

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

  return Info;
};

const ISOStandardCard = ({
  item,
  onOpenChat,
  index,
  reduceMotion,
}: {
  item: any;
  onOpenChat: (id: string) => void;
  index: number;
  reduceMotion: boolean | null;
}) => {
  const Icon = getCategoryIcon(item.slug || "", item.name || "");
  const { t } = useTranslation();

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.4,
        delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.35),
        ease,
      }}
      className="ib-card group relative flex h-full flex-col gap-5 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.35)] sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,color-mix(in_srgb,var(--ib-acc)_12%,transparent),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-2 text-[var(--ib-acc)] opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.16]"
      >
        <Icon size={96} strokeWidth={0.75} />
      </div>

      <div className="relative z-[1] flex flex-col gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)] transition-transform duration-300 group-hover:scale-105">
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="space-y-1.5 text-left">
          <h3 className="mb-0! text-[18px] font-bold leading-snug tracking-[-0.02em] text-[var(--ib-ink)] transition-colors group-hover:text-[var(--ib-acc)] sm:text-[20px]">
            {item.name} {t("library.standardsWord")}
          </h3>
          {item.standardSub ? (
            <p className="text-[13.5px] font-semibold text-[var(--ib-mute)]">
              {item.standardSub}
            </p>
          ) : null}
        </div>
      </div>

      {item.standardDesc ? (
        <p className="relative z-[1] line-clamp-3 text-left text-[14px] leading-relaxed text-[var(--ib-mute)]">
          {item.standardDesc}
        </p>
      ) : null}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenChat(item.id);
        }}
        className="relative z-[1] mt-auto inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[var(--ib-acc)] bg-[var(--ib-acc)] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_10px_24px_-12px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:text-[14.5px]"
      >
        {t("library.viewAllStandards")}
        <ArrowRight size={16} aria-hidden />
      </button>
    </motion.article>
  );
};

interface ISOStandardsNexusProps {
  searchTerm?: string;
}

const ISOStandardsNexus = ({ searchTerm = "" }: ISOStandardsNexusProps) => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const lang = (params?.lang as string) || "en";
  const categoryInUrl = searchParams.get("category");

  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const filteredCategories = useMemo(() => {
    let result = categories;

    if (categoryInUrl && categoryInUrl !== "all") {
      result = result.filter(
        (cat: any) => cat.name.toLowerCase() === categoryInUrl.toLowerCase()
      );
    }

    if (searchTerm) {
      result = result.filter(
        (cat: any) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.standardSub &&
            cat.standardSub.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (cat.standardDesc &&
            cat.standardDesc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return result;
  }, [categories, searchTerm, categoryInUrl]);

  const handleOpenChat = (id: string) => {
    router.push(`/${lang}/library/iso-standards/category/${id}`);
  };

  return (
    <section className="relative overflow-x-clip bg-[var(--ib-bg)] px-4 py-14 sm:px-6 sm:py-20">
      <div className="ib-w relative z-[1] max-w-7xl!">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease }}
          className="mx-auto mb-10 max-w-[680px] text-center md:mb-12"
        >
          <div className="ib-eye inline-flex items-center justify-center gap-2">
            <LayoutGrid className="size-3.5" aria-hidden />
            {t("library.badge")}
          </div>
          <h2 className="mb-0! mt-2 text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[34px] lg:text-[38px]">
            {t("library.head") || "Explore by Management Systems"}
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[var(--ib-acc)]" />
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="size-10 animate-spin text-[var(--ib-acc)]" />
            <p className="font-medium text-[var(--ib-mute)]">
              {t("library.loadingManagementSystems")}
            </p>
            <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="ib-card h-[260px] animate-pulse bg-[color-mix(in_srgb,var(--ib-card)_80%,var(--ib-accbg))]"
                  aria-hidden
                />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="ib-card mx-auto max-w-lg py-16 text-center">
            <p className="font-medium text-red-500">
              {t("library.failedLoadCategories")}
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="ib-card mx-auto max-w-lg px-6 py-16 text-center">
            <LayoutGrid className="mx-auto mb-4 size-10 text-[var(--ib-mute)] opacity-50" />
            <p className="text-lg font-semibold text-[var(--ib-ink)]">
              {searchTerm
                ? `${t("library.noResultsFor")} “${searchTerm}”`
                : t("library.noStandards") || "No standards found."}
            </p>
            {searchTerm ? (
              <p className="mt-2 text-sm text-[var(--ib-mute)]">
                {t("library.tryDifferent")}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((cat: any, index: number) => (
                <ISOStandardCard
                  key={cat.id}
                  item={cat}
                  index={index}
                  reduceMotion={reduceMotion}
                  onOpenChat={handleOpenChat}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default ISOStandardsNexus;
