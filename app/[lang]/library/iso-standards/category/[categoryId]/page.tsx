"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, ArrowRight, Loader2, Info, Search,
  ShieldCheck, Leaf, Lock, Cpu, Utensils, Stethoscope, Zap, Scale, Layers,
  Building2, Beaker, AlertTriangle, Activity, Gavel, Server, Smile,
  Microscope, GraduationCap, Briefcase, Calendar,
  ClipboardList, HardHat, Shield, TrendingUp, Users, Landmark, Banknote
} from "lucide-react";
import { useGetISOStandardsQuery, useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
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
  const Icon = getCategoryIcon(item.category?.slug || category?.slug || "", item.category?.name || category?.name || "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: "0 0 40px rgba(0, 240, 255, 0.1)" }}
      transition={{ duration: 0.3 }}
      className="group relative bg-[#18181B]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden"
    >
      <div className="absolute top-4 right-4 text-brand-cyan opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
        <Icon size={80} strokeWidth={0.5} className="blur-[1px] opacity-10 group-hover:opacity-30" />
      </div>
      <div className="absolute -inset-px bg-gradient-to-r from-[#6366F1] to-[#00f0ff] rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      <div className="flex flex-col gap-4 relative z-10">
        <div className="p-3 bg-[#00f0ff]/10 rounded-xl w-fit ">
          <Icon className="w-8 h-8 text-[#00f0ff]" />
        </div>
        <div className="flex flex-col gap-2 text-left">
          <h3 className="text-[16px] font-bold text-white leading-snug font-space-grotesk group-hover:text-[#FFFFFF] transition-colors line-clamp-3">
            {item.title}
          </h3>
        </div>
      </div>
      <p className="text-[#A1A1AA] text-sm leading-relaxed line-clamp-3 relative z-10">
        {item.category?.standardDesc || item.category?.name || ""}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenChat(item.id);
        }}
        className="mt-auto w-full flex items-center justify-center gap-2 bg-[#00f0ff] text-[#0F111A]  px-6 py-3 rounded-[4px] font-inter font-semibold text-[15px] hover:bg-brand-cyan hover:text-[#0F111A]/90  transition-all duration-300 relative z-10 cursor-pointer"
      >
        View Details <ArrowRight size={16} />
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
  const { data: standardsData, isLoading, isError } = useGetISOStandardsQuery({ categoryId });

  const category = useMemo(() => {
    return categoriesData?.data?.find(c => c.id === categoryId);
  }, [categoriesData, categoryId]);

  const categoryName = category ? category.name : "Category Standards";
  const categoryDescription = category?.description || `Browse and explore detailed ISO standards within the ${categoryName} management system.`;

  const filteredStandards = useMemo(() => {
    const standards = standardsData?.data || [];
    if (!searchTerm) return standards;
    return standards.filter((s: any) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.isoCode && s.isoCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [standardsData, searchTerm]);

  const handleOpenChat = (id: string) => {
    router.push(`/${lang}/library/iso-standards/chat/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-inter selection:bg-brand-cyan text-[#0F111A]/30">
      {/* ── Header Section ─────────────────────────── */}
      <section className="relative pt-32 pb-10 px-6 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
          <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-[#6366F1]/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute top-[10%] right-1/4 w-[500px] h-[500px]bg-[#00f0ff] text-[#0F111A]/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="group mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t('common.back', 'Back')}</span>
          </button>

          <div className="text-center">
            <h1 className="space-grotesk text-lg lg:text-[48px] font-semibold text-white leading-[1.1] tracking-tight mb-8">
              {categoryName}
            </h1>
            <p className="text-[#A1A1AA] text-sm md:text-lg leading-relaxed  mx-auto mb-12">
              {categoryDescription}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1] to-[#00f0ff] rounded-2xl blur opacity-20  transition duration-500" />
              <div className="relative flex items-center bg-[#18181B] border border-white/10 rounded-2xl px-6 h-16 transition-all duration-300">
                <Search className="w-5 h-5 text-[#A1A1AA]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search standards in this category..."
                  className="flex-1 bg-transparent border-none outline-none px-4 text-lg text-white placeholder:text-[#475569]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Standards Grid ─────────────────────────── */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
              <p className="text-[#A1A1AA] font-medium">Loading standards...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-red-400 font-medium">Failed to load standards. Please try again later.</p>
            </div>
          ) : filteredStandards.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#A1A1AA] text-lg font-medium">No standards found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
