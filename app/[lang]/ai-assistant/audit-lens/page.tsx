"use client";

import React, { useState, useEffect, useRef } from "react";



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
import { ActivityTracker } from "@/components/activity/ActivityTracker";







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
  const [stepLoaderIdx, setStepLoaderIdx] = useState(0);
  const fetchStepInFlightRef = useRef(false);

  const STEP_LOADER_PHRASES = [
    "Preparing audit guidance",
    "Retrieving relevant ISO context",
    "Generating working paper",
    "Preparing documented information",
    "Preparing template",
    "Preparing case study",
  ];







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

  useEffect(() => {
    const busy = isFetchingStep || isGeneratingStep;
    if (!busy) {
      setStepLoaderIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setStepLoaderIdx((prev) => (prev + 1) % STEP_LOADER_PHRASES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isFetchingStep, isGeneratingStep]);







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
      `ROLE: You are an Intelligent Audit Guidance Assistant for ISO audits. ` +
      `Equip the human auditor with what to check, evidence to look for, and questions to ask. ` +
      `Do NOT simulate conducting the audit, invent interviews/inspections/findings, claim compliance, ` +
      `or treat hypothetical examples as real organizational evidence unless the user supplied objective evidence.\n\n` +
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
    if (fetchStepInFlightRef.current) return;

    fetchStepInFlightRef.current = true;
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
      fetchStepInFlightRef.current = false;
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



          <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0">



            <div className="p-4 md:p-5 flex items-center gap-3 border-b border-[var(--ib-line)] bg-[var(--ib-card)]">



              <div className="p-2 bg-[var(--ib-acc)] text-white rounded-xl">



                <Layout className="w-5 h-5 text-[var(--ib-acc)]" />



              </div>



              <h2 className="text-[16px] font-semibold leading-[1.4] text-[var(--ib-ink)] tracking-wide">{t('auditLens.provideContext')}</h2>
            </div>
            <div className="p-4 md:p-5 space-y-5">
              <div className="flex bg-[var(--ib-bg)] p-1 rounded-xl border border-[var(--ib-line)]">
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${inputType === 'text' ? 'bg-[var(--ib-acc)] text-white' : 'text-[var(--ib-mute)] hover:text-[var(--ib-ink)] hover:bg-[var(--ib-card)]'}`}
                >
                  <Type className="w-4 h-4" /> {t('auditLens.textTab')}</button>
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${inputType === 'url' ? 'bg-[var(--ib-acc)] text-white' : 'text-[var(--ib-mute)] hover:text-[var(--ib-ink)] hover:bg-[var(--ib-card)]'}`}
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
                    className="w-full h-32 bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-medium text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)] resize-none"
                  />
                ) : (
                  <input
                    type="url"
                    placeholder={t('auditLens.urlPlaceholder')}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-medium text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)]"
                  />
                )}
              </div>



              <button
                onClick={handleGetContext}
                disabled={isGeneratingContext || !inputValue.trim()}
                className="w-full py-3 bg-[var(--ib-acc)] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-92 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingContext ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGeneratingContext ? t('auditLens.analyzingContext') : t('auditLens.analyzeContext')}
              </button>



            </div>



          </div>



        )}







        {mode === 'options' && (



          <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0">



            <div className="p-5 md:p-6 flex items-center justify-between gap-4 border-b border-[var(--ib-line)] bg-[var(--ib-card)]">



              <div className="flex items-center gap-4">



                <div className="p-2 bg-[var(--ib-ok)]/10 rounded-xl">



                  <Shield className="w-5 h-5 text-[var(--ib-ok)]" />



                </div>



                <h2 className="text-[16px] font-semibold leading-[1.4] text-[var(--ib-ink)] tracking-wide">Select Direction</h2>



              </div>



              <button onClick={() => setMode('input')} className="text-xs text-[var(--ib-mute)] hover:text-[var(--ib-ink)] uppercase tracking-widest">Back</button>



            </div>



            <div className="p-4 md:p-5 space-y-3 max-h-[400px] overflow-y-auto custom-thin-scrollbar">



              {options.map((opt, idx) => (



                <div



                  key={idx}



                  onClick={() => handleSelectOption(opt)}



                  className="bg-[var(--ib-bg)] border border-[var(--ib-line)] hover:border-[var(--ib-acc)]/50 rounded-2xl p-5 cursor-pointer transition-all group hover:bg-[var(--ib-card)]"



                >



                  <div className="flex items-center justify-between mb-3">



                    <span className="text-xs font-bold text-[var(--ib-ok)] bg-[var(--ib-ok)]/10 px-2 py-1 rounded-md uppercase tracking-wider">{opt.criteria}</span>



                    <ArrowRight className="w-4 h-4 text-[var(--ib-mute)] group-hover:text-[var(--ib-acc)] transition-colors" />



                  </div>



                  <h4 className="text-sm font-bold text-[var(--ib-ink)] mb-2 leading-relaxed">{opt.scope}</h4>



                  <p className="text-xs text-[var(--ib-mute)] leading-relaxed">{opt.objective}</p>



                </div>



              ))}



            </div>



          </div>



        )}







        {mode === 'steps' && lockedContext && (



          <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl p-4 md:p-5 flex flex-col gap-2 relative overflow-hidden shrink-0">



            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ib-ok)]/5 rounded-full blur-[40px]" />



            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-[var(--ib-ok)] uppercase tracking-[0.06em]">{t('auditLens.activeContext')}</span>
              <button onClick={handleReset} className="text-xs text-[var(--ib-mute)] hover:text-[var(--ib-ink)] uppercase tracking-widest relative z-10">{t('auditLens.change')}</button>
            </div>
            <p className="text-[14px] font-medium text-[var(--ib-ink)] relative z-10 leading-[1.6]">{lockedContext.scope}</p>



          </div>



        )}







        <div className={`bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 min-h-[350px] xl:h-[500px]`}>



          <div className="p-4 md:p-5 flex items-center justify-between gap-4 border-b border-[var(--ib-line)] bg-[var(--ib-card)] shrink-0">



            <div className="flex items-center gap-3">



              <div className="p-2 bg-[var(--ib-acc)] text-white rounded-xl">



                <CheckCircle2 className="w-5 h-5 text-[var(--ib-acc)]" />



              </div>



              <h2 className="text-[16px] font-semibold leading-[1.4] text-[var(--ib-ink)] tracking-wide">{t('auditLens.auditSteps')}</h2>
            </div>
            {mode === 'steps' && <button onClick={handleReset} className="text-xs text-[var(--ib-mute)] hover:text-[var(--ib-ink)] uppercase tracking-widest">{t('auditLens.restart')}</button>}



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



                  <div key={stage} className="border border-[var(--ib-line)] rounded-2xl bg-[var(--ib-bg)] overflow-hidden transition-all duration-300">



                    <button



                      onClick={() => setExpandedStages(prev => ({ ...prev, [stage]: !prev[stage] }))}



                      className={`w-full flex items-center justify-between p-3 text-left transition-colors ${hasActiveStep ? 'bg-[var(--ib-acc)] text-white border-b border-[var(--ib-acc)]/20' : 'hover:bg-[var(--ib-accbg)]'}`}



                    >



                      <div className="flex items-center gap-2">



                        <div className={`w-2 h-2 rounded-full ${hasActiveStep ? 'bg-[var(--ib-acc)] text-white' : 'bg-[var(--ib-mute)]'}`} />



                        <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ib-dktx)]">{stage} Phase</span>



                        <span className="text-[12px] text-[var(--ib-mute)] font-medium">({stageSteps.length} Steps)</span>



                      </div>



                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[var(--ib-mute)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--ib-mute)]" />}



                    </button>







                    {isExpanded && (



                      <div className="p-2 bg-[var(--ib-bg)]/20 border-t border-[var(--ib-line)]/50 space-y-1.5 max-h-[220px] overflow-y-auto custom-thin-scrollbar animate-in slide-in-from-top-2 duration-200">



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



                                ? 'bg-[var(--ib-acc)] text-white border-[var(--ib-acc)]/30'



                                : isCompleted



                                  ? 'bg-[var(--ib-bg)] border-[var(--ib-line)] hover:border-[var(--ib-line)] cursor-pointer'



                                  : isAvailable



                                    ? 'bg-[var(--ib-bg)] border-[var(--ib-line)] hover:border-[var(--ib-line)] cursor-pointer opacity-80'



                                    : 'bg-[var(--ib-card)] border-transparent opacity-30 cursor-not-allowed'



                                }`}



                            >



                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${isActive



                                ? 'bg-[var(--ib-acc)] text-white shadow-[0_0_10px_rgba(27, 77, 219,0.4)]'



                                : isCompleted



                                  ? 'bg-[var(--ib-ink)] text-[var(--ib-acc)]'



                                  : 'bg-[var(--ib-ink)] text-[var(--ib-mute)]'



                                }`}>



                                {isCompleted && !isActive ? <CheckCircle className="w-3.5 h-3.5 text-[var(--ib-acc)]" /> : stepNum}



                              </div>



                              <div className="flex-1 min-w-0">



                                <p className={`text-xs font-bold truncate ${isActive ? 'text-[var(--ib-ink)]' : 'text-[var(--ib-mute)]'}`}>{step.title}</p>



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



        <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 md:p-8 text-center min-h-[500px] md:min-h-[600px] xl:h-[800px]">



          {isGeneratingContext ? (



            <div className="space-y-5 flex flex-col items-center">



              <div className="relative">



                <motion.div



                  animate={{ rotate: 360 }}



                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}



                  className="w-24 h-24 border-[2px] border-[var(--ib-acc)]/10 border-t-[var(--ib-acc)] rounded-full"



                />



                <div className="absolute inset-0 flex items-center justify-center">



                  <FileSearch className="w-8 h-8 text-[var(--ib-acc)] animate-pulse" />



                </div>



              </div>



              <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--ib-ink)]">Analyzing Context</h3>



              <p className="text-[14px] text-[var(--ib-mute)] max-w-sm font-normal leading-[1.6]">Processing your input to generate precise audit scope options.</p>



            </div>



          ) : (



            <>



              <div className="w-24 h-24 mb-10 bg-[var(--ib-bg)] rounded-3xl flex items-center justify-center border border-[var(--ib-line)] group hover:border-[var(--ib-acc)]/50 transition-all duration-500">



                <FileSearch className="w-10 h-10 text-[#4B4B4B] group-hover:text-[var(--ib-acc)] transition-colors" strokeWidth={1.5} />



              </div>



              <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--ib-ink)] mb-3">{t('auditLens.readyForScan')}</h3>
              <p className="text-[14px] max-w-sm text-[var(--ib-mute)] font-normal leading-[1.6]">{t('auditLens.readyForScanDesc')}</p>



            </>



          )}



        </div>



      );



    }







    const currentData = stepsData[currentStepNumber];







    return (



      <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px] md:min-h-[600px] xl:h-[800px]">



        {isCurrentlyFetching && !currentData ? (



          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center">



            <div className="space-y-5 flex flex-col items-center">



              <div className="relative">



                <motion.div



                  animate={{ rotate: 360 }}



                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}



                  className="w-24 h-24 border-[2px] border-[var(--ib-ok)]/10 border-t-[var(--ib-ok)] rounded-full"



                />



                <div className="absolute inset-0 flex items-center justify-center">



                  <Loader2 className="w-8 h-8 text-[var(--ib-ok)] animate-spin" />



                </div>



              </div>



              <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--ib-ink)]">Generating Audit Step {currentStepNumber}</h3>

              <p className="text-[14px] text-[var(--ib-mute)] max-w-sm font-normal leading-[1.6]">
                {STEP_LOADER_PHRASES[stepLoaderIdx]}…
              </p>



            </div>



          </div>



        ) : currentData ? (



          <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-700">



            <div className="p-4 md:p-5 border-b border-[var(--ib-line)] bg-[var(--ib-card)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">



              <div className="flex items-center gap-3">



                <div className="p-2 bg-[var(--ib-ok)]/10 rounded-xl">



                  <ClipboardList className="w-5 h-5 text-[var(--ib-ok)]" />



                </div>



                <div className="space-y-0.5 min-w-0">



                  <h2 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--ib-ink)]">



                    Step {currentData?.step_number}: {currentData?.title}



                  </h2>



                  <p className="text-[12px] font-jetbrains-mono font-medium text-[var(--ib-ok)] uppercase tracking-[0.08em]">{currentData?.stage}</p>



                </div>



              </div>



            </div>







            <div className="flex-1 overflow-y-auto bg-[var(--ib-card)] p-4 sm:p-5 md:p-6 lg:p-7 custom-thin-scrollbar min-w-0">



                            <div className="w-full min-w-0">
                            <AuditStepGuidanceView
                data={currentData || {}}
                emptyMessage="No guidance was generated for this step. Please retry."
              />
                            </div>







              <div className="mt-8 pt-6 border-t border-[var(--ib-line)] flex items-center justify-between">



                <button



                  onClick={handlePrevStep}



                  disabled={currentStepNumber === 1}



                  className="px-6 py-3 rounded-xl border border-[var(--ib-line)] cursor-pointer text-[var(--ib-mute)] font-bold uppercase tracking-widest text-xs hover:bg-[var(--ib-ink)] hover:text-[var(--ib-ink)] transition-all disabled:opacity-30 disabled:pointer-events-none"



                >



                  Previous Step



                </button>







                {currentData?.next_step_available && currentStepNumber < 13 && (



                  <button



                    onClick={handleNextStep}



                    disabled={isFetchingStep}



                    className="px-6 py-3 cursor-pointer bg-[var(--ib-ok)] text-[var(--ib-ink)] rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[var(--ib-ok)] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"



                  >



                    {isFetchingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : "Next Step"} <ArrowRight className="w-4 h-4" />



                  </button>



                )}



              </div>



            </div>



          </div>



        ) : (



          <div className="flex-1 flex flex-col items-center justify-center text-[var(--ib-mute)] p-6 md:p-8 text-center">



            <div className="w-16 h-16 bg-[var(--ib-bg)] rounded-2xl flex items-center justify-center border border-[var(--ib-line)] mb-4">



              <Info className="w-8 h-8 text-[#4B4B4B]" />



            </div>



            <p className="mb-6 font-medium text-sm text-[var(--ib-mute)]">Failed to load Step {currentStepNumber}. Please try again.</p>



            <button onClick={() => fetchStep(currentStepNumber, lockedContext)} className="px-6 py-3 bg-[var(--ib-acc)] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-92 transition-all">



              Retry Step



            </button>



          </div>



        )}



      </div>



    );



  };



  const renderBottomChat = () => {



    return (



      <div className="bg-[var(--ib-card)] w-full border border-[var(--ib-line)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">



        <div className="p-2 sm:p-3 md:p-5 flex items-center gap-4 border-b border-[var(--ib-line)] bg-[var(--ib-card)]">

          <div className="p-2 bg-[var(--ib-accbg)] text-[var(--ib-acc)] rounded-xl">

            <Sparkles className="w-5 h-5 text-black" />

          </div>

          <div>
            <div className="text-[12px] sm:text-sm font-semibold text-[var(--ib-ink)] uppercase tracking-wider">{t('auditLens.chatTitle')}</div>
            <p className="text-[12px] text-[var(--ib-mute)] font-medium tracking-wide mt-0.5">{t('auditLens.chatDesc')}</p>
          </div>

        </div>



        <div className="p-3 sm:p-4 md:p-6 space-y-5 w-full min-w-0">

          <div className="flex flex-col space-y-6 min-w-0">

            {(chatHistory.length > 0 || isSendingChat) && (

              <div className="w-full min-w-0 bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-2xl p-2 sm:p-3 md:p-6 overflow-y-auto max-h-[400px] flex flex-col space-y-4 md:space-y-6 custom-thin-scrollbar animate-in slide-in-from-bottom-4 duration-300">

                {chatHistory.map((msg, idx) => (

                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} min-w-0`}>

                    <div className={`max-w-full p-2 sm:p-3 md:p-4 rounded-2xl text-[13px] sm:text-sm md:text-[14px] font-medium leading-[1.6] min-w-0 ${msg.role === 'user' ? 'bg-[var(--ib-acc)] text-white rounded-tr-none shadow-[0_4px_15px_-3px_rgba(27, 77, 219,0.35)]' : 'bg-[var(--ib-card)] border border-[var(--ib-line)] text-[var(--ib-dktx)] rounded-tl-none w-full'}`}>

                      <div className={`prose prose-sm max-w-none w-full min-w-0 ${msg.role === 'user' ? 'text-black' : 'prose-invert text-[var(--ib-dktx)]'}`}>

                        <ReactMarkdown

                          remarkPlugins={[remarkGfm]}

                          components={{

                            h1: (props) => <span className={`block font-semibold mb-2 tracking-tight text-[16px] sm:text-[18px] md:text-[20px] leading-[1.3] ${msg.role === 'user' ? 'text-black' : 'text-[var(--ib-ink)]'}`} {...props} />,

                            h2: (props) => <span className={`block font-semibold mt-3 mb-1.5 tracking-tight text-[14px] sm:text-[15px] md:text-[16px] leading-[1.4] ${msg.role === 'user' ? 'text-black' : 'text-[var(--ib-ink)]'}`} {...props} />,

                            h3: (props) => <span className={`block font-semibold mt-2.5 mb-1 tracking-tight text-[13px] sm:text-[14px] leading-[1.4] ${msg.role === 'user' ? 'text-black' : 'text-[var(--ib-ink)]'}`} {...props} />,

                            p: (props) => <p className={`mb-2 text-[13px] sm:text-sm md:text-[14px] leading-[1.6] ${msg.role === 'user' ? 'text-[var(--ib-ink)] font-medium' : 'text-[var(--ib-mute)]'}`} {...props} />,

                            ul: ({node, className, ...props}: any) => <ul className={`list-disc pl-4 mb-3 space-y-1 ${msg.role === 'user' ? 'text-black' : 'text-[var(--ib-mute)]'} ${className || ''}`} {...props} />,



                            ol: ({node, className, ...props}: any) => <ol className={`list-decimal pl-4 mb-3 space-y-1 ${msg.role === 'user' ? 'text-black' : 'text-[var(--ib-mute)]'} ${className || ''}`} {...props} />,

                            

                            li: ({node, className, ...props}: any) => <li className={`mb-1 text-[13px] sm:text-sm md:text-[14px] leading-[1.6] ${msg.role === 'user' ? 'text-black' : 'text-[var(--ib-mute)]'} ${className || ''}`} {...props} />,

                            table: ({ ...props }) => (

                              <div className="scrollable-table my-4 w-full overflow-x-auto rounded-xl border border-[var(--ib-line)] pb-2">

                                <table className="w-full text-left border-collapse text-sm md:text-base min-w-[500px]" {...props} />

                              </div>

                            ),

                            th: ({ ...props }) => <th className="border-b border-white/20 px-3 py-2 md:px-4 md:py-3 bg-[var(--ib-card)] font-bold text-[var(--ib-ink)] break-normal" {...props} />,

                            td: ({ ...props }) => <td className="border-b border-[var(--ib-line)] px-3 py-2 md:px-4 md:py-3 break-normal align-top text-[var(--ib-mute)]" {...props} />,

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



                    <div className="flex items-center gap-3 p-3 bg-[var(--ib-card)] border border-[var(--ib-acc)]/20 rounded-2xl rounded-tl-none shadow-[0_0_15px_rgba(27, 77, 219,0.1)]">



                      <span className="text-[10px] md:text-xs font-semibold text-[var(--ib-ink)] uppercase tracking-wider animate-pulse leading-none">



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



                  className="w-full bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-2xl p-4 md:p-5 pr-14 text-sm focus:outline-none focus:border-[var(--ib-acc)] focus:ring-2 focus:ring-[var(--ib-acc)]/30 transition-all font-medium text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)]"



                />



                <button



                  type="submit"



                  disabled={isSendingChat || !chatMessage.trim()}



                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[var(--ib-acc)] text-white hover:bg-[var(--ib-acc)]/90 disabled:opacity-30 disabled:hover:bg-[var(--ib-acc)] rounded-xl transition-all"



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



    <div className="w-full mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 bg-[var(--ib-bg)] min-h-screen p-2 md:p-8">
      <ActivityTracker
        source="AI_TOOL"
        aiToolId="AUDIT_LENS"
        resourceLabel="Audit Lens"
        sessionKey="ai_audit_lens"
      />



      {/* Header */}
      <header className="space-y-4 px-2 sm:px-0 mb-12 mt-20">
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1 border-[var(--ib-acc)] text-[var(--ib-acc)] border border-[var(--ib-acc)]/20 rounded-full">
            <span className="text-[var(--ib-acc)] text-[10px] font-black uppercase tracking-[0.3em]">{t('auditLens.badge')}</span>
          </div>
        </div>
        <h1 className="text-5xl lg:text-[52px] font-semibold text-[var(--ib-ink)] leading-[1.1] tracking-tight mb-8 text-center">
          {t('auditLens.title')}
        </h1>
        <p className="text-[var(--ib-mute)] text-sm lg:text-lg max-w-4xl mx-auto text-center leading-relaxed mb-12 font-inter">
          <span className="font-semibold text-[var(--ib-ink)]/80 block mb-2">{t('auditLens.subtitle')}</span>
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



          background: var(--ib-ink);



          border-radius: 10px;



        }



        .custom-thin-scrollbar::-webkit-scrollbar-thumb:hover {



          background: #4B4B4B;



        }



        .audit-lens-md > :first-child {
          margin-top: 0 !important;
        }

        .audit-lens-md > :last-child {
          margin-bottom: 0 !important;
        }

        .audit-lens-case p + p {
          margin-top: 0.5rem;
        }



      `}</style>



    </div>



  );



};







export default AuditLensPage;



