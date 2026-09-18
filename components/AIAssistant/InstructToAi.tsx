

"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const features = [
  "Standardized Global Benchmarking",
  "AI-Powered Competency Analysis",
  "Verified Professional Certification",
  "Suitable for Lead Auditors, Implementers, and Consultants",
];

export default function InstructToAi() {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      const sections = document.querySelectorAll(".section");
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const element = section as HTMLElement;
        if (
          element.offsetTop <= scrollPosition &&
          element.offsetTop + element.offsetHeight > scrollPosition
        ) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const roles = [
    "Quality Managers",
    "QHSE Managers",
    "Compliance Officers",
    "Internal Auditors",
    "IT Security Managers",
    "Operations Managers",
    "Risk Management Professionals",
    "Documentation Specialists",
  ];

  return (
    <div className="select-none">
      <div className="my-20">
        <div className="bg-[#fff] container mx-auto">
          <h1
            className="text-center text-[#083a5e] text-[20px] md:text-[40px] lg:text-[50px] leading-tight font-bold"
            data-aos="fade-up"
          >
            Explore the ISOBrain
          </h1>
          <h1
            className="text-center text-[#083a5e] text-[20px] md:text-[40px] lg:text-[50px] mb-6 leading-tight font-bold"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            AI Product Suite
          </h1>

          <p
            className="text-base my-8 text-center text-[#083a5e] max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Three purpose-built AI modules that cover every phase of your ISO Management System lifecycle—from implementation to audit to evidence evaluation.
          </p>
          {/* Hero Section - AI Assistant */}
          <motion.section
            className="section relative py-20 flex items-center justify-center rounded-2xl overflow-hidden bg-[#F5F3FF] mb-15"
            data-aos="fade-up"
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
                <div
                  className="w-full lg:w-1/2 relative animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="relative flex justify-center lg:justify-start rounded-2xl">
                    <Image
                      src="/ai-assistant.png"
                      alt="landing image"
                      width={660}
                      height={612}
                    />
                  </div>
                </div>

                <div
                  className="w-full lg:w-1/2 space-y-3 animate-fade-in-up text-left"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex justify-center lg:justify-end">
                    <div>
                      <h3 className="font-bold text-6xl text-left text-[#E0E7FF] mb-6">
                        <Image
                          src="/one.png"
                          alt="Iso Image"
                          width={107}
                          height={110}
                        />
                      </h3>
                      <h1 className="text-3xl md:text-4xl lg:text-[50px] text-transparent bg-clip-text bg-[#0B1220] leading-tight font-semibold">{t('aiAssistantHome.isoNavigator')}</h1>

                      <p className="text-sm text-left lg:text-base text-slate-600 font-medium leading-relaxed my-4">
                        Welcome to ISO Navigator, the premier Generative AI tool developed by ISOBrain.ai. Whether you are starting from scratch with an initial Gap Analysis or actively preparing for a Certification Audit, ISO Navigator is your dedicated virtual consultant. Our AI is specifically trained to help you establish, implement, and effortlessly maintain your ISO Management Systems (IMS) by generating the exact documentation, strategies, and training materials you need.
                      </p>

                      <Link href="/ai-assistant/iso-navigator">
                        <button className="flex sm:w-auto px-7 py-2 rounded-fullbg-[#00f0ff] text-[#0F111A]  text-white font-normal text-sm sm:text-base  cursor-pointer">
                          Explore ISO Navigator
                          <ArrowRight
                            strokeWidth={1}
                            className="mt-0 lg:mt-0 ml-2"
                          />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Academy Section */}
          <motion.section
            className="section relative mx-auto py-24 bg-[#FFF1F2] overflow-hidden rounded-2xl mb-15"
            data-aos="fade-up"
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col lg:flex-row-reverse justify-evenly gap-12 items-center">
                <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-6 animate-fade-in-right text-left">
                  <div className="flex justify-center lg:justify-end">
                    <div>
                      <h3 className="font-bold text-6xl text-left text-[#E0E7FF] mb-6">
                        <Image
                          src="/two.png"
                          alt="Iso Image"
                          width={107}
                          height={110}
                        />
                      </h3>

                      <h1 className="text-3xl md:text-4xl lg:text-[50px] text-transparent bg-clip-text bg-[#0B1220] leading-tight font-semibold">{t('auditLens.headingHighlight')}</h1>

                      <p className="text-sm my-4 text-left lg:text-base text-slate-600 font-medium leading-relaxed">
                        Audit Lens is an intelligent audit management tool developed by ISOBrain.ai. Designed for auditors and compliance teams, it uses Generative AI to automatically create comprehensive audit materials—from initial planning and scheduling to final reporting and follow-up—across all ISO management system standards.
                      </p>

                      <Link href="/ai-assistant/audit-lens">
                        <button className="flex sm:w-auto px-7 py-2 rounded-fullbg-[#00f0ff] text-[#0F111A]  text-white font-normal text-sm sm:text-base  cursor-pointer">
                          Explore Audit Lens
                          <ArrowRight
                            strokeWidth={1}
                            className="mt-0 lg:mt-0 ml-2"
                          />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 order-2 lg:order-1 animate-fade-in-left">
                  <div className="flex justify-center lg:justify-start rounded-2xl overflow-hidden">
                    <Image
                      src="/academy.png"
                      alt="landing image"
                      width={660}
                      height={612}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Mastery Lab Section */}
          <motion.section
            className="section relative py-20 flex items-center justify-center rounded-2xl overflow-hidden bg-[#F5F3FF] mb-15"
            data-aos="fade-up"
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
                <div
                  className="w-full lg:w-1/2 relative animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="relative">
                    <div className="flex justify-center lg:justify-start">
                      <Image
                        src="/mastery-lab.png"
                        alt="landing image"
                        width={660}
                        height={612}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="w-full lg:w-1/2 space-y-3 animate-fade-in-up text-left"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex justify-center lg:justify-end">
                    <div>
                      <h3 className="font-bold flex justify-center lg:justify-start mx-auto text-[#E0E7FF] mb-6">
                        <Image
                          src="/three.png"
                          alt="Iso Image"
                          width={107}
                          height={110}
                        />
                      </h3>

                      <div className="relative z-10 mx-auto">
                        <div className="mx-auto">
                          <h1 className="text-3xl md:text-4xl lg:text-[50px] text-left text-transparent bg-clip-text bg-[#0B1220] leading-tight font-semibold">{t('benchmarkAi.headingHighlight')}</h1>

                          <p className="text-sm my-4 text-left lg:text-base text-slate-600 font-medium leading-relaxed">
                            Benchmark AI is an intelligent document review tool developed by ISOBrain.ai. It uses advanced Generative AI and OCR (Optical Character Recognition) technology to instantly analyze, score, and improve your existing ISO compliance documents. By simply uploading a file and stating your goals, the AI compares your documentation against strict ISO standard requirements to identify gaps and provide actionable recommendations.
                          </p>

                          <Link href="/ai-assistant/benchmark-ai">
                            <button className="flex sm:w-auto px-7 py-2 rounded-fullbg-[#00f0ff] text-[#0F111A]  text-white font-normal text-sm sm:text-base  cursor-pointer">
                              Explore Benchmark AI
                              <ArrowRight
                                strokeWidth={1}
                                className="mt-0 lg:mt-0 ml-2"
                              />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
}
