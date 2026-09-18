"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Publication {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  link: string;
}

export const topPublications: Publication[] = [
  {
    title: "ISO 31000:2018 Risk management — A practical guide",
    category: "Publications",
    description:
      "Manage risks effectively to protect your organization's future. ISO 31000 provides a globally recognized framework to identify, assess, and mitigate risks. This handbook helps you implement the standard with confidence.",
    imageUrl: "/top-publications-1.png", // Mountain cover
    link: "#",
  },
  {
    title: "ISO 37001:2025 Anti-bribery management systems — A practical guide",
    category: "Publications",
    description:
      "Empower your organization to fight bribery effectively. Bribery undermines trust, distorts markets, and damages reputations. ISO 37001 provides a globally recognized framework to prevent, detect, and respond to bribery.",
    imageUrl: "/top-publications-2.png", // Brown cover
    link: "#",
  },
  {
    title: "ISO 13485:2016 Medical devices — A practical guide",
    category: "Publications",
    description:
      "Ensure quality and compliance in medical device manufacturing. ISO 13485 provides a framework for organizations involved in the life cycle of a medical device, from design and development to production and installation.",
    imageUrl: "/top-publications-3.png",
    link: "#",
  },
];

const Toppublications = () => {
  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden">
      {/* Responsive Background Layer */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat w-full h-full"
        style={{
          backgroundImage: "url('/Vector-bg.png')",
          backgroundSize: "100% 100%",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-[#1E293B] mb-4 leading-[1.2] tracking-tight">
            Top publications
          </h2>
        </div>

        {/* List of Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          {topPublications.map((pub, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group flex flex-row items-start gap-6 cursor-pointer"
            >
              {/* Image Container with Tilt */}
              <div className="relative shrink-0 w-32 md:w-40 lg:w-30">
                <motion.div
                  whileHover={{ rotate: -5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative aspect-[3/4] overflow-hidden transform -rotate-3"
                >
                  <Image
                    src={pub.imageUrl}
                    alt={pub.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>

              {/* Content Container */}
              <div className="flex flex-col pt-2">
                <span className="text-[#64748B] text-sm font-medium mb-2">
                  {pub.category}
                </span>
                <h3 className="text-[#EF4444] text-md font-bold mb-3 leading-tight group-hover:underline transition-all">
                  {pub.title}
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed line-clamp-6">
                  {pub.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Toppublications;
