"use client";

import { ArrowBigRight, ArrowRight } from "lucide-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const ContactSection: FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-gray-50 py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* LEFT: Send us a message form */}
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200 lg:p-10">
            <h2 className="text-3xl font-bold text-gray-900">
              {t('contact.sendMessage')}
            </h2>

            <form className="mt-8 space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >{t('auth.fullName')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  placeholder={t('dynamic.dyn_johnDoe_42')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >{t('auth.emailAddress')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder={t('dynamic.dyn_youexamplecom_43')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  required
                />
              </div>

              {/* Company (Optional) */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('contact.companyOptional')}
                </label>
                <input
                  type="text"
                  id="company"
                  placeholder={t('dynamic.dyn_yourCompany_44')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('contact.message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder={t('contact.messagePlaceholder')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-fullbg-[#00f0ff] text-[#0F111A] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('contact.sendButton')}
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* RIGHT: Contact Information + Business Hours */}
          <div className="flex flex-col gap-8">
            {/* Contact Info Card */}
            <div className="rounded-2xlbg-[#00f0ff] text-[#0F111A] p-8 text-white shadow-xl lg:p-10">
              <h3 className="text-2xl font-bold">{t('contact.contactInfo')}</h3>

              <div className="mt-8 space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/30 text-white">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{t('contact.email')}</p>
                    <a href="mailto:support@isobrain.ai" className="text-blue-100 hover:underline">
                      support@isobrain.ai
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/30 text-white">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{t('contact.phone')}</p>
                    <a href="tel:+15551234567" className="text-blue-100 hover:underline">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>

                {/* Office */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/30 text-white">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{t('contact.office')}</p>
                    <p className="text-blue-100">
                      123 ISO Street<br />
                      San Francisco, CA 94107<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 lg:p-10">
              <h3 className="text-2xl font-bold text-gray-900">{t('contact.businessHours')}</h3>

              <div className="mt-6 space-y-4 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">{t('contact.monFri')}</span>
                  <span>{t('dynamic.dyn_900AM6_40')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t('contact.sat')}</span>
                  <span>{t('dynamic.dyn_1000AM4_41')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t('contact.sun')}</span>
                  <span>{t('contact.closed')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;