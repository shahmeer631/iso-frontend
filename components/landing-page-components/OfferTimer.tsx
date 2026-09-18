
"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { useParams } from "next/navigation";

const OfferTimer = () => {
  const params = useParams();
  const lang = params?.lang || 'en';
  const { t } = useTranslation();

  // Sync i18n language with the URL [lang] param
  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  const TOTAL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  useEffect(() => {
    setMounted(true);

    // Retrieve the target time from localStorage or create a new one (24 hours from now)
    const storedEndTime = localStorage.getItem("offerEndTime");
    let endTime: number;

    if (storedEndTime && !isNaN(Number(storedEndTime))) {
      endTime = Number(storedEndTime);
      if (endTime <= Date.now()) {
        // If expired while away, reset to 24 hours from now
        endTime = Date.now() + TOTAL_MS;
        localStorage.setItem("offerEndTime", endTime.toString());
      }
    } else {
      endTime = Date.now() + TOTAL_MS;
      localStorage.setItem("offerEndTime", endTime.toString());
    }

    const interval = setInterval(() => {
      const now = Date.now();
      let distance = endTime - now;

      if (distance <= 0) {
        // Timer reached zero! Auto-restart for another 24 hours
        endTime = Date.now() + TOTAL_MS;
        localStorage.setItem("offerEndTime", endTime.toString());
        distance = TOTAL_MS;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      // Calculate progress percentage (0 to 100)
      const currentProgress = ((TOTAL_MS - distance) / TOTAL_MS) * 100;
      setProgress(currentProgress);

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-16 px-4 relative group cursor-default">

      <div className="text-center mb-6 max-w-3xl mx-auto px-4">
        <h3 className="text-2xl md:text-3xl font-bold text-[#fff] mb-3">
          {t('pricingPage.offerHeading')}
        </h3>
        <p className="text-base md:text-lg text-[#fff] font-medium">
          {t('pricingPage.offerSub')}
        </p>
      </div>

      <div className="text-center hidden text-[#fff] text-xl bg-red-100 rounded-full font-medium p-4">
        <h1 className="text-red-400">Server under maintenance! <span className="text-[#00F0FF]">⏳</span></h1>
        <h5 className="text-black">Please wait for some time... </h5>
      </div>

      {/* Animated glowing background */}


      <div className="relative bg-[#0A0A0C]/90 backdrop-blur-2xl border border-white/10 group-hover:border-[#00F0FF]/40 rounded-3xl py-6 px-12 lg:py-8 lg:px-20 flex flex-col md:flex-row items-center justify-center gap-8 shadow-2xl transition-all duration-500 overflow-hidden mx-auto w-fit">

        {/* Subtle top glare */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/80 to-transparent blur-[2px]"></div>

        {/* Text Section */}

        {/* Timer Section */}
        <div className="flex items-center gap-3 lg:gap-5 shrink-0 z-10">
          {[
            { label: t('pricingPage.hours'), value: timeLeft.hours },
            { label: t('pricingPage.mins'), value: timeLeft.minutes },
            { label: t('pricingPage.secs'), value: timeLeft.seconds, isAccent: true }
          ].map((time, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center group/item">
                <div className={`relative w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center text-3xl lg:text-4xl font-bold rounded-2xl shadow-inner transition-transform duration-300 group-hover/item:-translate-y-1 ${time.isAccent
                  ? "bg-gradient-to-b from-[#00F0FF]/10 to-transparent border border-[#00F0FF]/40 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                  : "bg-[#14141A] border border-gray-800 text-white"
                  }`}>
                  {/* Subtle inner highlight */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                  {time.value.toString().padStart(2, "0")}
                </div>
                <span className={`text-[10px] lg:text-xs mt-3 uppercase tracking-widest font-semibold ${time.isAccent ? "text-[#00F0FF]" : "text-gray-500"}`}>
                  {time.label}
                </span>
              </div>
              {index < 2 && (
                <span className="text-2xl lg:text-3xl text-gray-700 font-bold -mt-8 animate-pulse">:</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress Bar overlay at the bottom */}
        {/* <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#14141A]">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-[#00F0FF] to-fuchsia-500 relative transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[4px] opacity-60"></div>
          </div>
        </div> */}

      </div>
    </div>
  );
};

export default OfferTimer;