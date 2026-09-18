"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const GetInTouchWithForm: FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-[#111827] py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('contact.heading')}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default GetInTouchWithForm;