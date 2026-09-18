import React from "react";
import {
  Shield,
  Leaf,
  ArrowRight,
  Award,
  Utensils,
  Zap,
  Activity,
  Building2,
  Brain,
} from "lucide-react";
import Link from "next/link";

const LibrarySection = () => {
  const categories = [
    {
      icon: Award,
      title: "Quality Management",
      subtitle:
        "Access practical resources, compliance tools, and implementation guidance aligned with ISO requirements.",
      color: "#2A85C8",
    },
    {
      icon: Leaf,
      title: "Environmental",
      subtitle:
        "Access structured guidance to manage environmental risks, compliance, and impact reduction.",
      color: "#10B981",
    },
    {
      icon: Shield,
      title: "Information Security",
      subtitle:
        "Align your organization with internationally recognized security standards and best practices.",
      color: "#F59E0B",
    },
    {
      icon: Utensils,
      title: "Food Safety",
      subtitle:
        "Ensure safe food production and handling through internationally recognized compliance frameworks.",
      color: "#EC4899",
    },
    {
      icon: Zap,
      title: "Energy Management",
      subtitle:
        "Identify energy-saving opportunities through structured monitoring and control.",
      color: "#8B5CF6",
    },
    {
      icon: Activity,
      title: "Health & Safety",
      subtitle:
        "Create a safer workplace through proactive risk management and compliance systems.",
      color: "#04D3C2",
    },
    {
      icon: Building2,
      title: "Healthcare",
      subtitle:
        "Enhance service quality and patient safety through structured management frameworks.",
      color: "#FE3F05",
    },
    {
      icon: Brain,
      title: "IT Service Management",
      subtitle:
        "Align IT operations with globally recognized best practices. Ensure consistent, measurable, and scalable service delivery.",
      color: "#00F0FF",
    },
  ];

  return (
    <section className="section relative py-[80px] bg-[#111827]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-white mb-6 leading-[1.2] tracking-tight">
            ISO Platform
          </h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            The ISO Platform is the core engine of ISOBrain, shifting the traditional document-browsing experience into a highly focused, interactive workspace. Designed specifically for auditors, compliance officers, and quality managers, it combines the full text of global ISO standards with an advanced AI assistant that is strictly contextualized to the specific standard you are working on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative flex flex-col justify-center items-center bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <category.icon
                  className="w-6 h-6"
                  style={{ color: category.color }}
                />
              </div>

              <h3 className="text-white text-center font-bold text-2xl mb-1">
                {category.title}
              </h3>
              <p className="text-slate-400 text-sm text-center">
                {category.subtitle}
              </p>
              <Link href="/library" className="flex justify-center">
                <button className="flex sm:w-autorounded-full  text-white font-normal text-sm   cursor-pointerfont-thin mt-3 cursor-pointer">
                  Get Started Free
                  <ArrowRight
                    strokeWidth={1}
                    className="w-6 mt-0 lg:mt-0 ml-2"
                  />
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center" data-aos="fade-up" data-aos-delay="200">
          <Link href={"/library"}>
            <button className="flex mx-auto  px-7 py-2 rounded-fullbg-[#00f0ff] text-[#0F111A]  text-white font-semibold text-sm sm:text-base  cursor-pointer ">
              View Full Library
              <ArrowRight strokeWidth={1} className="mt-0 lg:mt-0.5 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LibrarySection;
