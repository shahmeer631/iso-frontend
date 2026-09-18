



"use client";



import React, { useState, useEffect, useRef } from "react";

import { motion } from "framer-motion";

import {

  Wand2,

  Sparkles,

  CheckCircle2,

  FileText,

  Building2,

  Shield,

  Settings,

  MessageSquare,

  ArrowRight,

  Send,

  Loader2,

  PlusCircle,

  Info,

  X,

  Type,

  Link as LinkIcon,

  Copy,

} from "lucide-react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import NavigatorDocumentView, {
  extractIsoStandardBadge,
  getNavigatorPlainText,
} from "@/components/AIAssistant/NavigatorDocumentView";

import { useRouter, useParams } from 'next/navigation';

import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import {

  setStep,

  updateFormData,

  setGeneratedDocument,

  addChatMessage,

  setSessionId,

  resetNavigator,

} from "@/lib/redux/features/isoNavigatorSlice";

import {

  useGenerateDocumentMutation,

  useChatSimpleMutation,

  useGenerateContextSuggestionsMutation,

  useGetISOSuggestionsMutation,

} from "@/lib/redux/api/isoNavigatorApi";

import { ISONavigatorFormData } from "@/types/iso-navigator";

import FullPageLoader from "@/components/Shared/FullPageLoader";

import Steps, { Step } from 'rc-steps';

import 'rc-steps/assets/index.css';

import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";


import { Link } from "lucide-react";







export default function ISONavigator() {

  const dispatch = useAppDispatch();

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




  const { currentStep, formData, generatedDocument, chatHistory, sessionId } =

    useAppSelector((state) => state.isoNavigator);



  const TONES = [

    t('isoNavigator.tones.professional'),

    t('isoNavigator.tones.academic'),

    t('isoNavigator.tones.concise'),

    t('isoNavigator.tones.friendly'),

  ];

  const LANGUAGES = [

    t('isoNavigator.languages.english'),

    t('isoNavigator.languages.spanish'),

    t('isoNavigator.languages.french'),

    t('isoNavigator.languages.german'),

  ];



  const [generateDocument, { isLoading: isGenerating }] =

    useGenerateDocumentMutation();

  const [chatSimple, { isLoading: isChatting }] = useChatSimpleMutation();

  const [generateContextSuggestions, { isLoading: isFetchingSuggestions }] =

    useGenerateContextSuggestionsMutation();

  const [getISOSuggestions, { isLoading: isFetchingISOSuggestions }] =

    useGetISOSuggestionsMutation();



  const [chatInput, setChatInput] = useState("");

  const [contextInput, setContextInput] = useState("");

  const [contextInputType, setContextInputType] = useState<'text' | 'url'>('text');

  const [contextSuggestions, setContextSuggestions] = useState<any[]>([]);

  const [isoSuggestions, setIsoSuggestions] = useState<any[]>([]);

  const [selectedISODetail, setSelectedISODetail] = useState<any>(null);

  const selectedISO = isoSuggestions?.find((iso) => iso?.standard === formData?.specific_requirements);

  const [isoMessageIndex, setIsoMessageIndex] = useState(0);

  const [contextMessageIndex, setContextMessageIndex] = useState(0);



  const LOADING_MESSAGES = [

    "Loading personalized suggestions",

    "AI is thinking",

    "Matching ISO standards",

    "Preparing recommendations",

  ];

  const suggestionRequestId = useRef(0);

  const isoSuggestionRequestId = useRef(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isUserScrolledUp = useRef(false);

  const [chatLoaderIdx, setChatLoaderIdx] = useState(0);

  const CHAT_LOADER_PHRASES = [

    "AI is thinking...",

    "Analyzing your context...",

    "Mapping compliance protocols...",

    "Formulating expert response...",

    "Double checking standards...",

  ];



  const scrollToBottom = () => {

    const container = chatContainerRef.current;

    if (!container || isUserScrolledUp.current) return;

    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

  };



  const orgContextToString = (ctx: any) => {

    if (!ctx) return "";

    if (typeof ctx === "string") return ctx;

    // Order: what, where, why, when, whom

    const parts = [ctx.what, ctx.where, ctx.why, ctx.when, ctx.whom]

      .filter(Boolean)

      .map((s: string) => s.trim())

      .map((s: string) => (/[.?!]$/.test(s) ? s : s + "."));

    return parts.join(" ");

  };







  useEffect(() => {

    // When a new message is added, reset flag and scroll inside the container only

    isUserScrolledUp.current = false;

    const container = chatContainerRef.current;

    if (container) {

      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

    }

  }, [chatHistory.length]);



  // Cycle through ISO loading messages

  useEffect(() => {

    if (!isFetchingISOSuggestions) {

      setIsoMessageIndex(0);

      return;

    }

    const timer = setInterval(() => {

      setIsoMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);

    }, 1500);

    return () => clearInterval(timer);

  }, [isFetchingISOSuggestions]);



  // Cycle through context loading messages

  useEffect(() => {

    if (!isFetchingSuggestions) {

      setContextMessageIndex(0);

      return;

    }

    const timer = setInterval(() => {

      setContextMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);

    }, 1500);

    return () => clearInterval(timer);

  }, [isFetchingSuggestions]);



  // Cycle through chat loading messages

  useEffect(() => {

    if (!isChatting) { setChatLoaderIdx(0); return; }

    const timer = setInterval(() => {

      setChatLoaderIdx((prev) => (prev + 1) % CHAT_LOADER_PHRASES.length);

    }, 1500);

    return () => clearInterval(timer);

  }, [isChatting]);



  const handleChatScroll = () => {

    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // If user scrolled more than 80px from bottom, consider them scrolled up

    isUserScrolledUp.current = distanceFromBottom > 80;

  };



  // Fetch suggestions from API using Redux RTK

  const fetchContextSuggestions = async (input: string) => {

    if (!input.trim()) {

      setContextSuggestions([]);

      return;

    }



    // track request id so we can ignore stale responses/errors

    const reqId = ++suggestionRequestId.current;

    try {

      const isUrl = input.startsWith('http');

      const result = await generateContextSuggestions({

        text: isUrl ? undefined : input,

        url: isUrl ? input : undefined,

      }).unwrap();



      // ignore if a newer request was issued

      if (reqId !== suggestionRequestId.current) return;

      console.log('Context suggestions result:', result);

      setContextSuggestions(result || []);

    } catch (error: any) {

      // ignore errors for stale requests

      if (reqId !== suggestionRequestId.current) return;

      const message =
        error?.data?.message ||
        error?.error ||
        (typeof error?.status === 'number' ? `Request failed (${error.status})` : null) ||
        t('isoNavigator.failedGenerate');

      console.error("Error fetching context suggestions:", message, error);

      toast.error(message);

      setContextSuggestions([]);

    }

  };





  // Fetch ISO suggestions based on organization context

  const fetchISOSuggestions = async (category: string) => {

    if (!category.trim()) {

      setIsoSuggestions([]);

      return;

    }



    const reqId = ++isoSuggestionRequestId.current;

    try {

      const result = await getISOSuggestions({

        category: category,

      }).unwrap();



      if (reqId !== isoSuggestionRequestId.current) return;



      // Extremely robust parsing of suggestions array from any API payload format

      let suggestions: any[] = [];

      if (Array.isArray(result)) {

        suggestions = result;

      } else if (result && typeof result === 'object') {

        const anyResult = result as any;

        suggestions = anyResult.data?.suggestions || anyResult.suggestions || anyResult.data || [];

      }



      console.log('Parsed ISO suggestions:', suggestions);

      setIsoSuggestions(Array.isArray(suggestions) ? suggestions : []);

    } catch (error: any) {

      if (reqId !== isoSuggestionRequestId.current) return;

      const message =
        error?.data?.message ||
        error?.error ||
        (typeof error?.status === 'number' ? `Request failed (${error.status})` : null) ||
        "Failed to fetch ISO suggestions";

      console.error("Error fetching ISO suggestions:", message, error);

      setIsoSuggestions([]);

      toast.error(message);

    }

  };



  // ISO suggestions are fetched from user's typing in the 'specific_requirements' input.

  // Do not auto-fetch using the organization context when entering Step 2.





  const handleUpdateFormData = (data: Partial<ISONavigatorFormData>) =>

    dispatch(updateFormData(data));

  const handleNextStep = () => {

    if (currentStep === 1) {

      const ctx = typeof formData.organization_context === 'string'

        ? (formData.organization_context || '').trim()

        : (formData.organization_context?.what || '').trim();

      if (ctx.length < 10) {

        toast.error(t('isoNavigator.orgContextMinLength'));

        return;

      }

    } else if (currentStep === 2) {

      if ((formData.specific_requirements || '').trim().length < 5) {

        toast.error(t('isoNavigator.stdReqMinLength'));

        return;

      }

    }

    dispatch(setStep(currentStep + 1));

  };

  const handlePrevStep = () => dispatch(setStep(currentStep - 1));



  const handleGenerate = async () => {

    try {

      const orgCtxText = orgContextToString(formData.organization_context);

      const structured =
        typeof formData.organization_context === "object" && formData.organization_context
          ? formData.organization_context
          : formData.organization_context_structured;

      const payload = {
        organization_context: orgCtxText,
        organization_context_structured: structured || undefined,
        specific_requirements: formData.specific_requirements,
        tone: formData.tone || "professional",
        language: formData.language || "English",
        output_type: formData.output_type || formData.document_title || "Policy Document",
        document_title: formData.document_title || formData.output_type || "Policy Document",
        clause: formData.clause || undefined,
        document_taxonomy: formData.document_taxonomy || undefined,
      } as any;

      const response = await generateDocument(payload).unwrap();

      const doc = response?.data;
      const content = (doc?.content || "").trim();
      const structuredLen =
        (doc?.documented_template || "").trim().length +
        (doc?.implementation_guidance || "").trim().length +
        (doc?.daily_usability || "").trim().length;

      if (!response?.success || !doc || (content.length < 40 && structuredLen < 80)) {
        toast.error(t('isoNavigator.emptyGenerate') || t('isoNavigator.failedGenerate'));
        return;
      }

      dispatch(setGeneratedDocument(doc));

      dispatch(
        setSessionId(
          doc.generation_timestamp ||
          Math.random().toString(36).substring(7),
        ),
      );

    } catch (error: any) {

      console.error("Failed to generate document:", error);

      if (error?.status === 403 || error?.data?.statusCode === 403 || error?.data?.message?.includes("ULTRA plan")) {

        toast.error(error?.data?.message || t('isoNavigator.upgradeUltra'));

        router.push(`/${lang}/pricing`);

      } else {

        toast.error(error?.data?.message || t('isoNavigator.failedGenerate'));

      }

    }

  };



  const handleSendChat = async (text?: string) => {

    const messageContent = text || chatInput;

    if (!messageContent.trim()) return;



    dispatch(addChatMessage({ role: "user", content: messageContent }));

    setChatInput("");

    // Reset scroll flag so the response scrolls to bottom

    isUserScrolledUp.current = false;



    try {

      const orgCtxText = orgContextToString(formData.organization_context);

      const contextStr = generatedDocument

        ? generatedDocument.content

        : `ISO Navigator assistant. Organization Context: ${orgCtxText || "not selected"} Standard: ${formData.specific_requirements || "not specified"}.`;



      const response = await chatSimple({

        messages: [{ content: messageContent }],

        context: {

          full_document_context: contextStr

        },

        session_id: sessionId || ("iso_" + Math.random().toString(36).substring(7)),

      }).unwrap();



      // Assuming assistant response is the last message in the returned messages array

      const aiResponse = response.messages?.[response.messages.length - 1]?.content || response.data?.response;



      if (aiResponse) {

        dispatch(

          addChatMessage({ role: "ai", content: aiResponse }),

        );

        if (response.session_id)

          dispatch(setSessionId(response.session_id));



        // Ensure we scroll to bottom when AI response arrives

        isUserScrolledUp.current = false;

        setTimeout(() => {

          scrollToBottom();

        }, 100);

      }

    } catch (error: any) {

      console.error("Chat failed:", error);

      if (error?.status === 403 || error?.data?.statusCode === 403 || error?.data?.message?.includes("ULTRA plan")) {

        toast.error(error?.data?.message || t('isoNavigator.upgradeUltra'));

        router.push(`/${lang}/pricing`);

      } else {

        toast.error(t('isoNavigator.chatError'));

      }

      dispatch(

        addChatMessage({

          role: "ai",

          content: t('isoNavigator.chatError'),

        }),

      );

    }

  };



  const handleReset = () => dispatch(resetNavigator());



  return (

    <div className="w-full mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 bg-[#0A0F1C] min-h-screen p-2 md:p-8 overflow-x-hidden">

      <FullPageLoader

        isLoading={isGenerating}

        title={t('isoNavigator.loaderTitle')}

        description={t('isoNavigator.loaderDesc')}

        steps={[

          t('isoNavigator.loaderStep1'),

          t('isoNavigator.loaderStep2'),

          t('isoNavigator.loaderStep3'),

        ]}

      />



      {/* Header */}
      <header className="space-y-4 px-2 sm:px-0 mb-12 mt-20">
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1 text-[#00f0ff] border border-[#00f0ff]/20 rounded-full">
            <span className=" text-[10px] font-black uppercase tracking-[0.3em]">{t('isoNavigator.badge')}</span>
          </div>
        </div>
        <h1 className="space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-semibold text-white text-center leading-[1.1] tracking-tight mb-8">
          {t('isoNavigator.title')}
        </h1>
        <p className="text-[#A1A1A6] text-sm lg:text-lg max-w-4xl mx-auto text-center leading-relaxed mb-12 font-inter">
          <span className="font-semibold text-white/80 block mb-2">{t('isoNavigator.subtitle')}</span>
          {t('isoNavigator.description')}
        </p>
      </header>



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-4 items-stretch">

        {/* Left Column - Form */}

        <div className="lg:col-span-4 bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col">

          <div className="p-5 md:p-6 flex items-center gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50">

            <div className="p-2 bg-[#00f0ff] text-[#0F111A]/10 rounded-xl">

              <Wand2 className="w-5 h-5 text-black" />

            </div>

            <h2 className="text-base md:text-lg font-medium text-[#F3F4F6] uppercase tracking-wider">

              {t('isoNavigator.dataGenerator')}

            </h2>

          </div>



          <div className="p-5 md:p-6 flex-1 space-y-8 overflow-y-auto custom-thin-scrollbar">

            {/* Stepper Progress using rc-steps */}
            <div className="mb-14 px-4 stepper-container">
              <Steps
                current={currentStep - 1}
                labelPlacement="vertical"
              >
                <Step
                  title={<span className={`text-[8px] font-black uppercase tracking-[0.25em] ${currentStep === 1 ? 'text-brand-cyan' : 'text-[#14B8A6]'}`}>{t('isoNavigator.orgContext')}</span>}
                  icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${currentStep > 1 ? "bg-brand-cyan text-[#0F111A] text-white shadow-[0_0_20px_rgba(63,62,237,0.55)]" :
                      "bg-[#0A0F1C] border border-[#1E293B]"
                      }`}>
                      {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : <Building2 className="w-5 h-5 text-black!" />}
                    </div>
                  }
                />
                <Step
                  title={<span className={`text-[8px] font-black uppercase tracking-[0.25em] ${currentStep === 2 ? 'text-brand-cyan' : 'text-[#4B5563]'}`}>{t('isoNavigator.isoStandards')}</span>}
                  icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${currentStep > 2 ? "bg-brand-cyan text-[#0F111A] text-white shadow-[0_0_20px_rgba(63,62,237,0.55)]" :
                      currentStep === 2 ? "bg-brand-cyan text-[#0F111A] text-white shadow-[0_0_20px_rgba(63,62,237,0.55)]" :
                        "bg-[#0A0F1C] border border-[#1E293B] text-[#4B5563]"
                      }`}>
                      {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                  }
                />
                <Step
                  title={<span className={`text-[8px] font-black uppercase tracking-[0.25em] ${currentStep === 3 ? 'text-brand-cyan' : 'text-[#4B5563]'}`}>{t('isoNavigator.documentsLabel')} & {t('isoNavigator.recordsLabel')}</span>}
                  icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${currentStep > 3 ? "bg-brand-cyan text-[#0F111A] text-white shadow-[0_0_20px_rgba(63,62,237,0.55)]" :
                      currentStep === 3 ? "bg-brand-cyan text-[#0F111A] text-white shadow-[0_0_20px_rgba(63,62,237,0.55)]" :
                        "bg-[#0A0F1C] border border-[#1E293B] text-[#4B5563]"
                      }`}>
                      {currentStep > 3 ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                  }
                />
              </Steps>
            </div>



            {/* Step 1: Organization Context */}

            <div

              className={`space-y-3 md:space-y-4 ${currentStep !== 1 ? "opacity-50 pointer-events-none" : ""}`}

            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#00f0ff] text-[#00f0ff] border border-brand-cyan/20">

                    <Building2 className="w-3.5 h-3.5 text-black" />

                  </div>

                  <label className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-1.5">

                    01. {t('isoNavigator.orgContext')}

                    <span

                      title={t('dynamic.dyn_simplyenteryourwebsite_538')}

                      className="cursor-help text-brand-cyan hover:text-[#14B8A6] transition-colors"

                    >

                      <Info className="w-3.5 h-3.5" />

                    </span>

                  </label>

                </div>

                {formData.organization_context && currentStep > 1 && (

                  <CheckCircle2 className="w-5 h-5 text-[#14B8A6]" />

                )}

              </div>



              {currentStep === 1 ? (

                <>

                  <div className="flex bg-[#0A0F1C] p-1 rounded-xl border border-[#1E293B] mb-4">

                    <button
                      onClick={() => setContextInputType('text')}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${contextInputType === 'text' ? 'bg-[#1E293B] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      <Type className="w-4 h-4" /> {t('isoNavigator.textTab')}</button>
                    <button
                      onClick={() => setContextInputType('url')}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${contextInputType === 'url' ? 'bg-[#1E293B] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      <Link className="w-4 h-4" /> {t('isoNavigator.urlTab')}
                    </button>
                  </div>



                  {contextInputType === 'text' ? (

                    <textarea

                      placeholder={t('isoNavigator.describeOrg')}

                      minLength={10}

                      className="w-full h-32 bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-medium text-[#F3F4F6] placeholder-[#4B5563] resize-none"

                      value={contextInput}

                      onChange={(e) => setContextInput(e.target.value)}

                    />

                  ) : (

                    <input

                      type="url"

                      placeholder="e.g. https://example.com"

                      className="w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-medium text-[#F3F4F6] placeholder-[#4B5563]"

                      value={contextInput}

                      onChange={(e) => setContextInput(e.target.value)}

                    />

                  )}



                  <button
                    onClick={() => fetchContextSuggestions(contextInput)}
                    disabled={isFetchingSuggestions || !contextInput.trim()}
                    className="w-full py-3 bg-cyan-300 text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-cyan-300 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFetchingSuggestions ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isFetchingSuggestions ? t('isoNavigator.analyzing') : t('isoNavigator.analyzeContext')}
                  </button>



                  <div className="space-y-3">

                    <p className="text-[10px] font-medium text-[#4B5563] uppercase tracking-[0.3em]">

                      {t('isoNavigator.suggestions')}

                      {isFetchingSuggestions && <span className="ml-2 inline-block text-[8px] text-brand-cyan">({LOADING_MESSAGES[contextMessageIndex]})</span>}

                    </p>

                    {contextSuggestions.map((sug) => {

                      const isSelected = typeof formData.organization_context === 'object' && formData.organization_context?.what === sug.what;

                      return (

                        <div

                          key={sug.id}

                          onClick={() => {

                            handleUpdateFormData({

                              organization_context: sug,

                            });

                            setContextInput("");

                            // Auto-call ISO suggestions API with selected context

                            fetchISOSuggestions(sug.what || orgContextToString(sug));

                          }}

                          className={`bg-[#0A0F1C] border rounded-2xl p-4 text-sm cursor-pointer transition-all flex gap-4 group ${isSelected

                            ? "border-[#00f0ff] bg-gray-800 text-[#0F111A]/5 shadow-[0_0_20px_rgba(63,62,237,0.1)]"

                            : "border-[#1E293B] hover:border-[#4B5563] hover:bg-[#232736]"

                            }`}

                        >

                          <span

                            className={`font-jetbrains-mono text-xs transition-colors ${isSelected

                              ? "text-gray-600"

                              : "text-[#4B5563] group-hover:text-[#9CA3AF]"

                              }`}

                          >

                            [{sug.id.toString().padStart(2, '0')}]

                          </span>

                          <p

                            className={`leading-relaxed font-medium ${isSelected

                              ? "text-[#F3F4F6]"

                              : "text-[#9CA3AF]"

                              }`}

                          >

                            {sug.what}

                          </p>

                        </div>

                      );

                    })}

                  </div>



                  <button

                    onClick={handleNextStep}

                    disabled={!formData.organization_context || (typeof formData.organization_context === 'string' && formData.organization_context.trim().length < 10)}

                    className="w-full bg-[#00f0ff] text-[#0F111A]   disabled:opacity-30  rounded-2xl p-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_-5px_rgba(63,62,237,0.3)] active:scale-[0.98]"

                  >

                    {t('isoNavigator.continue')} <ArrowRight className="w-4 h-4" />

                  </button>

                </>

              ) : (

                <div

                  onClick={() => dispatch(setStep(1))}

                  className="bg-brand-cyan text-[#0F111A]/5 border border-brand-cyan/30 rounded-2xl p-5 space-y-3 cursor-pointer hover:bg-brand-cyan hover:text-[#0F111A]/10 transition-all group pointer-events-auto"

                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 text-[10px] font-medium text-brand-cyan uppercase tracking-[0.2em]">

                      <CheckCircle2 className="w-3.5 h-3.5" />

                      {t('isoNavigator.selectedStandard')}

                    </div>

                    <span className="text-[10px] font-medium text-[#4B5563] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{t('isoNavigator.editNode')}</span>

                  </div>

                  <p className="text-sm font-medium text-[#F3F4F6] leading-relaxed">

                    {orgContextToString(formData?.organization_context as any)}

                  </p>

                </div>

              )}

            </div>



            {/* Step 2: ISO Standards */}

            <div

              className={`space-y-6 ${currentStep !== 2 ? "opacity-50 pointer-events-none" : ""} ${currentStep > 1 ? "pt-6 border-t border-[#1E293B]" : ""}`}

            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20">

                    <Shield className="w-3.5 h-3.5" />

                  </div>

                  <label className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">

                    02. {t('isoNavigator.isoStandards')}

                  </label>

                </div>

                {formData.specific_requirements && currentStep > 2 && (

                  <CheckCircle2 className="w-5 h-5 text-[#14B8A6]" />

                )}

              </div>



              {currentStep === 2 ? (

                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">

                  <div className="space-y-3">

                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">

                      {t('isoNavigator.recommendedIso')}

                      {isFetchingISOSuggestions && <span className="ml-2 inline-block text-[8px] text-[#14B8A6]">({t('isoNavigator.loadingLabel')})</span>}

                    </p>

                    <div className="space-y-2">

                      {isoSuggestions?.length > 0 ? (

                        isoSuggestions.map((iso, index) => (

                          <div

                            key={index}

                            onClick={() =>

                              handleUpdateFormData({

                                specific_requirements: iso?.standard,

                              })

                            }

                            className={`bg-[#0A0F1C] border rounded-2xl p-3 text-xs cursor-pointer transition-all flex gap-3 items-start ${formData?.specific_requirements === iso?.standard

                              ? "border-[#00f0ff] bg-[#00f0ff]/10 text-[#0F111A]/5 shadow-[0_0_20px_rgba(63,62,237,0.1)]"

                              : "border-[#1E293B] hover:border-[#4B5563] hover:bg-[#232736]"

                              }`}

                          >

                            <div className="flex-1 min-w-0">

                              <div className="flex items-start justify-between gap-2">

                                <div className="flex-1">

                                  <p className={`font-medium text-[11px] ${formData?.specific_requirements === iso?.standard

                                    ? "text-[#9CA3AF]"

                                    : "text-[#F3F4F6]"

                                    }`}>

                                    {iso?.standard}

                                  </p>

                                  <p className={`text-[10px] font-medium ${formData?.specific_requirements === iso?.standard

                                    ? "text-[#9CA3AF]"

                                    : "text-[#9CA3AF]"

                                    }`}>

                                    {iso?.title}

                                  </p>

                                </div>

                              </div>

                              <p className={`text-[9px] leading-relaxed line-clamp-2 mt-2 ${formData?.specific_requirements === iso?.standard

                                ? "text-[#9CA3AF]"

                                : "text-[#4B5563]"

                                }`}>

                                {iso?.relevance}

                              </p>

                            </div>

                            <button

                              onClick={(e) => {

                                e.stopPropagation();

                                setSelectedISODetail(iso);

                              }}

                              className="shrink-0 p-1.5 hover:bg-brand-cyan hover:text-[#0F111A]/20 rounded-lg transition-colors"

                            >

                              <Info className={`w-4 h-4 ${formData?.specific_requirements === iso?.standard

                                ? "text-white"

                                : "text-[#4B5563] hover:text-[#9CA3AF]"

                                }`} />

                            </button>

                          </div>

                        ))

                      ) : (

                        formData.organization_context && (

                          <p className="text-[10px] text-[#4B5563] py-4 text-center">

                            {isFetchingISOSuggestions ? LOADING_MESSAGES[isoMessageIndex] : t('isoNavigator.noSugFound')}

                          </p>

                        )

                      )}

                    </div>

                  </div>



                  <div className="flex gap-4">

                    <button
                      onClick={handlePrevStep}
                      className="px-6 py-4 bg-transparent border border-[#1E293B] hover:bg-[#232736] text-[#9CA3AF] rounded-2xl text-sm font-medium uppercase tracking-widest transition-all"
                    >
                      {t('isoNavigator.back')}
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={(formData.specific_requirements || '').trim().length < 5}
                      className="flex-1 bg-[#00f0ff] text-[#0F111A]  hover:text-[#0F111A]/90 disabled:opacity-30  rounded-2xl p-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_-5px_rgba(63,62,237,0.3)] active:scale-[0.98]"
                    >
                      {t('isoNavigator.continue')} <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              ) : (

                <div

                  onClick={() => dispatch(setStep(2))}

                  className="bg-[#14B8A6]/5 border border-[#14B8A6]/30 rounded-2xl p-5 space-y-3 cursor-pointer hover:bg-[#14B8A6]/10 transition-all group pointer-events-auto"

                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 text-[10px] font-medium text-[#14B8A6] uppercase tracking-[0.2em]">

                      <CheckCircle2 className="w-3.5 h-3.5" />

                      {t('isoNavigator.selectedStandard')}

                    </div>

                    <span className="text-[10px] font-medium text-[#4B5563] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{t('isoNavigator.editNode')}</span>

                  </div>

                  <p className="text-sm font-medium text-[#F3F4F6] leading-relaxed">

                    {formData.specific_requirements}

                  </p>

                </div>

              )}

            </div>

            {/* Step 3: Documents & Records */}
            <div
              className={`space-y-6 ${currentStep !== 3 ? "opacity-50 pointer-events-none" : ""} ${currentStep > 2 ? "pt-6 border-t border-[#1E293B]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">
                    03. {t('isoNavigator.documentsLabel')} & {t('isoNavigator.recordsLabel')}
                  </label>
                </div>
                {formData.output_type && currentStep > 3 && (
                  <CheckCircle2 className="w-5 h-5 text-[#14B8A6]" />
                )}
              </div>

              {currentStep === 3 ? (
                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-4">
                    {selectedISO?.documents && selectedISO.documents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                          {t('isoNavigator.documentsLabel')}
                        </p>
                        <div className="space-y-2">
                          {selectedISO?.documents?.map((doc: any, index: number) => {
                            const isSelected = formData?.output_type === doc?.title;
                            return (
                              <div
                                key={`doc-${index}`}
                                onClick={() =>
                                  handleUpdateFormData({
                                    output_type: doc?.title,
                                    document_title: doc?.title,
                                    clause: doc?.clause || '',
                                    document_taxonomy:
                                      doc?.type === 'recommended'
                                        ? 'recommended'
                                        : 'mandatory_document',
                                  })
                                }
                                className={`bg-[#0A0F1C] border rounded-2xl p-3 text-xs cursor-pointer transition-all flex gap-3 items-center ${isSelected
                                  ? "border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_20px_rgba(63,62,237,0.1)]"
                                  : "border-[#1E293B] hover:border-[#4B5563] hover:bg-[#232736]"
                                  }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-[11px] ${isSelected ? "text-[#00f0ff]" : "text-[#F3F4F6]"}`}>
                                    {doc?.title}
                                  </p>
                                  <p className="text-[9px] text-[#9CA3AF] mt-1">
                                    {t('isoNavigator.clauseLabel')}: {doc?.clause}
                                  </p>
                                </div>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedISO?.records && selectedISO.records.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                          {t('isoNavigator.recordsLabel')}
                        </p>
                        <div className="space-y-2">
                          {selectedISO?.records?.map((rec: any, index: number) => {
                            const isSelected = formData?.output_type === rec?.title;
                            return (
                              <div
                                key={`rec-${index}`}
                                onClick={() =>
                                  handleUpdateFormData({
                                    output_type: rec?.title,
                                    document_title: rec?.title,
                                    clause: rec?.clause || '',
                                    document_taxonomy:
                                      rec?.type === 'recommended'
                                        ? 'recommended'
                                        : 'mandatory_record',
                                  })
                                }
                                className={`bg-[#0A0F1C] border rounded-2xl p-3 text-xs cursor-pointer transition-all flex gap-3 items-center ${isSelected
                                  ? "border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_20px_rgba(63,62,237,0.1)]"
                                  : "border-[#1E293B] hover:border-[#4B5563] hover:bg-[#232736]"
                                  }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-[11px] ${isSelected ? "text-[#00f0ff]" : "text-[#F3F4F6]"}`}>
                                    {rec?.title}
                                  </p>
                                  <p className="text-[9px] text-[#9CA3AF] mt-1">
                                    {t('isoNavigator.clauseLabel')}: {rec?.clause}
                                  </p>
                                </div>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(!selectedISO?.documents?.length && !selectedISO?.records?.length) && (
                      <p className="text-[10px] text-[#4B5563] py-4 text-center">
                        {t('isoNavigator.noDocsAvailable')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handlePrevStep}
                      className="px-6 py-4 bg-transparent border border-[#1E293B] hover:bg-[#232736] text-[#9CA3AF] rounded-2xl text-sm font-medium uppercase tracking-widest transition-all"
                    >
                      {t('isoNavigator.back')}
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !formData.output_type}
                      className="flex-1 bg-[#00f0ff] text-[#0F111A]  hover:text-[#0F111A]/90 disabled:opacity-30  rounded-2xl p-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_-5px_rgba(63,62,237,0.3)] active:scale-[0.98]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4" /> {t('isoNavigator.generating')}
                        </>
                      ) : (
                        <>
                          {t('isoNavigator.generateFramework')} <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                formData.output_type && (
                  <div
                    onClick={() => dispatch(setStep(3))}
                    className="bg-[#14B8A6]/5 border border-[#14B8A6]/30 rounded-2xl p-5 space-y-3 cursor-pointer hover:bg-[#14B8A6]/10 transition-all group pointer-events-auto"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-[#14B8A6] uppercase tracking-[0.2em]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('isoNavigator.outputStyle') || "Selected Output Type"}
                      </div>
                      <span className="text-[10px] font-medium text-[#4B5563] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{t('isoNavigator.editNode')}</span>
                    </div>
                    <p className="text-sm font-medium text-[#F3F4F6] leading-relaxed">
                      {formData.output_type}
                    </p>
                  </div>
                )
              )}
            </div>



            {generatedDocument && (

              <div className="mt-8 pt-8 border-t border-[#F1F5F9] animate-in zoom-in-95 duration-300">

                <button

                  onClick={handleReset}

                  className="w-full bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm font-bold transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"

                >

                  <PlusCircle className="w-4 h-4" />

                  {t('isoNavigator.newGeneration')}

                </button>

              </div>

            )}

          </div>

        </div>



        {/* Right Column - Document Viewer */}

        <div className="lg:col-span-8 bg-[#090D16] border border-[#1E293B] rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.25)] overflow-hidden min-h-[600px] lg:h-full flex flex-col relative min-w-0">

          <div className="lg:absolute lg:inset-0 flex flex-col w-full h-full">

            {!generatedDocument ? (

            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center">

              {isGenerating ? (

                <div className="space-y-6 flex flex-col items-center">

                  <div className="relative">

                    <motion.div

                      animate={{ rotate: 360 }}

                      transition={{

                        repeat: Infinity,

                        duration: 4,

                        ease: "linear",

                      }}

                      className="w-20 h-20 border-[2px] border-brand-cyan/10 border-t-[#00F0FF] rounded-full"

                    />

                    <div className="absolute inset-0 flex items-center justify-center">

                      <Loader2

                        className="w-6 h-6 text-brand-cyan animate-spin"

                      />

                    </div>

                  </div>

                  <h3 className="text-xl font-black text-[#F3F4F6] uppercase tracking-widest">{t('isoNavigator.architectingProtocol')}</h3>

                  <p className="text-sm text-[#9CA3AF] max-w-xs font-medium leading-relaxed">{t('isoNavigator.aiStructuring')}</p>

                </div>

              ) : (

                <>

                  <div className="w-24 h-24 mb-8 bg-[#0A0F1C] rounded-3xl flex items-center justify-center border border-[#1E293B] group hover:border-brand-cyan/50 transition-all duration-500">

                    <FileText

                      className="w-10 h-10 text-[#4B5563] group-hover:text-brand-cyan transition-colors"

                      strokeWidth={1.5}

                    />

                  </div>

                  <h3 className="text-lg font-black text-[#F3F4F6] uppercase tracking-[0.2em] mb-4">

                    {t('isoNavigator.awaitingInput')}

                  </h3>

                  <p className="text-sm max-w-sm text-[#9CA3AF] font-medium leading-relaxed">

                    {t('isoNavigator.awaitingInputDesc')}

                  </p>

                </>

              )}

            </div>

          ) : (

            <div className="flex flex-col h-full flex-1 animate-in fade-in duration-700">

              <div className="p-4 md:p-5 border-b border-[#1E293B] bg-[#111827]/80 backdrop-blur-[8px] shrink-0 flex flex-col gap-3">

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                  <div className="min-w-0 space-y-2">

                    <div className="flex flex-wrap items-center gap-2">

                      {(() => {
                        const isoBadge =
                          extractIsoStandardBadge(generatedDocument.metadata?.iso_standard) ||
                          extractIsoStandardBadge(generatedDocument.metadata?.grounded_standard) ||
                          extractIsoStandardBadge(formData.specific_requirements);
                        return isoBadge ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#1D4ED8]/15 text-[#93C5FD] font-jetbrains-mono text-[12px] font-medium tracking-[0.02em] border border-[#3B82F6]/20">
                          {isoBadge}
                        </span>
                        ) : null;
                      })()}

                      {(formData.clause || generatedDocument.metadata?.clause) && (

                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#0F172A] text-[#BFDBFE] font-jetbrains-mono text-[12px] font-medium tracking-[0.02em] border border-[#1E293B]">

                          {t('isoNavigator.clauseLabel')} {formData.clause || generatedDocument.metadata?.clause}

                        </span>

                      )}

                      {(formData.document_taxonomy || generatedDocument.metadata?.document_taxonomy) && (

                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#FFFBEB]/10 text-[#FBBF24] text-[11px] font-medium leading-[1.3] border border-[#F59E0B]/20">

                          {(formData.document_taxonomy || generatedDocument.metadata?.document_taxonomy) === 'recommended'
                            ? 'Recommended'
                            : (formData.document_taxonomy || generatedDocument.metadata?.document_taxonomy) === 'mandatory_record'
                              ? (t('isoNavigator.recordsLabel') || 'Mandatory Record')
                              : (t('isoNavigator.documentsLabel') || 'Mandatory Document')}

                        </span>

                      )}

                    </div>

                    <h2 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#F8FAFC] break-words">

                      {generatedDocument.title}

                    </h2>

                    {(generatedDocument.generation_timestamp || generatedDocument.word_count) && (

                      <p className="text-[11px] font-normal leading-[1.3] text-[#64748B]">

                        {[
                          generatedDocument.generation_timestamp
                            ? new Date(generatedDocument.generation_timestamp).toLocaleString()
                            : null,
                          typeof generatedDocument.word_count === "number" && generatedDocument.word_count > 0
                            ? `${generatedDocument.word_count} words`
                            : null,
                        ].filter(Boolean).join(" · ")}

                      </p>

                    )}

                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">

                    {typeof generatedDocument.confidence_score === 'number' && (

                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#ECFDF5]/10 text-[#6EE7B7] text-[11px] font-medium leading-[1.3] border border-[#047857]/30">

                        {Math.round((generatedDocument.confidence_score || 0) * 100)}% {t('isoNavigator.match')}

                      </span>

                    )}

                    <button

                      type="button"

                      onClick={() => {

                        navigator.clipboard.writeText(getNavigatorPlainText(generatedDocument));

                        toast.success(t('isoNavigator.textCopied'));

                      }}

                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-1.5 text-[12px] font-medium text-[#E2E8F0] hover:border-[#3B82F6]/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"

                    >

                      <Copy className="w-3.5 h-3.5" />

                      {t('isoNavigator.copyClipboard')}

                    </button>

                  </div>

                </div>

              </div>

              <div className="p-4 sm:p-5 md:p-6 lg:p-8 flex-1 overflow-y-auto overflow-x-hidden bg-[#090D16] custom-thin-scrollbar min-w-0">

                <NavigatorDocumentView
                  document={generatedDocument}
                  labels={{
                    sectionTemplate: t('isoNavigator.sectionTemplate'),
                    sectionImplementation: t('isoNavigator.sectionImplementation'),
                    sectionDailyUsability: t('isoNavigator.sectionDailyUsability'),
                    emptyGenerate: t('isoNavigator.emptyGenerate') || t('isoNavigator.failedGenerate'),
                    mappedProtocols: t('isoNavigator.mappedProtocols'),
                    clauseLabel: t('isoNavigator.clauseLabel'),
                    copyClipboard: t('isoNavigator.copyClipboard'),
                  }}
                />

              </div>

            </div>

          )}

        </div>

      </div>



      {/* Bottom Row - Ask AI */}

      <div className="mt-12 bg-[#131B2D] lg:col-span-12 border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="p-2 sm:p-3 md:p-6 flex items-center gap-4 border-b border-[#1E293B] bg-[#0A0F1C]/50">

          <div className="p-2 bg-[#00f0ff] text-[#0F111A]/10 rounded-xl">

            <Sparkles className="w-5 h-5 text-black" />

          </div>

          <div>
            <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-[#F3F4F6] uppercase tracking-wider">
              {t('isoNavigator.chatTitle')}
            </div>
            <p className="text-[8px] text-[#6f7b8d] font-black uppercase tracking-widest mt-1">
              {t('isoNavigator.chatDesc')}
            </p>
          </div>
        </div>



        <div className="p-2 sm:p-3 md:p-8 space-y-8 max-w-[94.5vw] sm:max-w-[80vw] md:max-w-[90vw] lg:max-w-[99vw]">

          <div className="flex flex-col space-y-6 min-w-0  ">

            {(chatHistory.length > 0 || isChatting) && (

              <div ref={chatContainerRef} onScroll={handleChatScroll} className="w-full min-w-0 bg-[#0A0F1C] border border-white/10 rounded-2xl p-5 text-left max-h-[400px] overflow-y-auto custom-thin-scrollbar relative">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                        ? "bg-[#00f0ff] text-black rounded-tr-none font-medium max-w-[85%]"
                        : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none w-full min-w-0"
                        }`}
                    >
                      {msg.role !== "user" ? (
                        <div className="prose prose-invert prose-sm max-w-none w-full min-w-0">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              img: ({ ...props }) => (
                                <h3 className="text-center">
                                  <img {...props} className="inline-block max-w-full h-auto" alt={props.alt} />
                                </h3>
                              ),
                              h1: ({ ...props }) => <h3 className="text-[#00f0ff]" {...props} />,
                              h2: ({ ...props }) => <h4 className="text-[#00f0ff]" {...props} />,
                              h3: ({ ...props }) => <h3 className="text-[#00f0ff]" {...props} />,
                              h4: ({ ...props }) => <h4 className="text-[#00f0ff]" {...props} />,
                              table: ({ ...props }) => (
                                <div className="scrollable-table my-4 w-full overflow-x-auto rounded-xl border border-white/10 pb-2">
                                  <table className="w-full text-left border-collapse text-sm md:text-base min-w-[500px]" {...props} />
                                </div>
                              ),
                              th: ({ ...props }) => <th className="border-b border-white/20 px-3 py-2 md:px-4 md:py-3 bg-white/5 font-bold text-white break-normal" {...props} />,
                              td: ({ ...props }) => <td className="border-b border-white/10 px-3 py-2 md:px-4 md:py-3 break-normal align-top" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          <div className="mt-2 flex items-center cursor-pointer text-[#00f0ff]" onClick={() => { navigator.clipboard.writeText(msg.content); toast.success(t('isoNavigator.textCopied')) }}>
                            <span className="ml-2 border border-[#00f0ff] rounded-full px-2 py-1 text-[#00f0ff] font-medium">{t('isoNavigator.copyClipboard')}</span>
                          </div>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {isChatting && (
                  <div className="flex justify-start mb-4">
                    <div className="p-3 rounded-2xl bg-white/5 text-gray-300 border border-white/10 rounded-tl-none">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

            )}



            <div className="relative group">

              <input

                type="text"

                value={chatInput}

                onChange={(e) => setChatInput(e.target.value)}

                onKeyPress={(e) => e.key === "Enter" && handleSendChat()}

                placeholder={t('isoNavigator.chatPlaceholder')}

                className="w-full bg-[#0A0F1C] border border-[#1E293B] rounded-2xl p-4 md:p-6 pr-16 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#67E8F9]/30 focus:border-[#67E8F9] transition-all text-[#F3F4F6] placeholder-[#4B5563]"

              />

              <button

                onClick={() => handleSendChat()}

                disabled={!chatInput.trim() || isChatting}

                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-[#67E8F9] text-[#0F111A] rounded-xl hover:bg-[#22D3EE] disabled:opacity-30 transition-all shadow-lg active:scale-95"

              >

                <Send className="w-4 h-4 md:w-5 md:h-5" />

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>



      {/* ISO Detail Modal */}

      {selectedISODetail && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedISODetail(null)}>

          <motion.div

            initial={{ opacity: 0, scale: 0.95 }}

            animate={{ opacity: 1, scale: 1 }}

            exit={{ opacity: 0, scale: 0.95 }}

            onClick={(e) => e.stopPropagation()}

            className="bg-[#131B2D] border border-[#1E293B] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"

          >

            <div className="p-6 border-b border-[#1E293B] sticky top-0 bg-[#0A0F1C]/50 flex items-center justify-between">

              <div>

                <p className="text-[#14B8A6] text-[11px] font-black uppercase tracking-[0.2em]">

                  {selectedISODetail.standard}

                </p>

                <h3 className="text-[#F3F4F6] text-lg font-black mt-1">

                  {selectedISODetail.title}

                </h3>

              </div>

              <button

                onClick={() => setSelectedISODetail(null)}

                className="p-2 hover:bg-[#1E293B] rounded-lg transition-colors shrink-0"

              >

                <X className="w-5 h-5 text-[#9CA3AF]" />

              </button>

            </div>



            <div className="p-6 space-y-6">

              {/* Relevance */}

              <div>

                <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em] mb-3">

                  {t('isoNavigator.relevanceLabel')}

                </p>

                <p className="text-[#9CA3AF] text-base leading-relaxed font-medium">

                  {selectedISODetail.relevance}

                </p>

              </div>



              {/* Documents */}

              {selectedISODetail.documents && selectedISODetail.documents.length > 0 && (

                <div>

                  <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em] mb-3">

                    {t('isoNavigator.documentsLabel')}

                  </p>

                  <div className="space-y-2">

                    {selectedISODetail.documents.map((doc: any, idx: number) => (

                      <div key={idx} className="bg-[#0A0F1C] border border-[#1E293B] rounded-xl p-3">

                        <p className="text-[#F3F4F6] text-sm font-medium">{doc.title}</p>

                        <p className="text-[#4B5563] text-sm mt-1">{t('isoNavigator.clauseLabel')}: {doc.clause}</p>

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* Records */}

              {selectedISODetail.records && selectedISODetail.records.length > 0 && (

                <div>

                  <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em] mb-3">

                    {t('isoNavigator.recordsLabel')}

                  </p>

                  <div className="space-y-2">

                    {selectedISODetail.records.map((record: any, idx: number) => (

                      <div key={idx} className="bg-[#0A0F1C] border border-[#1E293B] rounded-xl p-3">

                        <p className="text-[#F3F4F6] text-sm font-medium">{record.title}</p>

                        <p className="text-[#4B5563] text-sm mt-1">{t('isoNavigator.clauseLabel')}: {record.clause}</p>

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* Action Button */}

              <button

                onClick={() => {

                  handleUpdateFormData({

                    specific_requirements: selectedISODetail.standard,

                  });

                  setSelectedISODetail(null);

                }}

                className="w-full bg-[#00f0ff] text-[#0F111A] hover:bg-brand-cyan hover:text-[#0F111A]/90  rounded-2xl p-4 text-sm font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(63,62,237,0.3)] active:scale-[0.98]"

              >

                {t('isoNavigator.selectThisStd')}

              </button>

            </div>

          </motion.div>

        </div>

      )}



      <style jsx global>{`

        .custom-scrollbar::-webkit-scrollbar {

          width: 5px;

        }

        .custom-scrollbar::-webkit-scrollbar-track {

          background: transparent;

        }

        .custom-scrollbar::-webkit-scrollbar-thumb {

          background: #e2e8f0;

          border-radius: 10px;

        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {

          background: #cbd5e1;

        }

        

        /* Document Styling */

        .document-paper {

          background-color: white;

          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);

          min-height: 1122px; /* A4 Ratio slightly taller */

          padding: 80px 100px;

          margin: 0 auto;

          font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;

          color: #1e293b;

        }



        .prose h2 {

          position: relative;

        }



        .prose tr:nth-child(even) {

          background-color: rgba(255, 255, 255, 0.02);

        }



        .prose tr:hover {

          background-color: rgba(255, 255, 255, 0.04);

          transition: background-color 0.2s;

        }



        .document-paper::after {

          content: "";

          position: absolute;

          inset: 0;

          pointer-events: none;

          background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.03) 0%, transparent 70%);

        }

        

        @media (max-width: 768px) {

          .document-paper {

            padding: 40px 24px;

            min-height: auto;

          }

        }



        /* rc-steps overrides */

        .stepper-container .rc-steps {

          background: transparent;

        }

        .stepper-container .rc-steps-item-process .rc-steps-item-icon {

          background: transparent !important;

          border: none !important;

          border-radius: 9999px !important;

        }

        .stepper-container .rc-steps-item-finish .rc-steps-item-tail::after {

          background-color: #00F0FF !important;

        }

        .stepper-container .rc-steps-item-tail::after {

          background-color: #1E293B !important;

          height: 1px !important;

          top: 22px !important;

        }

        .stepper-container .rc-steps-item-icon {

          width: 44px !important;

          height: 44px !important;

          line-height: 44px !important;

          border: none !important;

          background: transparent !important;

          margin-bottom: 12px !important;

          border-radius: 9999px !important;

        }

        .stepper-container .rc-steps-item-content {

          margin-top: 8px !important;

        }

        .stepper-container .rc-steps-item-title {

          padding-right: 0 !important;

        }

      `}</style>

    </div>

  );

}