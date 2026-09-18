// app/courses/[courseId]/lessons/[lessonSlug]/mastery-lab/page.tsx
'use client';
import icons from '@/public/library/Container (16).png'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

export default function AssessmentPage() {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleOptionChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation (optional)
    if (Object.keys(answers).length < 2) {
      alert(t('academy.coursePlayer.pleaseAnswerAll'));
      return;
    }

    setStatus('submitting');

    // Fake API delay (replace with real fetch/axios call later)
    setTimeout(() => {
      // Simulate passing (you would get real result from backend)
      const passed = true; // ← change to false to test fail case

      if (passed) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 1200); // 1.2 second fake delay
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-200 bg- text-black px-6 py-8 ">
              <h1 className="text-2xl font-bold md:text-3xl">
                {t('academy.coursePlayer.assessment')}: {t('academy.coursePlayer.lesson')} 2 — {t('academy.coursePlayer.corePrinciples')}
              </h1>
              <p className="mt-3 text-black">
               {t('academy.coursePlayer.answerToProceed')}
              </p>
            </div>

            {/* Success content */}
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center md:py-24">

              {/* Green check circle */}
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <Image 
                src={icons}
                width={64}
                height={64}
                alt=''
                />
              </div>

              <h2 className="mb-3 text-3xl font-bold text-gray-800">
                {t('academy.coursePlayer.congratulations')}
              </h2>
              <p className="mb-10 max-w-md text-lg text-gray-600">
                {t('academy.coursePlayer.passedAssessment')}<br />
                {t('academy.coursePlayer.canProceed')}
              </p>

              <Link
                href={`/lessons/complete` }// ← replace with real next lesson path
                className="inline-flex items-center rounded-lg bg-blue-600 px-10 py-4 text-lg font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('academy.coursePlayer.nextLesson')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-xl border border-red-200 bg-white p-10 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-red-600">{t('academy.coursePlayer.notQuite')}</h2>
            <p className="mb-8 text-gray-700">
              {t('academy.coursePlayer.didNotReach')}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="rounded-lg bg-gray-700 px-8 py-3 text-white hover:bg-gray-800"
            >
              {t('academy.coursePlayer.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold md:text-3xl">
              {t('academy.coursePlayer.assessment')}: {t('academy.coursePlayer.lesson')} 2 — {t('academy.coursePlayer.corePrinciples')}
            </h1>
            <p className="mt-3 text-blue-100">
              {t('academy.coursePlayer.answerToProceed')}
            </p>
          </div>

          {/* Questions Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
            {/* Question 1 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                1. What is a core principle of ISO 9001?
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Customer focus', value: 'customer-focus' },
                  { label: 'Cost reduction only', value: 'cost-reduction' },
                  { label: 'Ignoring stakeholders', value: 'ignoring-stakeholders' },
                  { label: 'Limiting documentation', value: 'limiting-doc' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center rounded-lg border p-4 transition ${
                      answers['q1'] === opt.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q1"
                      value={opt.value}
                      checked={answers['q1'] === opt.value}
                      onChange={() => handleOptionChange('q1', opt.value)}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                2. Which year was the latest version of ISO 9001 published?
              </h2>
              <div className="space-y-3">
                {['2008', '2015', '2018', '2021'].map((year) => (
                  <label
                    key={year}
                    className={`flex cursor-pointer items-center rounded-lg border p-4 transition ${
                      answers['q2'] === year
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q2"
                      value={year}
                      checked={answers['q2'] === year}
                      onChange={() => handleOptionChange('q2', year)}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3">{year}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit area */}
            <div className="pt-6 text-center">
              <button
                type="submit"
                disabled={status === 'submitting' || Object.keys(answers).length < 2}
                className={`
                  inline-flex items-center rounded-lg px-10 py-4 text-lg font-medium text-white shadow-md transition
                  ${status === 'submitting' ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}
                `}
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="mr-3 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                    {t('academy.coursePlayer.submitting')}
                  </>
                ) : (
                  t('academy.coursePlayer.submitAssessment')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}