import Link from "next/link";
import React from "react";

interface DynamicHeroSectionProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundClassName?: string;
  className?: string;
  showButton?: boolean;
}

const DynamicHeroSectionWhiteButton: React.FC<DynamicHeroSectionProps> = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  showButton = true,
  // backgroundClassName = "bg-gradient-to-r from-slate-900 to-slate-800",
  backgroundClassName = "bg-[#111827]",
  className = "",
}) => {
  return (
    <section
      className={`w-full py-24 text-center text-white ${backgroundClassName} ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-base md:text-lg text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        {showButton && buttonLink && buttonText && (
          <Link
            href={buttonLink}
            className="inline-block px-8 py-3 rounded-full border border-indigo-500 border-3 bg-white text-black hover:text-white  hover:bg-indigo-700 transition duration-300 font-semibold"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
};

export default DynamicHeroSectionWhiteButton;
