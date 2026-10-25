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
  backgroundClassName = "bg-[var(--ib-dk)]",
  className = "",
}) => {
  return (
    <section
      className={`w-full py-24 text-center text-[var(--ib-dktx)] ${backgroundClassName} ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-xl md:text-5xl lg:text-6xl font-bold text-[var(--ib-dktx)] tracking-tight mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-base md:text-lg text-[#9FB0D6] mb-10 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        {showButton && buttonLink && buttonText && (
          <Link
            href={buttonLink}
            className="inline-block px-[22px] py-3 rounded-[10px] border border-white bg-white text-[#0B1530] hover:opacity-92 transition duration-300 font-semibold text-[14.5px]"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
};

export default DynamicHeroSectionWhiteButton;
