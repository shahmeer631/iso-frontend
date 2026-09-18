"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const starterPackages = [
  {
    title: "Information security – the basics",
    category: "Publications",
    description:
      "Strengthen your organization's information security with our ISO standards bundle, designed for cybersecurity and privacy protection. This bundle includes 2 products: ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection — Information security management systems ... ISO/IEC 27001:2022 - ...",
    image: "/starter-packege-1.png",
    link: "#",
  },
  {
    title: "Information security – the basics",
    category: "Publications",
    description:
      "Strengthen your organization's information security with our ISO standards bundle, designed for cybersecurity and privacy protection. This bundle includes 2 products: ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection — Information security management systems ... ISO/IEC 27001:2022 - ...",
    image: "/starter-packege-1.png",
    link: "#",
  },
  {
    title: "Information security – the basics",
    category: "Publications",
    description:
      "Strengthen your organization's information security with our ISO standards bundle, designed for cybersecurity and privacy protection. This bundle includes 2 products: ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection — Information security management systems ... ISO/IEC 27001:2022 - ...",
    image: "/starter-packege-1.png",
    link: "#",
  },
  {
    title: "Information security – the basics",
    category: "Publications",
    description:
      "Strengthen your organization's information security with our ISO standards bundle, designed for cybersecurity and privacy protection. This bundle includes 2 products: ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection — Information security management systems ... ISO/IEC 27001:2022 - ...",
    image: "/starter-packege-2.png",
    link: "#",
  },
  {
    title: "Information security – the basics",
    category: "Publications",
    description:
      "Strengthen your organization's information security with our ISO standards bundle, designed for cybersecurity and privacy protection. This bundle includes 2 products: ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection — Information security management systems ... ISO/IEC 27001:2022 - ...",
    image: "/starter-packege-2.png",
    link: "#",
  },
  {
    title: "Information security – the basics",
    category: "Publications",
    description:
      "Strengthen your organization's information security with our ISO standards bundle, designed for cybersecurity and privacy protection. This bundle includes 2 products: ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection — Information security management systems ... ISO/IEC 27001:2022 - ...",
    image: "/starter-packege-2.png",
    link: "#",
  },
];

const StarterPackage = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-[#1E293B] mb-2 leading-[1.2] tracking-tight">
              Starter packages
            </h2>
            <p className="text-[#64748B] text-lg">
              Get started with essential standards for your business
            </p>
          </div>
          <Link
            href="/library/store/starter-packages"
            className="text-[#1E293B] font-semibold hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            See More
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {starterPackages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className="bg-white rounded-xl p-5 border border-[#d3d6daba] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgba(31,38,135,0.08)] transition-all duration-300 flex flex-col h-full cursor-pointer"
            >
              {/* Image Stack Placeholder - Using the identified images */}
              <div className="relative h-auto w-full mb-4  flex justify-start items-center">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  width={112}
                  height={50}
                  className="object-contain"
                />
              </div>

              <h3 className="text-brand-cyan text-xl font-bold mb-2 leading-tight">
                {pkg.title}
              </h3>

              <div className="mb-3">
                <span className="text-[#1E293B] font-extrabold text-sm tracking-wide">
                  {pkg.category}
                </span>
              </div>

              <p className="text-[#64748B] text-sm leading-relaxed mb-8 flex-grow">
                {pkg.description}
              </p>

              <Link
                href={pkg.link}
                className="text-brand-cyan font-bold flex items-center gap-0 group hover:gap-1 transition-all"
              >
                Explore Standards
                <ArrowRight size={18} className="transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StarterPackage;
