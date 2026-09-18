"use client";

import { useGetISOStandardsQuery } from "@/lib/redux/api/isoStandardsApi";
import React from "react";

const TopStandards = () => {
  const { data, isLoading, isError } = useGetISOStandardsQuery();

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gray-50/40 min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </section>
    );
  }

  if (isError || !data?.data) {
    return (
      <section className="py-16 md:py-24 bg-gray-50/40 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load standards.</p>
        </div>
      </section>
    );
  }

  const standards = data.data;

  return (
    <section className="py-16 md:py-24 bg-gray-50/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-[#1E293B] mb-2 leading-[1.2] tracking-tight">
            Top Standards
          </h2>
          <p className="text-[#64748B] text-base">
            Most viewed and highly rated standards
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standards.map((std) => (
            <div
              key={std.id}
              className="bg-white border border-[#e7ebefdd] rounded-lg p-5 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-[180px]"
            >
              <div>
                <span className="text-[#4A61E4] font-bold text-sm uppercase tracking-wide">
                  {std.isoCode}
                </span>
                <h3 className="text-[#1E293B] font-bold text-lg mt-4 leading-snug line-clamp-2">
                  {std.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[#F8FAFC]">
                <span className="text-[#94A3B8] text-xs font-medium">
                  {std.version ? `Published in ${std.version}` : "Recently Published"}
                </span>
                <span className="text-[#334155] text-xs font-bold">
                  {/* Price mapping - setting a placeholder if not in data */}
                  CHF 179
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopStandards;
