// "use client";

// import { useState } from "react";

// function AnalysisPage({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
//   const [aiQuestion, setAiQuestion] = useState("");
//   const [aiAnswer, setAiAnswer] = useState<string | null>(null);
//   const [aiLoading, setAiLoading] = useState(false);

//   function handleAiAnswer() {
//     setAiLoading(true);
//     setAiAnswer(null);
//     setTimeout(() => {
//       setAiAnswer(
//         "To address this effectively, focus on the following:\n\n1. **Immediate Action** – Start by documenting your current state: what processes, risks, or requirements are already in place but not documented.\n\n2. **Template Approach** – Use the ISO 9001:2015 standard structure as a template. Each clause has specific requirements that should be addressed.\n\n3. **Evidence-Based** – Ensure each section has supporting evidence – don't just state compliance, demonstrate it with records, procedures, or examples.\n\n4. **Continuous Improvement** – Build in review cycles. ISO standards require regular review and updates based on performance and changes.\n\nWould you like me to give more specific guidance on any particular aspect?"
//       );
//       setAiLoading(false);
//     }, 1800);
//   }

//   const gradeColor = result.grade === "A" ? "text-emerald-500" : result.grade === "B" ? "text-amber-500" : "text-red-500";

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-200 px-6 py-5">
//         <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('benchmarkAi.headingHighlight')}</h1>
//         <p className="text-sm text-slate-500 mt-0.5">Upload, Describe, Improve – AI-powered ISO compliance analysis</p>
//       </div>

//       {/* Steps */}
//       <div className="bg-white border-b border-slate-100 px-6 py-3">
//         <div className="flex gap-3 max-w-3xl">
//           {[
//             { n: "1", icon: "👁", label: "Eye", sub: "Upload & OCR" },
//             { n: "2", icon: "🧠", label: "Brain", sub: "Understand Context" },
//             { n: "3", icon: "🔍", label: "Audit", sub: "Gap Analysis" },
//             { n: "4", icon: "⭐", label: "Grade", sub: "Score & Recommend", active: true },
//           ].map((s) => (
//             <div
//               key={s.n}
//               className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border text-xs flex-1 transition-all ${
//                 s.active
//                   ? "border-amber-300 bg-amber-50 text-slate-800"
//                   : "border-slate-200 bg-white text-slate-500"
//               }`}
//             >
//               <span className="text-base">{s.icon}</span>
//               <span className="font-semibold">{s.n}. {s.label}</span>
//               <span className="text-[10px] text-center leading-tight">{s.sub}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
//         {/* Left sidebar */}
//         <div className="space-y-4">
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//             <div className="flex items-center gap-2 mb-4">
//               <span className="text-lg">📤</span>
//               <h2 className="text-sm font-bold text-slate-800">Upload & Analyze</h2>
//             </div>
//             <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center">
//               <div className="text-2xl mb-1">⬆️</div>
//               <p className="text-xs font-medium text-slate-500">Click to upload or drag and drop</p>
//               <p className="text-[11px] text-slate-400">PDF, Word, or Image (JPG, PNG)</p>
//             </div>
//             <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
//               <span className="text-emerald-500 text-sm">📄</span>
//               <div>
//                 <p className="text-xs font-medium text-slate-700">My Workspaces (3).png</p>
//                 <p className="text-[11px] text-emerald-600">✓ File uploaded successfully</p>
//               </div>
//             </div>
//             <label className="block text-xs font-semibold text-slate-700 mt-4 mb-1">
//               2. What Do You Want to Improve? <span className="text-red-500">*</span>
//             </label>
//             <div className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-400 flex items-center justify-between">
//               <span>Enhance...</span>
//               <span className="text-emerald-500">✓</span>
//             </div>
//             <p className="text-[11px] text-slate-400 mt-1">{t('benchmarkAi.hint')}</p>
//             <button
//               onClick={onReset}
//               className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all"
//             >
//               🤖 Get AI Analysis & Recommendations
//             </button>
//             <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-xs text-emerald-700 font-medium flex items-center gap-2">
//               <span>✅</span> Analysis Complete! Your document has been analyzed. Scroll right to see results.
//             </div>
//             <button
//               onClick={onReset}
//               className="mt-2 w-full py-2 text-xs text-slate-500 hover:text-slate-700 underline"
//             >
//               Analyze Another Document
//             </button>
//             <div className="mt-4 space-y-1 text-[11px] text-slate-400">
//               <p>🔒 Your documents are processed securely</p>
//               <p>🔤 OCR technology extracts text from images</p>
//               <p>📊 AI compares against ISO standard requirements</p>
//             </div>
//           </div>
//         </div>

//         {/* Right – Results */}
//         <div className="space-y-5">
//           {/* Score card */}
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <p className="text-xs text-slate-400 font-medium mb-1">{t('benchmarkAi.overallScore')}</p>
//                 <div className="flex items-end gap-2">
//                   <span className={`text-4xl font-black ${gradeColor}`}>{result.overallScore}%</span>
//                 </div>
//                 <span className={`text-sm font-bold ${gradeColor}`}>Grade {result.grade}</span>
//                 <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
//                   <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${result.overallScore}%` }} />
//                 </div>
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400 font-medium mb-1">{t('benchmarkAi.completeness')}</p>
//                 <span className="text-3xl font-black text-blue-500">{result.completeness}%</span>
//                 <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
//                   <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${result.completeness}%` }} />
//                 </div>
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400 font-medium mb-1">{t('benchmarkAi.effectiveness')}</p>
//                 <span className="text-3xl font-black text-purple-500">{result.effectiveness}%</span>
//                 <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
//                   <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${result.effectiveness}%` }} />
//                 </div>
//               </div>
//             </div>
//             <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 text-xs text-slate-500">
//               <span><span className="font-semibold text-slate-700">Document Type:</span> {result.documentType}</span>
//               <span><span className="font-semibold text-slate-700">Standard:</span> {result.standard}</span>
//             </div>
//           </div>

//           {/* Clause-by-Clause */}
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
//             <h3 className="text-base font-bold text-slate-800 mb-4">Clause-by-Clause Compliance</h3>
//             <div className="space-y-4">
//               {result.clauses.map((c) => (
//                 <div key={c.id}>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-semibold text-slate-700">{c.id} {c.title}</span>
//                     <div className="flex items-center gap-2">
//                       <StatusBadge status={c.status} />
//                       <span className="text-sm font-bold text-slate-600 w-8 text-right">{c.score}%</span>
//                     </div>
//                   </div>
//                   <p className="text-xs text-slate-400 mt-0.5">{c.note}</p>
//                   <ScoreBar score={c.score} status={c.status} />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Strengths & Gaps */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <span className="text-emerald-500">✅</span>
//                 <h4 className="text-sm font-bold text-slate-800">{t('benchmarkAi.strengths')}</h4>
//               </div>
//               <ul className="space-y-2">
//                 {result.strengths.map((s, i) => (
//                   <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
//                     <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
//                     {s}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <span className="text-red-500">⚠️</span>
//                 <h4 className="text-sm font-bold text-slate-800">{t('benchmarkAi.identifiedGaps')}</h4>
//               </div>
//               <ul className="space-y-2">
//                 {result.gaps.map((g, i) => (
//                   <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
//                     <span className="text-red-500 mt-0.5 shrink-0">▲</span>
//                     {g}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Recommendations */}
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <span>✨</span>
//               <h3 className="text-base font-bold text-slate-800">AI-Generated Recommendations</h3>
//             </div>
//             <div className="space-y-4">
//               {result.recommendations.map((r, i) => (
//                 <div key={i} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
//                   <div className="flex items-start justify-between mb-1">
//                     <PriorityBadge priority={r.priority} />
//                     <span className="text-[11px] text-slate-400 font-medium">{r.clause}</span>
//                   </div>
//                   <p className="text-sm font-bold text-slate-800 mt-2">{r.title}</p>
//                   <p className="text-xs text-slate-500 mt-1 leading-relaxed">
//                     <span className="font-semibold text-slate-600">Recommendation:</span> {r.description}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1.5 bg-white border border-slate-100 rounded-lg px-2.5 py-1.5">
//                     <span className="font-semibold text-slate-500">Benefit:</span> {r.benefit}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Ask AI */}
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
//             <div className="flex items-center gap-2 mb-1">
//               <span>✨</span>
//               <h3 className="text-base font-bold text-slate-800">Ask AI About This Analysis</h3>
//             </div>
//             <p className="text-xs text-slate-400 mb-4">Get clarification or additional guidance on the analysis results</p>
//             <textarea
//               value={aiQuestion}
//               onChange={(e) => setAiQuestion(e.target.value)}
//               rows={3}
//               placeholder="e.g. 'How can I improve the risk assessment section quickly? What's the fastest way to address the gaps?'"
//               className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={handleAiAnswer}
//               disabled={!aiQuestion.trim() || aiLoading}
//               className={`mt-3 w-full py-3 rounded-xl text-sm font-bold transition-all ${
//                 aiQuestion.trim() && !aiLoading
//                   ? "bg-slate-800 hover:bg-slate-700 text-white"
//                   : "bg-slate-100 text-slate-400 cursor-not-allowed"
//               }`}
//             >
//               {aiLoading ? "⏳ Analyzing..." : "✨ Get AI Answer"}
//             </button>
//             {aiAnswer && (
//               <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
//                 {aiAnswer}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }