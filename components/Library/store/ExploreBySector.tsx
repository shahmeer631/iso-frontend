import React from "react";
import {
  Heart,
  Cpu,
  ArrowLeftRight,
  ShieldCheck,
  Plane,
  Zap,
  Users,
  Leaf,
  Apple,
  Hexagon,
  Wrench,
  Building2,
} from "lucide-react";

const sectors = [
  { icon: Heart, label: "Health" },
  { icon: Cpu, label: "IT and related technologies" },
  { icon: ArrowLeftRight, label: "Management and services" },
  { icon: ShieldCheck, label: "Security, safety and risk" },
  { icon: Plane, label: "Transport" },
  { icon: Zap, label: "Energy" },
  { icon: Users, label: "Diversity and inclusion" },
  { icon: Leaf, label: "Environmental sustainability" },
  { icon: Apple, label: "Food and agriculture" },
  { icon: Hexagon, label: "Materials" },
  { icon: Building2, label: "Building and construction" },
  { icon: Wrench, label: "Engineering" },
];

const ExploreBySector = () => {
  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden">
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
        <div className="mb-12">
          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-[#1E293B] mb-4 leading-[1.2] tracking-tight">
            Explore by sector
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {sectors.map((sector, index) => (
            <div
              key={index}
              className="bg-white border border-[#F1F5F9] rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group cursor-pointer aspect-square justify-center"
            >
              <div className="mb-4 text-[#1E293B] group-hover:scale-110 transition-transform duration-300">
                <sector.icon
                  strokeWidth={1.2}
                  size={40}
                  className="md:w-12 md:h-12"
                />
              </div>
              <span className="text-[#334155] font-bold text-[10px] md:text-xs leading-tight">
                {sector.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreBySector;
