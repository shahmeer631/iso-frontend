"use client";

import {
  LayoutGrid, ArrowRight, Loader2,
  ShieldCheck, Leaf, Lock, Cpu, Utensils, Stethoscope, Zap, Scale, Layers,
  Building2, Beaker, AlertTriangle, Activity, Gavel, Server, Smile,
  Microscope, GraduationCap, Briefcase, Calendar, Info,
  ClipboardList, HardHat, Shield, TrendingUp, Users, Landmark, Banknote
} from "lucide-react";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
import "@/lib/i18n/client";

// ── Icon Mapping Helper ──────────────────────────────────────────────────
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

const AcademyCategoryCard = ({
  item,
  onNavigate,
}: {
  item: any;
  onNavigate: (slug: string) => void;
}) => {
  const { t } = useTranslation();
  const Icon = getCategoryIcon(item.slug || "", item.name || "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: "0 0 40px rgba(0, 240, 255, 0.1)" }}
      transition={{ duration: 0.3 }}
      className="group relative bg-[#18181B]/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col gap-6 overflow-hidden"
    >
      <div className="absolute top-4 right-4 text-brand-cyan opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
        <Icon size={80} strokeWidth={0.5} className="blur-[1px] opacity-10 group-hover:opacity-30" />
      </div>
      <div className="absolute -inset-px bg-gradient-to-r from-[#6366F1] to-[#00f0ff] rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      <div className="flex flex-col gap-4 relative z-10">
        <div className="p-3 bg-[#00f0ff]/10 rounded-xl w-fit">
          <Icon className="w-8 h-8 text-[#00f0ff]" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[#0F111A]/10 border border-brand-cyan/20 w-fit">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#00f0ff]" />
          <span className="text-[#00f0ff]   text-[10px] font-bold tracking-[0.1em] uppercase">
            {t('academy.cpdCertified', 'CPD Certified')}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white leading-tight font-space-grotesk group-hover:text-[#FFFFFF] transition-colors">
          {item.name} {" "} {t('academy.courses', 'Courses')}
        </h3>
      </div>
      <p className="text-[#A1A1AA] text-sm leading-relaxed line-clamp-3 relative z-10">
        {item.courseDesc || ""}
      </p>
      <button
        onClick={() => onNavigate(item.slug)}
        className="mt-auto w-full flex justify-center  items-center gap-2 bg-[#00f0ff] text-[#0F111A]  px-6 py-3 rounded-[8px] font-inter font-semibold text-[15px]   transition-all duration-300 relative z-10 cursor-pointer"
      >
        {t('academy.enrollInCourse', 'Enroll in Course')} <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};

interface AcademyCategoriesNexusProps {
  searchTerm?: string;
}

const AcademyCategoriesNexus = ({ searchTerm = "" }: AcademyCategoriesNexusProps) => {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const lang = (params?.lang as string) || "en";

  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const filteredCategories = useMemo(() => {
    return categories.filter((cat: any) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.standardSub && cat.standardSub.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cat.courseDesc && cat.courseDesc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cat.standardDesc && cat.standardDesc.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [categories, searchTerm]);

  const handleNavigate = (slug: string) => {
    router.push(`/${lang}/academy/category/${slug}`);
  };

  return (
    <section className="bg-[#0B0F19] py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-white mb-6 leading-[1.2] tracking-tight">
            {t('academy.exploreCategories', 'Explore Certification Categories')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#00f0ff]  mx-auto rounded-full" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
            <p className="text-[#A1A1AA] font-medium">{t('academy.loadingCategories', 'Loading certification categories...')}</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-red-400 font-medium">{t('academy.failedToLoadCategories', 'Failed to load categories. Please try again later.')}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#A1A1AA] text-lg font-medium">{t('academy.noResultsFound', 'No results found for')} "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((cat: any) => (
                <AcademyCategoryCard
                  key={cat.id}
                  item={cat}
                  onNavigate={handleNavigate}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default AcademyCategoriesNexus;
