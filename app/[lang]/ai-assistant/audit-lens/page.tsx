"use client";

import React, { useState, useEffect } from "react";



import {



  ClipboardList,



  CheckCircle2,



  FileSearch,



  Sparkles,



  ArrowRight,



  Shield,



  Loader2,



  Layout,



  Link as LinkIcon,



  Type,



  CheckCircle,



  Info,



  MessageSquare,



  X,



  Send,



  ChevronDown,



  ChevronUp



} from "lucide-react";



import { motion, AnimatePresence } from "framer-motion";



import ReactMarkdown from "react-markdown";



import remarkGfm from "remark-gfm";

import AuditStepGuidanceView from "@/components/AIAssistant/AuditStepGuidanceView";



import { useRouter, useParams } from 'next/navigation';



import { toast } from 'sonner';







import {



  useGenerateAuditContextMutation,



  useGenerateAuditStepMutation,



  useChatSimpleMutation



} from "@/lib/redux/api/auditLensApi";



import { AuditChatHistoryItem } from "@/types/audit-lens";



import { useTranslation } from "react-i18next";



import i18n from "@/lib/i18n/client";







const AUDIT_STEPS: Record<number, { title: string, stage: string }> = {



  1: { title: "Initiate the Audit", stage: "Plan" },



  2: { title: "Document Review", stage: "Plan" },



  3: { title: "Audit Plan", stage: "Plan" },



  4: { title: "Work Assignment", stage: "Plan" },



  5: { title: "Prepare Working Papers", stage: "Plan" },



  6: { title: "Sequence & Scheduling", stage: "Do" },



  7: { title: "Opening Meeting", stage: "Do" },



  8: { title: "Review & Communicate", stage: "Do" },



  9: { title: "Carry out the Audit", stage: "Do" },



  10: { title: "Generate Findings", stage: "Check" },



  11: { title: "Closing Meeting", stage: "Check" },



  12: { title: "Audit Report", stage: "Check" },



  13: { title: "Follow Up", stage: "Act" },



};







const AuditLensPage = () => {



  const router = useRouter();



  const params = useParams();



  const lang = params?.lang || 'en';



  const { t } = useTranslation();



  



  // Sync i18n language with the URL [lang] param



  useEffect(() => {



    if (lang && i18n.language !== lang) {



      i18n.changeLanguage(lang as string);



    }



  }, [lang]);







  const [generateContext, { isLoading: isGeneratingContext }] = useGenerateAuditContextMutation();



  const [generateStep, { isLoading: isGeneratingStep }] = useGenerateAuditStepMutation();







  const [mode, setMode] = useState<'input' | 'options' | 'steps'>('input');



  const [inputType, setInputType] = useState<'text' | 'url'>('text');



  const [inputValue, setInputValue] = useState('');







  const [options, setOptions] = useState<any[]>([]);



  const [lockedContext, setLockedContext] = useState<any>(null);







  const [stepsData, setStepsData] = useState<Record<number, any>>({});



  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);



  const [isFetchingStep, setIsFetchingStep] = useState(false);







  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({



    Plan: true,



    Do: false,



    Check: false,



    Act: false



  });







  useEffect(() => {



    if (mode === 'steps') {



      const step = AUDIT_STEPS[currentStepNumber];



      if (step) {



        setExpandedStages(prev => ({ ...prev, [step.stage]: true }));



      }



    }



  }, [currentStepNumber, mode]);







  // Chat State



  const [chatMessage, setChatMessage] = useState("");



  const [chatHistory, setChatHistory] = useState<AuditChatHistoryItem[]>([]);



  const [sessionId, setSessionId] = useState<string>("");



  const [chatSimple, { isLoading: isSendingChat }] = useChatSimpleMutation();



  const [chatLoaderIdx, setChatLoaderIdx] = useState(0);



  const CHAT_LOADER_PHRASES = [



    "AI is thinking...",



    "Analyzing your context...",



    "Reviewing audit standards...",



    "Formulating expert response...",



    "Cross-referencing protocols...",



  ];







  useEffect(() => {



    if (!isSendingChat) { setChatLoaderIdx(0); return; }



    const timer = setInterval(() => {



      setChatLoaderIdx((prev) => (prev + 1) % CHAT_LOADER_PHRASES.length);



    }, 1500);



    return () => clearInterval(timer);



  }, [isSendingChat]);







  const buildContextStr = () => {



    let ctx =
      `ROLE: You are an ISO audit guidance assistant. Do NOT simulate conducting the audit, invent findings, or claim evidence was reviewed unless the user supplied it.\n\n` +
      `Audit Context: ${lockedContext ? JSON.stringify(lockedContext) : "Not selected yet"}\n\n`;



    if (Object.keys(stepsData).length > 0) {



      ctx += `Audit Steps Completed So Far:\n`;



      Object.values(stepsData).forEach((step: any) => {



        ctx += `Step ${step.step_number}: ${step.title}\n`;



        ctx += `${step.guidance}\n`;



        if (step.template_preview) {



          ctx += `Template: ${step.template_preview}\n`;



        }



        ctx += `\n`;



      });



    }



    return ctx;



  };







  const handleSendMessage = async () => {



    if (!chatMessage.trim()) return;







    const newUserMessage: AuditChatHistoryItem = { role: 'user', content: chatMessage };



    setChatHistory(prev => [...prev, newUserMessage]);



    setChatMessage("");







    try {



      const contextStr = buildContextStr();



      const currentSessionId = sessionId || ("audit_" + Math.random().toString(36).substring(7));







      const res = await chatSimple({



        messages: [{ content: newUserMessage.content }],



        context: {



          full_document_context: contextStr



        },



        session_id: currentSessionId



      }).unwrap();







      if (res.session_id && !sessionId) {



        setSessionId(res.session_id);



      }







      const aiResponse = res.messages?.[res.messages.length - 1]?.content || res.data?.response;



      if (aiResponse) {



        setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);



      }



    } catch (err: any) {



      toast.error(err?.data?.message || err?.message || "Failed to send message");



    }



  };







  const handleGetContext = async () => {



    if (!inputValue.trim()) return;



    try {



      const payload = inputType === 'text' ? { text: inputValue } : { url: inputValue };



      const res = await generateContext(payload).unwrap();



      if (res?.success && res?.data?.options) {



        setOptions(res.data.options);



        setMode('options');



      } else {



        toast.error("Invalid response format");



      }



    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.error ||
        (typeof err?.status === "number" ? `Request failed (${err.status})` : null) ||
        err?.message ||
        "Failed to generate context";

      console.error("Error fetching audit context:", message, err);
      toast.error(message);
    }



  };







  const fetchStep = async (stepNum: number, context: any) => {



    if (stepsData[stepNum]) return;



    setIsFetchingStep(true);



    try {



      const res = await generateStep({



        locked_context: context,



        step_number: stepNum,
        step_title: AUDIT_STEPS[stepNum]?.title,
        stage: AUDIT_STEPS[stepNum]?.stage,

      }).unwrap();







      const data = res?.data;
      const guidance = (data?.guidance || "").trim();

      if (!res?.success || !data || guidance.length < 40) {
        toast.error(
          res?.message ||
            "Empty or invalid step guidance. Please retry this step.",
        );
        return;
      }

      setStepsData(prev => ({ ...prev, [stepNum]: data }));



    } catch (err: any) {



      const message =
        err?.data?.message ||
        err?.error ||
        (typeof err?.status === "number" ? `Request failed (${err.status})` : null) ||
        err?.message ||
        `Failed to generate step ${stepNum}`;
      console.error("Error fetching audit step:", message, err);
      toast.error(message);



    } finally {



      setIsFetchingStep(false);



    }



  };







  const handleSelectOption = async (option: any) => {



    setLockedContext(option);



    setMode('steps');



    setCurrentStepNumber(1);



    await fetchStep(1, option);



  };







  const handleNextStep = async () => {



    if (currentStepNumber >= 13) return;



    const nextStep = currentStepNumber + 1;



    setCurrentStepNumber(nextStep);



    if (!stepsData[nextStep]) {



      await fetchStep(nextStep, lockedContext);



    }



  };







  const handlePrevStep = () => {



    setCurrentStepNumber(prev => Math.max(1, prev - 1));



  };







  const handleStepClick = async (stepNum: number) => {



    setCurrentStepNumber(stepNum);



    if (!stepsData[stepNum]) {



      await fetchStep(stepNum, lockedContext);



    }



  };







  const handleReset = () => {



    setMode('input');



    setInputValue('');



    setOptions([]);



    setLockedContext(null);



    setStepsData({});



    setCurrentStepNumber(1);



  };







  const renderLeftColumn = () => {



    return (



      <div className="flex flex-col gap-6 h-full">



        {mode === 'input' && (



          <div className="bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0">



            <div className="p-5 md:p-6 flex items-center gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50">



              <div className="p-2 bg-[#00f0ff] text-[#0F111A] rounded-xl">



                <Layout className="w-5 h-5 text-brand-cyan" />



              </div>



              <h2 className="text-base md:text-lg font-black text-[#F8F9FA] uppercase tracking-wider">{t('auditLens.provideContext')}</h2>
            </div>
            <div className="p-5 md:p-6 space-y-6">
              <div className="flex bg-[#0A0F1C] p-1 rounded-xl border border-[#1E293B]">
                <button
                  onClick={() => setInputType('text')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${inputType === 'text' ? 'bg-[#1E293B] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Type className="w-4 h-4" /> {t('auditLens.textTab')}</button>
                <button
                  onClick={() => setInputType('url')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${inputType === 'url' ? 'bg-[#1E293B] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <LinkIcon className="w-4 h-4" /> {t('auditLens.urlTab')}
                </button>
              </div>
              <div>
                {inputType === 'text' ? (
                  <textarea
                    placeholder={t('auditLens.textPlaceholder')}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full h-32 bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-medium text-[#F8F9FA] placeholder-[#4B4B4B] resize-none"
                  />
                ) : (
                  <input
                    type="url"
                    placeholder={t('auditLens.urlPlaceholder')}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-medium text-[#F8F9FA] placeholder-[#4B4B4B]"
                  />
                )}
              </div>



              <button
                onClick={handleGetContext}
                disabled={isGeneratingContext || !inputValue.trim()}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-600 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingContext ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGeneratingContext ? t('auditLens.analyzingContext') : t('auditLens.analyzeContext')}
              </button>



            </div>



          </div>



        )}







        {mode === 'options' && (



          <div className="bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0">



            <div className="p-5 md:p-6 flex items-center justify-between gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50">



              <div className="flex items-center gap-4">



                <div className="p-2 bg-[#14B8A6]/10 rounded-xl">



                  <Shield className="w-5 h-5 text-[#14B8A6]" />



                </div>



                <h2 className="text-base md:text-lg font-black text-[#F8F9FA] uppercase tracking-wider">Select Direction</h2>



              </div>



              <button onClick={() => setMode('input')} className="text-xs text-gray-400 hover:text-white uppercase tracking-widest">Back</button>



            </div>



            <div className="p-5 md:p-6 space-y-4 max-h-[400px] overflow-y-auto custom-thin-scrollbar">



              {options.map((opt, idx) => (



                <div



                  key={idx}



                  onClick={() => handleSelectOption(opt)}



                  className="bg-[#0A0F1C] border border-[#1E293B] hover:border-brand-cyan/50 rounded-2xl p-5 cursor-pointer transition-all group hover:bg-[#0A0F1C]/80"



                >



                  <div className="flex items-center justify-between mb-3">



                    <span className="text-xs font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-1 rounded-md uppercase tracking-wider">{opt.criteria}</span>



                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-brand-cyan transition-colors" />



                  </div>



                  <h4 className="text-sm font-bold text-white mb-2 leading-relaxed">{opt.scope}</h4>



                  <p className="text-xs text-gray-400 leading-relaxed">{opt.objective}</p>



                </div>



              ))}



            </div>



          </div>



        )}







        {mode === 'steps' && lockedContext && (



          <div className="bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl p-5 md:p-6 flex flex-col gap-2 relative overflow-hidden shrink-0">



            <div className="absolute top-0 right-0 w-32 h-32 bg-[#14B8A6]/5 rounded-full blur-[40px]" />



            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-[#14B8A6] uppercase tracking-widest">{t('auditLens.activeContext')}</span>
              <button onClick={handleReset} className="text-xs text-gray-400 hover:text-white uppercase tracking-widest relative z-10">{t('auditLens.change')}</button>
            </div>
            <p className="text-sm font-bold text-white relative z-10 leading-relaxed">{lockedContext.scope}</p>



          </div>



        )}







        <div className={`bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 min-h-[350px] xl:h-[500px]`}>



          <div className="p-4 md:p-5 flex items-center justify-between gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50 shrink-0">



            <div className="flex items-center gap-3">



              <div className="p-2 bg-[#00f0ff] text-[#0F111A] rounded-xl">



                <CheckCircle2 className="w-5 h-5 text-brand-cyan" />



              </div>



              <h2 className="text-sm md:text-base font-black text-[#F8F9FA] uppercase tracking-wider">{t('auditLens.auditSteps')}</h2>
            </div>
            {mode === 'steps' && <button onClick={handleReset} className="text-xs text-gray-400 hover:text-white uppercase tracking-widest">{t('auditLens.restart')}</button>}



          </div>



          <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-thin-scrollbar h-full">



            <div className="space-y-3">



              {["Plan", "Do", "Check", "Act"].map((stage) => {



                const isExpanded = !!expandedStages[stage];



                const stageSteps = Object.entries(AUDIT_STEPS).filter(([_, step]) => step.stage === stage);







                // Check if any step in this stage is active or completed



                const hasActiveStep = stageSteps.some(([key]) => {



                  const stepNum = parseInt(key);



                  return mode === 'steps' && stepNum === currentStepNumber;



                });







                return (



                  <div key={stage} className="border border-[#1E293B] rounded-2xl bg-[#0A0F1C]/40 overflow-hidden transition-all duration-300">



                    <button



                      onClick={() => setExpandedStages(prev => ({ ...prev, [stage]: !prev[stage] }))}



                      className={`w-full flex items-center justify-between p-3 text-left transition-colors ${hasActiveStep ? 'bg-brand-cyan text-[#0F111A] border-b border-brand-cyan/20' : 'hover:bg-[#131B2D]'}`}



                    >



                      <div className="flex items-center gap-2">



                        <div className={`w-2 h-2 rounded-full ${hasActiveStep ? 'bg-brand-cyan text-[#0F111A]' : 'bg-gray-600'}`} />



                        <span className="text-xs font-black uppercase tracking-wider text-[#F1F5F9]">{stage} Phase</span>



                        <span className="text-[10px] text-gray-500 font-bold">({stageSteps.length} Steps)</span>



                      </div>



                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}



                    </button>







                    {isExpanded && (



                      <div className="p-2 bg-[#0A0F1C]/20 border-t border-[#1E293B]/50 space-y-1.5 max-h-[220px] overflow-y-auto custom-thin-scrollbar animate-in slide-in-from-top-2 duration-200">



                        {stageSteps.map(([key, step]) => {



                          const stepNum = parseInt(key);



                          const isActive = mode === 'steps' && stepNum === currentStepNumber;



                          const isCompleted = mode === 'steps' && !!stepsData[stepNum] && !isActive;



                          const isAvailable = mode === 'steps' && (!!stepsData[stepNum] || stepNum === 1 || !!stepsData[stepNum - 1]);







                          return (



                            <div



                              key={stepNum}



                              onClick={() => isAvailable && handleStepClick(stepNum)}



                              className={`p-2 rounded-xl border transition-all flex items-center gap-3 ${isActive



                                ? 'bg-brand-cyan text-[#0F111A] border-brand-cyan/30'



                                : isCompleted



                                  ? 'bg-[#0A0F1C] border-[#1E293B] hover:border-gray-600 cursor-pointer'



                                  : isAvailable



                                    ? 'bg-[#0A0F1C] border-[#1E293B] hover:border-gray-600 cursor-pointer opacity-80'



                                    : 'bg-[#0A0F1C]/50 border-transparent opacity-30 cursor-not-allowed'



                                }`}



                            >



                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${isActive



                                ? 'bg-brand-cyan text-[#0F111A] shadow-[0_0_10px_rgba(63,62,237,0.4)]'



                                : isCompleted



                                  ? 'bg-[#1E293B] text-brand-cyan'



                                  : 'bg-[#1E293B] text-gray-400'



                                }`}>



                                {isCompleted && !isActive ? <CheckCircle className="w-3.5 h-3.5 text-brand-cyan" /> : stepNum}



                              </div>



                              <div className="flex-1 min-w-0">



                                <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>{step.title}</p>



                              </div>



                            </div>



                          );



                        })}



                      </div>



                    )}



                  </div>



                );



              })}



            </div>



          </div>



        </div>



      </div>



    );



  };







  const renderRightColumn = () => {



    const isCurrentlyFetching = isFetchingStep || isGeneratingStep;







    if (mode === 'input' || mode === 'options') {



      return (



        <div className="bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 text-center min-h-[500px] md:min-h-[600px] xl:h-[800px]">



          {isGeneratingContext ? (



            <div className="space-y-8 flex flex-col items-center">



              <div className="relative">



                <motion.div



                  animate={{ rotate: 360 }}



                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}



                  className="w-24 h-24 border-[2px] border-brand-cyan/10 border-t-[#00F0FF] rounded-full"



                />



                <div className="absolute inset-0 flex items-center justify-center">



                  <FileSearch className="w-8 h-8 text-brand-cyan animate-pulse" />



                </div>



              </div>



              <h3 className="text-xl font-black text-[#F8F9FA] uppercase tracking-widest">Analyzing Context</h3>



              <p className="text-sm text-[#9CA3AF] max-w-xs font-medium leading-relaxed">Processing your input to generate precise audit scope options.</p>



            </div>



          ) : (



            <>



              <div className="w-24 h-24 mb-10 bg-[#0A0F1C] rounded-3xl flex items-center justify-center border border-[#1E293B] group hover:border-brand-cyan/50 transition-all duration-500">



                <FileSearch className="w-10 h-10 text-[#4B4B4B] group-hover:text-brand-cyan transition-colors" strokeWidth={1.5} />



              </div>



              <h3 className="text-lg font-black text-[#F8F9FA] uppercase tracking-[0.2em] mb-4">{t('auditLens.readyForScan')}</h3>
              <p className="text-sm max-w-sm text-[#9CA3AF] font-medium leading-relaxed">{t('auditLens.readyForScanDesc')}</p>



            </>



          )}



        </div>



      );



    }







    const currentData = stepsData[currentStepNumber];







    return (



      <div className="bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px] md:min-h-[600px] xl:h-[800px]">



        {isCurrentlyFetching && !currentData ? (



          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">



            <div className="space-y-8 flex flex-col items-center">



              <div className="relative">



                <motion.div



                  animate={{ rotate: 360 }}



                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}



                  className="w-24 h-24 border-[2px] border-[#14B8A6]/10 border-t-[#14B8A6] rounded-full"



                />



                <div className="absolute inset-0 flex items-center justify-center">



                  <Loader2 className="w-8 h-8 text-[#14B8A6] animate-spin" />



                </div>



              </div>



              <h3 className="text-xl font-black text-[#F8F9FA] uppercase tracking-widest">Generating Step {currentStepNumber}</h3>



              <p className="text-sm text-[#9CA3AF] max-w-xs font-medium leading-relaxed">Compiling guidance and templates...</p>



            </div>



          </div>



        ) : currentData ? (



          <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-700">



            <div className="p-5 md:p-6 border-b border-[#1E293B] bg-[#0A0F1C]/50 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">



              <div className="flex items-center gap-4">



                <div className="p-2 bg-[#14B8A6]/10 rounded-xl">



                  <ClipboardList className="w-5 h-5 text-[#14B8A6]" />



                </div>



                <div className="space-y-1">



                  <h2 className="text-base md:text-lg font-black text-[#F8F9FA] tracking-wide">



                    Step {currentData?.step_number}: {currentData?.title}



                  </h2>



                  <p className="text-[10px] font-jetbrains-mono font-black text-[#14B8A6] uppercase tracking-[0.2em]">{currentData?.stage}</p>



                </div>



              </div>



            </div>







            <div className="flex-1 overflow-y-auto bg-[#0A0F1C] p-5 md:p-8 lg:p-12 custom-thin-scrollbar">



                            <AuditStepGuidanceView
                data={currentData || {}}
                emptyMessage="No guidance was generated for this step. Please retry."
              />







              <div className="mt-12 pt-8 border-t border-[#1E293B] flex items-center justify-between">



                <button



                  onClick={handlePrevStep}



                  disabled={currentStepNumber === 1}



                  className="px-6 py-3 rounded-xl border border-[#1E293B] cursor-pointer text-gray-400 font-bold uppercase tracking-widest text-xs hover:bg-[#1E293B] hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"



                >



                  Previous Step



                </button>







                {currentData?.next_step_available && currentStepNumber < 13 && (



                  <button



                    onClick={handleNextStep}



                    disabled={isFetchingStep}



                    className="px-6 py-3 cursor-pointer bg-[#14B8A6] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0f8b7d] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"



                  >



                    {isFetchingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : "Next Step"} <ArrowRight className="w-4 h-4" />



                  </button>



                )}



              </div>



            </div>



          </div>



        ) : (



          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-12 text-center">



            <div className="w-16 h-16 bg-[#0A0F1C] rounded-2xl flex items-center justify-center border border-[#1E293B] mb-4">



              <Info className="w-8 h-8 text-[#4B4B4B]" />



            </div>



            <p className="mb-6 font-medium text-sm text-gray-400">Failed to load Step {currentStepNumber}. Please try again.</p>



            <button onClick={() => fetchStep(currentStepNumber, lockedContext)} className="px-6 py-3 bg-[#1E293B] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#4B4B4B] transition-all">



              Retry Step



            </button>



          </div>



        )}



      </div>



    );



  };



  const renderBottomChat = () => {



    return (



      <div className="bg-[#131B2D] bormax-w-[85vw] sm:max-w-[80vw] md:max-w-[95vw] lg:max-w-[99vw] border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">



        <div className="p-2 sm:p-3 md:p-6 flex items-center gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50">

          <div className="p-2 bg-[#00f0ff] text-[#0F111A]/10 rounded-xl">

            <Sparkles className="w-5 h-5 text-black" />

          </div>

          <div>
            <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-[#F3F4F6] uppercase tracking-wider">{t('auditLens.chatTitle')}</div>
            <p className="text-[8px] text-[#4B5563] font-black uppercase tracking-widest mt-1">{t('auditLens.chatDesc')}</p>
          </div>

        </div>



        <div className="p-2 sm:p-3 md:p-8 space-y-8 max-w-[94.5vw] sm:max-w-[80vw] md:max-w-[90vw] lg:max-w-[99vw]">

          <div className="flex flex-col space-y-6 min-w-0">

            {(chatHistory.length > 0 || isSendingChat) && (

              <div className="w-full min-w-0 bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-2 sm:p-3 md:p-6 overflow-y-auto max-h-[400px] flex flex-col space-y-4 md:space-y-6 custom-thin-scrollbar animate-in slide-in-from-bottom-4 duration-300">

                {chatHistory.map((msg, idx) => (

                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} min-w-0`}>

                    <div className={`max-w-full p-1.5 sm:p-2.5 md:p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed min-w-0 ${msg.role === 'user' ? 'bg-[#67E8F9] text-[#0F111A] rounded-tr-none shadow-[0_4px_15px_-3px_rgba(103,232,249,0.35)]' : 'bg-[#131B2D] border border-[#1E293B] text-[#F1F5F9] rounded-tl-none w-full'}`}>

                      <div className={`prose prose-sm max-w-none w-full min-w-0 ${msg.role === 'user' ? 'text-black' : 'prose-invert text-[#F1F5F9]'}`}>

                        <ReactMarkdown

                          remarkPlugins={[remarkGfm]}

                          components={{

                            h1: (props) => <span className={`block font-black mb-3 uppercase tracking-wide text-[10px] sm:text-[12px] md:text-[14px] ${msg.role === 'user' ? 'text-black font-bold' : 'text-white font-bold'}`} {...props} />,

                            h2: (props) => <span className={`block font-black mt-4 mb-2 uppercase tracking-wide text-[9px] sm:text-[11px] md:text-[13px] ${msg.role === 'user' ? 'text-black font-bold' : 'text-white font-bold'}`} {...props} />,

                            h3: (props) => <span className={`block font-bold mt-3 mb-1.5 uppercase tracking-wide text-[8px] sm:text-[10px] md:text-[12px] ${msg.role === 'user' ? 'text-black' : 'text-white'}`} {...props} />,

                            p: (props) => <p className={`mb-2 text-[10px] sm:text-xs md:text-sm leading-relaxed ${msg.role === 'user' ? 'text-black font-semibold' : 'text-gray-100'}`} {...props} />,

                            ul: ({node, className, ...props}: any) => <ul className={`list-disc pl-4 mb-3 space-y-1 ${msg.role === 'user' ? 'text-black' : 'text-gray-100'} ${className || ''}`} {...props} />,



                            ol: ({node, className, ...props}: any) => <ol className={`list-decimal pl-4 mb-3 space-y-1 ${msg.role === 'user' ? 'text-black' : 'text-gray-100'} ${className || ''}`} {...props} />,

                            

                            li: ({node, className, ...props}: any) => <li className={`mb-1 text-[10px] sm:text-xs md:text-sm leading-relaxed ${msg.role === 'user' ? 'text-black' : 'text-gray-100'} ${className || ''}`} {...props} />,

                            table: ({ ...props }) => (

                              <div className="scrollable-table my-4 w-full overflow-x-auto rounded-xl border border-white/10 pb-2">

                                <table className="w-full text-left border-collapse text-sm md:text-base min-w-[500px]" {...props} />

                              </div>

                            ),

                            th: ({ ...props }) => <th className="border-b border-white/20 px-3 py-2 md:px-4 md:py-3 bg-white/5 font-bold text-white break-normal" {...props} />,

                            td: ({ ...props }) => <td className="border-b border-white/10 px-3 py-2 md:px-4 md:py-3 break-normal align-top text-gray-300" {...props} />,

                          }}

                        >

                          {msg.content}

                        </ReactMarkdown>

                      </div>

                    </div>



                  </div>



                ))}



                {isSendingChat && (



                  <div className="flex justify-start">



                    <div className="flex items-center gap-3 p-3 bg-[#131B2D] border border-[#67E8F9]/20 rounded-2xl rounded-tl-none shadow-[0_0_15px_rgba(103,232,249,0.1)]">



                      <span className="text-[10px] md:text-xs font-semibold text-white uppercase tracking-wider animate-pulse leading-none">



                        {CHAT_LOADER_PHRASES[chatLoaderIdx]}



                      </span>



                    </div>



                  </div>



                )}



              </div>



            )}







            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-4 items-center">



              <div className="flex-1 relative">



                <input



                  type="text"



                  value={chatMessage}



                  onChange={(e) => setChatMessage(e.target.value)}



                  placeholder={t('auditLens.chatPlaceholder')}



                  className="w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-4 md:p-5 pr-14 text-sm focus:outline-none focus:border-[#67E8F9] focus:ring-2 focus:ring-[#67E8F9]/30 transition-all font-medium text-[#F3F4F6] placeholder-[#4B5563]"



                />



                <button



                  type="submit"



                  disabled={isSendingChat || !chatMessage.trim()}



                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#67E8F9] text-[#0F111A] hover:bg-[#22D3EE] disabled:opacity-30 disabled:hover:bg-[#67E8F9] rounded-xl transition-all"



                >



                  <Send className="w-5 h-5" />



                </button>



              </div>



            </form>



          </div>



        </div>



      </div>



    );



  };







  return (



    <div className="w-full mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 bg-[#0A0F1C] min-h-screen p-2 md:p-8">



      {/* Header */}
      <header className="space-y-4 px-2 sm:px-0 mb-12 mt-20">
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1 border-[#00f0ff] text-[#00f0ff] border border-brand-cyan/20 rounded-full">
            <span className="text-brand-cyan text-[10px] font-black uppercase tracking-[0.3em]">{t('auditLens.badge')}</span>
          </div>
        </div>
        <h1 className="space-grotesk text-5xl lg:text-[52px] font-semibold text-white leading-[1.1] tracking-tight mb-8 text-center">
          {t('auditLens.title')}
        </h1>
        <p className="text-[#A1A1A6] text-sm lg:text-lg max-w-4xl mx-auto text-center leading-relaxed mb-12 font-inter">
          <span className="font-semibold text-white/80 block mb-2">{t('auditLens.subtitle')}</span>
          {t('auditLens.description')}
        </p>
      </header>







      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-4 items-start">



        {/* Left Column - Input/Steps */}



        <div className="xl:col-span-4 space-y-6">



          {renderLeftColumn()}



        </div>







        {/* Right Column - Results Viewer */}



        <div className="xl:col-span-8">



          {renderRightColumn()}



        </div>



      </div>







      {/* Bottom Chat Section */}



      <div className="mt-8 xl:mt-12">



        {renderBottomChat()}



      </div>







      <style jsx global>{`



        .custom-thin-scrollbar::-webkit-scrollbar {



          width: 5px;



        }



        .custom-thin-scrollbar::-webkit-scrollbar-track {



          background: transparent;



        }



        .custom-thin-scrollbar::-webkit-scrollbar-thumb {



          background: #1E293B;



          border-radius: 10px;



        }



        .custom-thin-scrollbar::-webkit-scrollbar-thumb:hover {



          background: #4B4B4B;



        }



      `}</style>



    </div>



  );



};







export default AuditLensPage;



