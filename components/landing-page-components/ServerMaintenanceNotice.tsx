"use client";

import React from "react";
import { AlertTriangle, Clock, RefreshCw, Server, Sparkles, Wrench } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Temporary Server Maintenance Notice Card
 * ----------------------------------------------------
 * You can easily delete this entire component and its import
 * once the server work is finished.
 */
const ServerMaintenanceNotice = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 my-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1E1B2E] via-[#14141A] to-[#0D0D11] border-2 border-amber-500/40 p-6 md:p-8 shadow-[0_0_50px_-12px_rgba(245,158,11,0.25)]"
      >
        {/* Glow Effects in Background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          
          {/* Animated Server & Gear Icon Badge */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <Server className="w-10 h-10 md:w-12 md:h-12 text-amber-400" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
            <div className="absolute -bottom-2 -right-2 bg-[#0F1015] border border-amber-500/40 rounded-full p-1.5 shadow-md">
              <Wrench className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 space-y-3">
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
              <span>Server Maintenance in Progress</span>
            </div>

            {/* Main Big Heading */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Server Upgrade in Progress — <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Back Online Within 1 Hour!</span>
            </h2>

            {/* Description Paragraph */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-3xl">
              We are currently performing an essential server and payment system upgrade to enhance performance and security. All subscription plans and checkout features will be fully operational within <strong className="text-amber-300 font-semibold">1 hour</strong>.
            </p>

            {/* Time Estimation & Status Footer Box */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Estimated Resolution Time: <strong className="text-white">~1 Hour</strong></span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Update in Progress</span>
              </div>
              <div className="text-xs text-gray-400 italic">
                Thank you for your patience and understanding!
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default ServerMaintenanceNotice;
