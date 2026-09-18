// src/app/_components/SlidingButton.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

interface SlidingButtonOption {
  label: string;
  href: string;
}

interface SlidingButtonProps {
  left: SlidingButtonOption;
  right: SlidingButtonOption;
}

export default function SlidingButton({ left, right }: SlidingButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine selected index based on current pathname
  // We check if the pathname includes the href to handle localized routes or sub-paths
  const selected = pathname.includes(right.href) ? 1 : 0;

  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="mt-8 flex justify-center">
      <div className="relative flex border border-white rounded-xl overflow-hidden w-max bg-white/5 backdrop-blur-sm">
        {/* Sliding background */}
        <div
          className="absolute top-0 left-0 h-full w-1/2 bg-white rounded-lg transition-all duration-300 ease-in-out"
          style={{
            transform: selected === 0 ? "translateX(0%)" : "translateX(100%)",
          }}
        />

        {/* LEFT BUTTON */}
        <button
          onClick={() => handleClick(left.href)}
          className={`relative z-10 py-4 px-6 font-semibold transition-colors duration-300 ${
            selected === 0 ? "text-[#4A61E4]" : "text-white"
          }`}
        >
          {left.label}
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => handleClick(right.href)}
          className={`relative z-10 py-4 px-6 font-semibold transition-colors duration-300 ${
            selected === 1 ? "text-[#4A61E4]" : "text-white"
          }`}
        >
          {right.label}
        </button>
      </div>
    </div>
  );
}
