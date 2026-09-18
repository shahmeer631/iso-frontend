"use client";

import { useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Car,
  Coffee,
  FlaskConical,
  Globe,
  Heart,
  Leaf,
  Lock,
  Monitor,
  Recycle,
  Shield,
  Stethoscope,
  Tag,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const categoryIconConfig: Record<
  string,
  { icon: React.ElementType; iconColor: string; bgColor: string; description: string }
> = {
  "Quality Management": {
    icon: Shield,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    description: "Ensure quality management systems that meet customer and regulatory requirements.",
  },
  "Information Security": {
    icon: Lock,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    description: "Protect your information assets with international security standards.",
  },
  "Environmental": {
    icon: Leaf,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Manage environmental responsibilities systematically and sustainably.",
  },
  "Health & Safety": {
    icon: Activity,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Create safe and healthy workplaces for employees and visitors.",
  },
  "Food Safety Management": {
    icon: Coffee,
    iconColor: "text-pink-600",
    bgColor: "bg-pink-50",
    description: "Ensure food safety management across the entire food chain.",
  },
  "Energy Management": {
    icon: Zap,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Optimize energy use and reduce costs while improving sustainability.",
  },
  "Healthcare": {
    icon: Stethoscope,
    iconColor: "text-teal-600",
    bgColor: "bg-teal-50",
    description: "Quality management systems for medical devices and healthcare products.",
  },
  "IT Service Management": {
    icon: Monitor,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
    description: "Deliver IT services that meet customer and business requirements.",
  },
  "IT & Security": {
    icon: Lock,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Introducing new line wireless earbuds designed with the active person.",
  },
  "Risk Management": {
    icon: Tag,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "You tired of overspending on products that don't live up to their promises?",
  },
  "Occupational Health & Safety": {
    icon: Heart,
    iconColor: "text-pink-600",
    bgColor: "bg-pink-50",
    description: "Our toys are made the highest quality materials and designed to provide.",
  },
  "Automotive Quality": {
    icon: Car,
    iconColor: "text-slate-600",
    bgColor: "bg-slate-50",
    description: "Protect your information assets with international security standards.",
  },
  "Laboratory Management": {
    icon: FlaskConical,
    iconColor: "text-teal-600",
    bgColor: "bg-teal-50",
    description: "Ensure that meet customer and regulatory requirements.",
  },
  "Sustainability": {
    icon: Recycle,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    description: "Social media content should also visually appealing, using images and videos.",
  },
  "Socail Responsibility": {
    icon: Globe,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    description: "Introducing new line wireless earbuds designed with the active person.",
  },
  "Social Responsibility": {
    icon: Globe,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    description: "Introducing new line wireless earbuds designed with the active person.",
  },
};

const defaultIconConfig = {
  icon: Tag,
  iconColor: "text-indigo-600",
  bgColor: "bg-indigo-50",
  description: "Explore our comprehensive range of courses and standards in this category.",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const LibraryUseCases = () => {
  const { data, isLoading, isError } = useGetCategoriesQuery();

  if (isLoading) {
    return (
      <section className="pt-24 bg-white overflow-hidden min-h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </section>
    );
  }

  if (isError || !data?.data) {
    return (
      <section className="pt-24 bg-white overflow-hidden min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Failed to load categories.</p>
        </div>
      </section>
    );
  }

  const categories = data.data;

  return (
    <section className="pt-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <span className="text-indigo-600 text-sm font-bold uppercase tracking-wider">
            OpenUp Use Cases
          </span>
          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-[#0B1220] max-w-3xl mx-auto leading-[1.2] tracking-tight">
            Generate AI Copy writing
            <br />
            Favorite Tools
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((category) => {
            const config = categoryIconConfig[category.name] || defaultIconConfig;
            const Icon = config.icon;

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-10 flex flex-col items-center text-center group hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-8 transition-transform duration-300",
                    config.bgColor,
                  )}
                >
                  <Icon className={cn("w-6 h-6", config.iconColor)} />
                </motion.div>

                <h3 className="text-2xl font-bold text-[#0B1220] mb-4">
                  {category.name}
                </h3>

                <p className="text-[#64748B] text-base leading-relaxed mb-8 grow">
                  {config.description}
                </p>

                <Link
                  href={`/library/iso-standards?category=${category.slug}`}
                  className="text-[#64748B] text-base font-semibold flex items-center gap-2 group-hover:text-indigo-600 transition-colors"
                >
                  Explore Courses{" "}
                  <span className="text-lg">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default LibraryUseCases;
