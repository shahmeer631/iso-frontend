import { useState } from "react";
import { useTranslation } from "react-i18next";

function LoadingOverlay() {
  const { t } = useTranslation();
  const steps = [
    { icon: "👁", label: "Extracting text via OCR..." },
    { icon: "🧠", label: "Understanding document context..." },
    { icon: "🔍", label: "Running gap analysis..." },
    { icon: "⭐", label: "Generating recommendations..." },
  ];
  const [step, setStep] = useState(0);

  useState(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 800);
    return () => clearInterval(id);
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-base font-bold text-slate-800">{t('benchmarkAi.loaderTitle')}</h3>
          <p className="text-xs text-slate-400 mt-1">Please wait while our AI reviews your document</p>
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 transition-all ${i <= step ? "opacity-100" : "opacity-30"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${i < step ? "bg-emerald-100" : i === step ? "bg-blue-100 animate-pulse" : "bg-slate-100"}`}>
                {i < step ? "✓" : s.icon}
              </div>
              <span className={`text-xs font-medium ${i === step ? "text-slate-800" : "text-slate-400"}`}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}