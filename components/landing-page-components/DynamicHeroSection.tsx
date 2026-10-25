import Link from "next/link";
import React from "react";

interface DynamicHeroSectionProps {
  title: string;
  subtitle: string;
  nextSubtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundClassName?: string;
  className?: string;
}

const DynamicHeroSectionProps: React.FC<DynamicHeroSectionProps> = ({
  title,
  subtitle,
  nextSubtitle,
  buttonText,
  buttonLink,
  backgroundClassName = "bg-[#111827]",
  className = "",
}) => {
  return (
    <section
      className={`w-full py-24 text-center text-[var(--ib-ink)] ${backgroundClassName} ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl md:text-5xl font-semibold mb-6">
          {title}
        </h1>
        <div className="mb-8 space-y-2">
          <p className="text-lg md:text-xl text-[var(--ib-mute)]">
            {subtitle}
          </p>
          {nextSubtitle && (
            <p className="text-lg md:text-xl text-[var(--ib-mute)]">
              {nextSubtitle}
            </p>
          )}
        </div>
        {buttonText && buttonLink && (
          <Link
            href={buttonLink}
            className="inline-block bg-[var(--ib-acc)] text-[var(--ib-bg)] hover:bg-blue-700 text-white text-xl font-semibold py-5 px-10 rounded-full transition duration-300"
          >
            {buttonText}
          </Link>
        )}

      </div>
    </section>
  );
};

export default DynamicHeroSectionProps;
