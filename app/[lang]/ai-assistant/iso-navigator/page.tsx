



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
  extractImsIntegratedStandards,
  extractIsoStandardBadge,
  getNavigatorPlainText,
  isNavigatorImsLabel,
} from "@/components/AIAssistant/NavigatorDocumentView";

/** QHSE IMS: ISO 9001 + 14001 + 45001 (client Annex SL / downloadfile.docx path). */
function isQhseAnnexSlImsLabel(label: string): boolean {
  if (!isNavigatorImsLabel(label)) return false;
  return /9001/i.test(label) && /14001/i.test(label) && /45001/i.test(label);
}

import { useRouter, useParams } from 'next/navigation';

import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import {

  setStep,

  updateFormData,

  setGeneratedDocument,

  restoreGeneratedDocument,

  clearGeneratedDocument,

  addChatMessage,

  setSessionId,

  resetNavigator,

  navigatorDocumentCacheKey,

} from "@/lib/redux/features/isoNavigatorSlice";

import {

  useGenerateDocumentMutation,

  useChatSimpleMutation,

  useGenerateContextSuggestionsMutation,

  useGetISOSuggestionsMutation,

  useGetNavigatorImsDocumentsMutation,

} from "@/lib/redux/api/isoNavigatorApi";

import { ISONavigatorFormData } from "@/types/iso-navigator";

/**
 * Reference table fields:
 * Clause | Documented Information Requirement | Applicable Standards | Organizational Context & Application
 */
function NavigatorImsDocFields({
  item,
  clauseLabel,
  compact,
}: {
  item: any;
  clauseLabel: string;
  compact?: boolean;
}) {
  if (!item) return null;
  const clause = String(item.clause || "").trim();
  const standards = Array.isArray(item.standards)
    ? item.standards.map((s: any) => String(s || "").trim()).filter(Boolean)
    : item.standard
      ? [String(item.standard)]
      : [];
  const cbs =
    item.clausesByStandard && typeof item.clausesByStandard === "object"
      ? Object.entries(item.clausesByStandard)
          .map(([std, cl]) => `${std}: ${cl}`)
          .filter(Boolean)
      : [];
  const requirement = String(item.description || item.integration_note || "").trim();
  const application = String(item.organizational_application || "").trim();
  const showRequirement =
    requirement &&
    application &&
    requirement !== application;
  const contextText = application || requirement;
  const textClass = compact ? "text-[9px] text-[var(--ib-mute)]" : "text-[var(--ib-mute)] text-sm";
  const clamp = compact ? "line-clamp-2" : undefined;
  return (
    <div className={`${textClass} mt-1 space-y-0.5`}>
      {clause && !/^ims$/i.test(clause) && (
        <p>
          <span className="text-[var(--ib-mute)]">{clauseLabel}:</span> {clause}
          {cbs.length > 1 ? ` (${cbs.join("; ")})` : ""}
        </p>
      )}
      {standards.length > 0 && (
        <p>
          <span className="text-[var(--ib-mute)]">Applicable standards:</span>{" "}
          {standards.join(" · ")}
        </p>
      )}
      {showRequirement && (
        <p className={clamp}>
          <span className="text-[var(--ib-mute)]">Requirement:</span> {requirement}
        </p>
      )}
      {contextText && (
        <p className={compact ? "line-clamp-3" : undefined}>
          <span className="text-[var(--ib-mute)]">Context &amp; application:</span>{" "}
          {contextText}
        </p>
      )}
    </div>
  );
}

import Steps, { Step } from 'rc-steps';

import 'rc-steps/assets/index.css';

import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { ActivityTracker } from "@/components/activity/ActivityTracker";


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




  const { currentStep, formData, generatedDocument, generatedDocumentsByKey, chatHistory, sessionId } =

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

  const [getNavigatorImsDocuments, { isLoading: isFetchingImsDocuments }] =

    useGetNavigatorImsDocumentsMutation();

  const imsInventoryRequestId = useRef(0);
  /** Cache key = IMS label + org-context fingerprint so context changes re-enrich. */
  const imsInventoryEnrichedRef = useRef<Set<string>>(new Set());
  const imsInventoryFailedRef = useRef<Set<string>>(new Set());



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

      imsInventoryEnrichedRef.current = new Set();
      imsInventoryFailedRef.current = new Set();
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

  // Enrich IMS Documents & Records from IMS Practical Guide + selected standards
  // when the user selects an IMS card (or opens Step 3 with a pending inventory).
  useEffect(() => {
    const label = String(formData?.specific_requirements || "").trim();
    if (!label || !isNavigatorImsLabel(label)) return;

    const orgCtxText = orgContextToString(formData?.organization_context);
    const cacheKey = `${label}::${orgCtxText.slice(0, 200)}`;
    if (imsInventoryEnrichedRef.current.has(cacheKey)) return;
    if (imsInventoryFailedRef.current.has(cacheKey)) return;

    const sug = isoSuggestions.find((iso) => iso?.standard === label);
    if (!sug) return;

    const hasRealDocs =
      Array.isArray(sug.documents) &&
      sug.documents.length > 0 &&
      sug.documents.every(
        (d: any) =>
          d?.ims_role !== "analysis" &&
          !/^ims$/i.test(String(d?.clause || "")) &&
          !/Integrated \/ Common|Standard-Specific Requirements|Maintain vs Retain|Integration \/ IMS Mapping|Documented Information Required for the Integrated/i.test(
            String(d?.title || ""),
          ),
      );
    // Stale pre-fix inventories lack additional[] and/or org application fields
    const inventoryLooksComplete =
      hasRealDocs &&
      Array.isArray((sug as any).additional) &&
      [...(sug.documents || []), ...(sug.records || [])].some(
        (d: any) =>
          String(d?.organizational_application || "").trim().length > 0 ||
          String(d?.description || "").trim().length > 20,
      );
    if (inventoryLooksComplete && sug.ims_inventory_pending !== true) {
      imsInventoryEnrichedRef.current.add(cacheKey);
      return;
    }

    const needsInventory =
      sug.ims_inventory_pending === true ||
      !Array.isArray(sug.documents) ||
      sug.documents.length === 0 ||
      !inventoryLooksComplete;

    if (!needsInventory) {
      imsInventoryEnrichedRef.current.add(cacheKey);
      return;
    }

    const reqId = ++imsInventoryRequestId.current;
    (async () => {
      try {
        const structured =
          typeof formData?.organization_context === "object" &&
          formData.organization_context
            ? formData.organization_context
            : undefined;
        const result = await getNavigatorImsDocuments({
          specific_requirements: label,
          organization_context: orgCtxText || undefined,
          organization_context_structured: structured || undefined,
        }).unwrap();
        if (reqId !== imsInventoryRequestId.current) return;

        imsInventoryEnrichedRef.current.add(cacheKey);
        imsInventoryFailedRef.current.delete(cacheKey);

        setIsoSuggestions((prev) =>
          prev.map((iso) =>
            iso?.standard === label
              ? {
                  ...iso,
                  documents: result.documents || [],
                  records: result.records || [],
                  additional: result.additional || [],
                  ims_inventory_pending: false,
                  ims_guide_title: result.ims_guide_title,
                }
              : iso,
          ),
        );
        setSelectedISODetail((prev: any) =>
          prev?.standard === label
            ? {
                ...prev,
                documents: result.documents || [],
                records: result.records || [],
                additional: result.additional || [],
                ims_inventory_pending: false,
              }
            : prev,
        );
      } catch (error: any) {
        if (reqId !== imsInventoryRequestId.current) return;
        imsInventoryFailedRef.current.add(cacheKey);
        const message =
          error?.data?.message ||
          error?.error ||
          "Failed to load IMS Documents & Records from library sources";
        console.error("IMS inventory enrichment failed:", message, error);
        toast.error(message);
      }
    })();
  }, [
    formData?.specific_requirements,
    formData?.organization_context,
    isoSuggestions,
    getNavigatorImsDocuments,
  ]);



  const handleUpdateFormData = (data: Partial<ISONavigatorFormData>) =>
    dispatch(updateFormData(data));

  const handleGenerate = async (overrides?: Partial<ISONavigatorFormData>) => {
    try {
      const merged = { ...formData, ...(overrides || {}) };
      const orgCtxText = orgContextToString(merged.organization_context);

      const structured =
        typeof merged.organization_context === "object" && merged.organization_context
          ? merged.organization_context
          : merged.organization_context_structured;

      const payload = {
        organization_context: orgCtxText,
        organization_context_structured: structured || undefined,
        specific_requirements: merged.specific_requirements,
        tone: merged.tone || "professional",
        language: merged.language || "English",
        output_type: merged.output_type || merged.document_title || "Policy Document",
        document_title: merged.document_title || merged.output_type || "Policy Document",
        clause: merged.clause || undefined,
        document_taxonomy: merged.document_taxonomy || undefined,
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

      const missing = doc?.metadata?.missing_editions;
      if (Array.isArray(missing) && missing.length > 0) {
        toast.warning(
          `Unavailable in Standards Library (not substituted): ${missing.join("; ")}. Generated using available standards only.`,
        );
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

  /** Select a document/record and generate inline — never leave the Navigator workspace. */
  const selectDocumentAndGenerate = (patch: Partial<ISONavigatorFormData>) => {
    if (isGenerating) return;
    const mergedReqs = patch.specific_requirements ?? formData.specific_requirements;
    const docTitle = (patch.output_type || patch.document_title || "").trim();
    const key = navigatorDocumentCacheKey(mergedReqs, docTitle);
    handleUpdateFormData(patch);

    // Reuse cached generation for this standard/IMS + template — avoid duplicate API calls
    const cached = key ? generatedDocumentsByKey[key] : undefined;
    if (cached) {
      dispatch(restoreGeneratedDocument(cached));
      return;
    }

    void handleGenerate(patch);
  };

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

  const handleSendChat = async (text?: string) => {

    const messageContent = text || chatInput;

    if (!messageContent.trim()) return;



    dispatch(addChatMessage({ role: "user", content: messageContent }));

    setChatInput("");

    // Reset scroll flag so the response scrolls to bottom

    isUserScrolledUp.current = false;



    try {

      const orgCtxText = orgContextToString(formData.organization_context);

      // Keep generated doc as secondary context only — primary grounding is
      // selected Standards Library PDFs via Navigator chat on the backend.
      const generatedSnippet = generatedDocument?.content
        ? String(generatedDocument.content).slice(0, 3500)
        : "";

      const response = await chatSimple({

        messages: [{ content: messageContent }],

        context: {

          purpose: "iso_navigator",

          organization_context: orgCtxText || "",

          specific_requirements: formData.specific_requirements || "",

          document_title: formData.document_title || formData.output_type || "",

          clause: formData.clause || "",

          full_document_context: generatedSnippet,

        },

        session_id: sessionId || ("iso_" + Math.random().toString(36).substring(7)),

      }).unwrap();



      // Assuming assistant response is the last message in the returned messages array

      const aiResponse = response.messages?.[response.messages.length - 1]?.content || response.response || response.data?.response;

      const chatSources = Array.isArray(response.sources)
        ? response.sources
            .filter((s: any) => s && (s.title || s.standard))
            .map((s: any) => ({
              title: String(s.title || s.standard || ""),
              standard: s.standard ? String(s.standard) : undefined,
              version: s.version ? String(s.version) : undefined,
              pages: Array.isArray(s.pages) ? s.pages : undefined,
              page_count: typeof s.page_count === "number" ? s.page_count : undefined,
              clauses: Array.isArray(s.clauses) ? s.clauses : undefined,
            }))
        : undefined;

      if (aiResponse) {

        dispatch(

          addChatMessage({
            role: "ai",
            content: aiResponse,
            sources: chatSources,
          }),

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

    <div className="w-full mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 bg-[var(--ib-bg)] min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <ActivityTracker
        source="AI_TOOL"
        aiToolId="ISO_NAVIGATOR"
        resourceLabel="ISO Navigator"
        sessionKey="ai_iso_navigator"
      />

      {/* Header */}
      <header className="space-y-4 px-2 sm:px-0 mb-8 md:mb-12 mt-12 md:mt-20">
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1 text-[var(--ib-acc)] border border-[var(--ib-line)] rounded-full">
            <span className=" text-[10px] font-black uppercase tracking-[0.3em]">{t('isoNavigator.badge')}</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-semibold text-[var(--ib-ink)] text-center leading-[1.1] tracking-tight mb-8">
          {t('isoNavigator.title')}
        </h1>
        <p className="text-[var(--ib-mute)] text-sm lg:text-lg max-w-4xl mx-auto text-center leading-relaxed mb-12 font-inter">
          <span className="font-semibold text-[var(--ib-ink)]/80 block mb-2">{t('isoNavigator.subtitle')}</span>
          {t('isoNavigator.description')}
        </p>
      </header>



      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 items-stretch w-full max-w-[1600px] mx-auto px-0 md:h-[calc(100dvh-7rem)] md:min-h-[600px] md:max-h-[920px] md:overflow-hidden">

        {/* Left Column - Form */}

        <div className="md:col-span-5 lg:col-span-5 bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl overflow-hidden min-h-[520px] md:min-h-0 md:h-full flex flex-col">

          <div className="p-5 md:p-6 flex items-center gap-4 border-b border-[var(--ib-line)] bg-[var(--ib-card)] shrink-0">

            <div className="p-2 bg-[var(--ib-accbg)] text-[var(--ib-acc)] rounded-xl">

              <Wand2 className="w-5 h-5 text-[var(--ib-acc)]" />

            </div>

            <h2 className="text-base md:text-lg font-medium text-[var(--ib-ink)] uppercase tracking-wider">

              {t('isoNavigator.dataGenerator')}

            </h2>

          </div>



          <div className="p-5 md:p-6 flex-1 min-h-0 basis-0 space-y-8 overflow-y-auto overscroll-contain custom-thin-scrollbar">

            {/* Stepper Progress using rc-steps */}
            <div className="mb-14 px-4 stepper-container">
              <Steps
                current={currentStep - 1}
                labelPlacement="vertical"
              >
                <Step
                  title={<span className={`text-[8px] font-black uppercase tracking-[0.25em] ${currentStep === 1 ? 'text-[var(--ib-acc)]' : 'text-[var(--ib-ok)]'}`}>{t('isoNavigator.orgContext')}</span>}
                  icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${currentStep > 1 ? "bg-[var(--ib-acc)] text-white text-white shadow-[0_0_20px_rgba(27, 77, 219,0.55)]" :
                      "bg-[var(--ib-bg)] border border-[var(--ib-line)]"
                      }`}>
                      {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : <Building2 className="w-5 h-5 text-[var(--ib-acc)]" />}
                    </div>
                  }
                />
                <Step
                  title={<span className={`text-[8px] font-black uppercase tracking-[0.25em] ${currentStep === 2 ? 'text-[var(--ib-acc)]' : 'text-[var(--ib-mute)]'}`}>{t('isoNavigator.isoStandards')}</span>}
                  icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${currentStep > 2 ? "bg-[var(--ib-acc)] text-white text-white shadow-[0_0_20px_rgba(27, 77, 219,0.55)]" :
                      currentStep === 2 ? "bg-[var(--ib-acc)] text-white text-white shadow-[0_0_20px_rgba(27, 77, 219,0.55)]" :
                        "bg-[var(--ib-bg)] border border-[var(--ib-line)] text-[var(--ib-mute)]"
                      }`}>
                      {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                  }
                />
                <Step
                  title={<span className={`text-[8px] font-black uppercase tracking-[0.25em] ${currentStep === 3 ? 'text-[var(--ib-acc)]' : 'text-[var(--ib-mute)]'}`}>{t('isoNavigator.documentsLabel')} & {t('isoNavigator.recordsLabel')}</span>}
                  icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${currentStep > 3 ? "bg-[var(--ib-acc)] text-white text-white shadow-[0_0_20px_rgba(27, 77, 219,0.55)]" :
                      currentStep === 3 ? "bg-[var(--ib-acc)] text-white text-white shadow-[0_0_20px_rgba(27, 77, 219,0.55)]" :
                        "bg-[var(--ib-bg)] border border-[var(--ib-line)] text-[var(--ib-mute)]"
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

                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--ib-acc)] text-white border border-[var(--ib-acc)]/20">

                    <Building2 className="w-3.5 h-3.5 text-white" />

                  </div>

                  <label className="text-[11px] font-medium text-[var(--ib-mute)] uppercase tracking-[0.2em] flex items-center gap-1.5">

                    01. {t('isoNavigator.orgContext')}

                    <span

                      title={t('dynamic.dyn_simplyenteryourwebsite_538')}

                      className="cursor-help text-[var(--ib-acc)] hover:text-[var(--ib-ok)] transition-colors"

                    >

                      <Info className="w-3.5 h-3.5" />

                    </span>

                  </label>

                </div>

                {formData.organization_context && currentStep > 1 && (

                  <CheckCircle2 className="w-5 h-5 text-[var(--ib-ok)]" />

                )}

              </div>



              {currentStep === 1 ? (

                <>

                  <div className="flex bg-[var(--ib-bg)] p-1 rounded-xl border border-[var(--ib-line)] mb-4">

                    <button
                      type="button"
                      onClick={() => setContextInputType('text')}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${contextInputType === 'text' ? 'bg-[var(--ib-acc)] text-white' : 'text-[var(--ib-mute)] hover:text-[var(--ib-ink)] hover:bg-[var(--ib-card)]'}`}
                    >
                      <Type className="w-4 h-4" /> {t('isoNavigator.textTab')}</button>
                    <button
                      type="button"
                      onClick={() => setContextInputType('url')}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${contextInputType === 'url' ? 'bg-[var(--ib-acc)] text-white' : 'text-[var(--ib-mute)] hover:text-[var(--ib-ink)] hover:bg-[var(--ib-card)]'}`}
                    >
                      <Link className="w-4 h-4" /> {t('isoNavigator.urlTab')}
                    </button>
                  </div>



                  {contextInputType === 'text' ? (

                    <textarea

                      placeholder={t('isoNavigator.describeOrg')}

                      minLength={10}

                      className="w-full h-32 bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-medium text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)] resize-none"

                      value={contextInput}

                      onChange={(e) => setContextInput(e.target.value)}

                    />

                  ) : (

                    <input

                      type="url"

                      placeholder="e.g. https://example.com"

                      className="w-full bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-medium text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)]"

                      value={contextInput}

                      onChange={(e) => setContextInput(e.target.value)}

                    />

                  )}



                  <button
                    onClick={() => fetchContextSuggestions(contextInput)}
                    disabled={isFetchingSuggestions || !contextInput.trim()}
                    className="w-full py-3 bg-[var(--ib-acc)] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-92 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFetchingSuggestions ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isFetchingSuggestions ? t('isoNavigator.analyzing') : t('isoNavigator.analyzeContext')}
                  </button>



                  <div className="space-y-3">

                    <p className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-[0.3em]">

                      {t('isoNavigator.suggestions')}

                      {isFetchingSuggestions && <span className="ml-2 inline-block text-[8px] text-[var(--ib-acc)]">({LOADING_MESSAGES[contextMessageIndex]})</span>}

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

                          className={`flex cursor-pointer gap-4 rounded-2xl border bg-[var(--ib-bg)] p-4 text-sm transition-all group ${isSelected
                            ? "border-[var(--ib-acc)] bg-[var(--ib-accbg)] shadow-[0_0_20px_rgba(58,75,208,0.12)]"
                            : "border-[var(--ib-line)] hover:border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] hover:bg-[var(--ib-accbg)]/60"
                            }`}
                        >
                          <span
                            className={`shrink-0 font-jetbrains-mono text-xs font-semibold transition-colors ${isSelected
                              ? "text-[var(--ib-acc)]"
                              : "text-[var(--ib-mute)] group-hover:text-[var(--ib-acc)]"
                              }`}
                          >
                            [{sug.id.toString().padStart(2, "0")}]
                          </span>
                          <p
                            className={`leading-relaxed font-medium ${isSelected
                              ? "text-[var(--ib-ink)]"
                              : "text-[var(--ib-ink)]/85"
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

                    className="w-full bg-[var(--ib-acc)] text-white   disabled:opacity-30  rounded-2xl p-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_-5px_rgba(27, 77, 219,0.3)] active:scale-[0.98]"

                  >

                    {t('isoNavigator.continue')} <ArrowRight className="w-4 h-4" />

                  </button>

                </>

              ) : (

                <div

                  onClick={() => dispatch(setStep(1))}

                  className="pointer-events-auto cursor-pointer space-y-3 rounded-2xl border border-[var(--ib-acc)]/30 bg-[var(--ib-accbg)] p-5 transition-all hover:border-[var(--ib-acc)]/50 hover:bg-[var(--ib-accbg)] group"

                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--ib-acc)] uppercase tracking-[0.2em]">

                      <CheckCircle2 className="w-3.5 h-3.5" />

                      {t('isoNavigator.selectedStandard')}

                    </div>

                    <span className="text-[10px] font-medium text-[var(--ib-mute)] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{t('isoNavigator.editNode')}</span>

                  </div>

                  <p className="text-sm font-medium text-[var(--ib-ink)] leading-relaxed">

                    {orgContextToString(formData?.organization_context as any)}

                  </p>

                </div>

              )}

            </div>



            {/* Step 2: ISO Standards */}

            <div

              className={`space-y-6 ${currentStep !== 2 ? "opacity-50 pointer-events-none" : ""} ${currentStep > 1 ? "pt-6 border-t border-[var(--ib-line)]" : ""}`}

            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--ib-ok)]/10 text-[var(--ib-ok)] border border-[var(--ib-ok)]/20">

                    <Shield className="w-3.5 h-3.5" />

                  </div>

                  <label className="text-[11px] font-black text-[var(--ib-mute)] uppercase tracking-[0.2em]">

                    02. {t('isoNavigator.isoStandards')}

                  </label>

                </div>

                {formData.specific_requirements && currentStep > 2 && (

                  <CheckCircle2 className="w-5 h-5 text-[var(--ib-ok)]" />

                )}

              </div>



              {currentStep === 2 ? (

                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">

                  <div className="space-y-3">

                    <p className="text-[10px] font-bold text-[var(--ib-mute)] uppercase tracking-wider">

                      {t('isoNavigator.recommendedIso')}

                      {isFetchingISOSuggestions && <span className="ml-2 inline-block text-[8px] text-[var(--ib-ok)]">({t('isoNavigator.loadingLabel')})</span>}

                    </p>

                    <div className="space-y-2">

                      {isoSuggestions?.length > 0 ? (

                        isoSuggestions.map((iso, index) => (

                          <div

                            key={`${String(iso?.standard || "std")}-${index}`}

                            onClick={() => {
                              const next = iso?.standard || "";
                              if (next === formData?.specific_requirements) return;
                              // Switching ISO/IMS: clear doc selection + visible result so
                              // we never show output grounded on a different standard.
                              // Per-standard cache is kept for reuse when returning later.
                              handleUpdateFormData({
                                specific_requirements: next,
                                output_type: "",
                                document_title: "",
                                clause: "",
                                document_taxonomy: undefined,
                              });
                              dispatch(clearGeneratedDocument());
                            }}

                            className={`bg-[var(--ib-bg)] border rounded-2xl text-xs cursor-pointer transition-all flex gap-3 items-start ${
                              isNavigatorImsLabel(iso?.standard || iso?.title)
                                ? "p-5"
                                : "p-3"
                            } ${formData?.specific_requirements === iso?.standard
                              ? "border-[var(--ib-acc)] bg-[var(--ib-accbg)] shadow-[0_0_20px_rgba(58,75,208,0.12)]"
                              : isNavigatorImsLabel(iso?.standard || iso?.title)
                                ? "border-[var(--ib-line)] hover:border-[var(--ib-acc)]/50 hover:bg-[var(--ib-card)]"
                                : "border-[var(--ib-line)] hover:border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] hover:bg-[var(--ib-accbg)]/60"
                              }`}

                          >

                            <div className="flex-1 min-w-0">

                              <div className="flex items-start justify-between gap-2">

                                <div className="flex-1 min-w-0">

                                  <div className="flex flex-col gap-2 min-w-0">
                                    {isNavigatorImsLabel(iso?.standard || iso?.title) ? (
                                      <>
                                        {/* Audit Lens–style criteria badge: full IMS + standards visible */}
                                        <span className="inline-flex w-fit max-w-full text-left text-xs font-bold text-[var(--ib-ok)] bg-[var(--ib-ok)]/10 px-2 py-1 rounded-md uppercase tracking-wider border border-[var(--ib-ok)]/25 whitespace-normal break-words">
                                          {extractIsoStandardBadge(iso?.standard) ||
                                            String(iso?.standard || "Integrated Management Systems")}
                                        </span>
                                        {extractImsIntegratedStandards(iso?.standard).length > 0 && (
                                          <div className="flex flex-wrap gap-1.5">
                                            {extractImsIntegratedStandards(iso?.standard).map(
                                              (token) => (
                                                <span
                                                  key={token}
                                                  className="inline-flex items-center px-2 py-0.5 rounded-md border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] bg-[var(--ib-accbg)] font-jetbrains-mono text-[10px] font-medium text-[var(--ib-acc)]"
                                                >
                                                  {token}
                                                </span>
                                              ),
                                            )}
                                          </div>
                                        )}
                                        {iso?.title &&
                                          !/^integrated\s+management/i.test(
                                            String(iso.title),
                                          ) && (
                                            <p className="text-sm font-bold text-[var(--ib-ink)] leading-relaxed">
                                              {iso.title}
                                            </p>
                                          )}
                                      </>
                                    ) : (
                                      <>
                                        <p className={`font-medium text-[11px] ${formData?.specific_requirements === iso?.standard
                                          ? "text-[var(--ib-mute)]"
                                          : "text-[var(--ib-ink)]"
                                          }`}>
                                          {iso?.standard}
                                        </p>
                                        <p className="text-[10px] font-medium text-[var(--ib-mute)]">
                                          {iso?.title}
                                        </p>
                                      </>
                                    )}
                                  </div>

                                </div>

                              </div>

                              <p className={`text-[9px] leading-relaxed line-clamp-3 mt-2 ${formData?.specific_requirements === iso?.standard
                                ? "text-[var(--ib-mute)]"
                                : "text-[var(--ib-mute)]"
                                }`}>

                                {iso?.relevance}

                              </p>

                            </div>

                            <button

                              onClick={(e) => {

                                e.stopPropagation();

                                setSelectedISODetail(iso);

                              }}

                              className="shrink-0 p-1.5 hover:bg-[var(--ib-acc)] hover:text-white/20 rounded-lg transition-colors"

                            >

                              <Info className={`w-4 h-4 ${formData?.specific_requirements === iso?.standard

                                ? "text-[var(--ib-ink)]"

                                : "text-[var(--ib-mute)] hover:text-[var(--ib-mute)]"

                                }`} />

                            </button>

                          </div>

                        ))

                      ) : (

                        formData.organization_context && (

                          <p className="text-[10px] text-[var(--ib-mute)] py-4 text-center">

                            {isFetchingISOSuggestions ? LOADING_MESSAGES[isoMessageIndex] : t('isoNavigator.noSugFound')}

                          </p>

                        )

                      )}

                    </div>

                  </div>



                  <div className="flex gap-4">

                    <button
                      onClick={handlePrevStep}
                      className="px-6 py-4 bg-transparent border border-[var(--ib-line)] hover:bg-[var(--ib-accbg)] text-[var(--ib-mute)] rounded-2xl text-sm font-medium uppercase tracking-widest transition-all"
                    >
                      {t('isoNavigator.back')}
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={(formData.specific_requirements || '').trim().length < 5}
                      className="flex-1 bg-[var(--ib-acc)] text-white  hover:text-white/90 disabled:opacity-30  rounded-2xl p-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_-5px_rgba(27, 77, 219,0.3)] active:scale-[0.98]"
                    >
                      {t('isoNavigator.continue')} <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              ) : (

                <div

                  onClick={() => dispatch(setStep(2))}

                  className="bg-[var(--ib-ok)]/5 border border-[var(--ib-ok)]/30 rounded-2xl p-5 space-y-3 cursor-pointer hover:bg-[var(--ib-ok)]/10 transition-all group pointer-events-auto"

                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--ib-ok)] uppercase tracking-[0.2em]">

                      <CheckCircle2 className="w-3.5 h-3.5" />

                      {t('isoNavigator.selectedStandard')}

                    </div>

                    <span className="text-[10px] font-medium text-[var(--ib-mute)] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{t('isoNavigator.editNode')}</span>

                  </div>

                  {isNavigatorImsLabel(formData.specific_requirements) ? (
                    <div className="space-y-2">
                      <span className="inline-flex max-w-full text-left text-xs font-bold text-[var(--ib-ok)] bg-[var(--ib-ok)]/10 px-2 py-1 rounded-md uppercase tracking-wider border border-[var(--ib-ok)]/25 whitespace-normal break-words">
                        {extractIsoStandardBadge(formData.specific_requirements) ||
                          formData.specific_requirements}
                      </span>
                      {extractImsIntegratedStandards(formData.specific_requirements).length >
                        0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {extractImsIntegratedStandards(
                            formData.specific_requirements,
                          ).map((token) => (
                            <span
                              key={token}
                              className="inline-flex items-center px-2 py-0.5 rounded-md border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] bg-[var(--ib-accbg)] font-jetbrains-mono text-[11px] font-medium text-[var(--ib-acc)]"
                            >
                              {token}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-[var(--ib-ink)] leading-relaxed">
                      {formData.specific_requirements}
                    </p>
                  )}

                </div>

              )}

            </div>

            {/* Step 3: Documents & Records */}
            <div
              className={`space-y-6 ${currentStep !== 3 ? "opacity-50 pointer-events-none" : ""} ${currentStep > 2 ? "pt-6 border-t border-[var(--ib-line)]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--ib-ok)]/10 text-[var(--ib-ok)] border border-[var(--ib-ok)]/20">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-[11px] font-black text-[var(--ib-mute)] uppercase tracking-[0.2em]">
                    03. {t('isoNavigator.documentsLabel')} & {t('isoNavigator.recordsLabel')}
                  </label>
                </div>
                {formData.output_type && currentStep > 3 && (
                  <CheckCircle2 className="w-5 h-5 text-[var(--ib-ok)]" />
                )}
              </div>

              {currentStep === 3 ? (
                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-4">
                    {isQhseAnnexSlImsLabel(formData?.specific_requirements || "") &&
                      ((selectedISO?.documents?.length ?? 0) > 0 ||
                        (selectedISO?.records?.length ?? 0) > 0) && (
                      <div className="rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-3.5 space-y-2.5">
                        <p className="text-[10px] font-bold text-[var(--ib-mute)] uppercase tracking-wider">
                          Annex SL Harmonized Structure (HS)
                        </p>
                        <p className="text-[11px] leading-relaxed text-[var(--ib-ink)]/85">
                          Under the Annex SL Harmonized Structure (HS), ISO 9001 (Quality),
                          ISO 14001 (Environmental), and ISO 45001 (Occupational Health &amp; Safety)
                          share an identical core clause structure (Clauses 4 through 10) and common
                          terminology. Standardized management systems classify documented
                          information into two fundamental categories:
                        </p>
                        <ul className="space-y-1.5 text-[11px] leading-relaxed text-[var(--ib-ink)] list-none pl-0">
                          <li className="flex gap-2">
                            <span className="text-[var(--ib-ok)] shrink-0">●</span>
                            <span>
                              <span className="font-semibold text-[var(--ib-ink)]">
                                Maintained Documented Information:
                              </span>{" "}
                              Systems, scopes, policies, plans, and procedures kept up-to-date to
                              direct operational execution.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[var(--ib-ok)] shrink-0">●</span>
                            <span>
                              <span className="font-semibold text-[var(--ib-ink)]">
                                Retained Documented Information (Records):
                              </span>{" "}
                              Objective evidence preserved unaltered to prove that activities were
                              carried out as planned and results were achieved.
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {selectedISO?.documents && selectedISO.documents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[var(--ib-mute)] uppercase tracking-wider">
                          {isQhseAnnexSlImsLabel(formData?.specific_requirements || "")
                            ? "Maintained Documented Information (Common · 9001 · 14001 · 45001)"
                            : isNavigatorImsLabel(formData?.specific_requirements || "") &&
                                /27001/i.test(formData?.specific_requirements || "") &&
                                /42001/i.test(formData?.specific_requirements || "")
                              ? "Mandatory IMS Documents (Clauses 4–10 · Annex controls)"
                              : "Mandatory IMS Documents"}
                        </p>
                        <div className="space-y-2">
                          {selectedISO?.documents?.map((doc: any, index: number) => {
                            const isSelected = formData?.output_type === doc?.title;
                            return (
                              <div
                                key={`doc-${index}`}
                                onClick={() =>
                                  selectDocumentAndGenerate({
                                    output_type: doc?.title,
                                    document_title: doc?.title,
                                    clause: doc?.clause || '',
                                    document_taxonomy:
                                      doc?.taxonomy === 'recommended' ||
                                      doc?.requirement === 'recommended' ||
                                      doc?.type === 'recommended'
                                        ? 'recommended'
                                        : 'mandatory_document',
                                  })
                                }
                                className={`bg-[var(--ib-bg)] border rounded-2xl p-3 text-xs cursor-pointer transition-all flex gap-3 items-center ${isSelected
                                  ? "border-[var(--ib-acc)] bg-[var(--ib-accbg)] shadow-[0_0_20px_rgba(27, 77, 219,0.1)]"
                                  : "border-[var(--ib-line)] hover:border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] hover:bg-[var(--ib-accbg)]/60"
                                  }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-[11px] ${isSelected ? "text-[var(--ib-acc)]" : "text-[var(--ib-ink)]"}`}>
                                    {doc?.title}
                                  </p>
                                  <NavigatorImsDocFields
                                    item={doc}
                                    clauseLabel={t('isoNavigator.clauseLabel')}
                                    compact
                                  />
                                </div>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--ib-acc)]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedISO?.records && selectedISO.records.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[var(--ib-mute)] uppercase tracking-wider">
                          {isQhseAnnexSlImsLabel(formData?.specific_requirements || "")
                            ? "Retained Documented Information (Records)"
                            : "Mandatory IMS Records — Evidence of Implementation"}
                        </p>
                        <div className="space-y-2">
                          {selectedISO?.records?.map((rec: any, index: number) => {
                            const isSelected = formData?.output_type === rec?.title;
                            return (
                              <div
                                key={`rec-${index}`}
                                onClick={() =>
                                  selectDocumentAndGenerate({
                                    output_type: rec?.title,
                                    document_title: rec?.title,
                                    clause: rec?.clause || '',
                                    document_taxonomy:
                                      rec?.taxonomy === 'recommended' ||
                                      rec?.requirement === 'recommended' ||
                                      rec?.type === 'recommended'
                                        ? 'recommended'
                                        : 'mandatory_record',
                                  })
                                }
                                className={`bg-[var(--ib-bg)] border rounded-2xl p-3 text-xs cursor-pointer transition-all flex gap-3 items-center ${isSelected
                                  ? "border-[var(--ib-acc)] bg-[var(--ib-accbg)] shadow-[0_0_20px_rgba(58,75,208,0.12)]"
                                  : "border-[var(--ib-line)] hover:border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] hover:bg-[var(--ib-accbg)]/60"
                                  }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-[11px] ${isSelected ? "text-[var(--ib-acc)]" : "text-[var(--ib-ink)]"}`}>
                                    {rec?.title}
                                  </p>
                                  <NavigatorImsDocFields
                                    item={rec}
                                    clauseLabel={t('isoNavigator.clauseLabel')}
                                    compact
                                  />
                                </div>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--ib-acc)]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {Array.isArray((selectedISO as any)?.additional) &&
                      (selectedISO as any).additional.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[var(--ib-mute)] uppercase tracking-wider">
                          Additional Documented Information Necessary for IMS Effectiveness
                        </p>
                        <div className="space-y-2">
                          {(selectedISO as any).additional.map((item: any, index: number) => {
                            const isSelected = formData?.output_type === item?.title;
                            return (
                              <div
                                key={`add-${index}`}
                                onClick={() =>
                                  selectDocumentAndGenerate({
                                    output_type: item?.title,
                                    document_title: item?.title,
                                    clause: item?.clause || '',
                                    document_taxonomy: 'recommended',
                                  })
                                }
                                className={`bg-[var(--ib-bg)] border rounded-2xl p-3 text-xs cursor-pointer transition-all flex gap-3 items-center ${isSelected
                                  ? "border-[var(--ib-acc)] bg-[var(--ib-accbg)] shadow-[0_0_20px_rgba(27, 77, 219,0.1)]"
                                  : "border-[var(--ib-line)] hover:border-[var(--ib-mute)] hover:bg-[var(--ib-accbg)]"
                                  }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-[11px] ${isSelected ? "text-[var(--ib-acc)]" : "text-[var(--ib-ink)]"}`}>
                                    {item?.title}
                                  </p>
                                  <NavigatorImsDocFields
                                    item={item}
                                    clauseLabel={t('isoNavigator.clauseLabel')}
                                    compact
                                  />
                                </div>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--ib-acc)]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isFetchingImsDocuments &&
                      isNavigatorImsLabel(formData?.specific_requirements || "") && (
                      <p className="text-[10px] text-[var(--ib-ok)] py-4 text-center flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading documented information from IMS Practical Guide + selected standards…
                      </p>
                    )}

                    {(!selectedISO?.documents?.length &&
                      !selectedISO?.records?.length &&
                      !(selectedISO as any)?.additional?.length) &&
                      !isFetchingImsDocuments && (
                      <p className="text-[10px] text-[var(--ib-mute)] py-4 text-center">
                        {t('isoNavigator.noDocsAvailable')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handlePrevStep}
                      className="px-6 py-4 bg-transparent border border-[var(--ib-line)] hover:bg-[var(--ib-accbg)] text-[var(--ib-mute)] rounded-2xl text-sm font-medium uppercase tracking-widest transition-all"
                    >
                      {t('isoNavigator.back')}
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !formData.output_type}
                      className="flex-1 bg-[var(--ib-acc)] text-white  hover:text-white/90 disabled:opacity-30  rounded-2xl p-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_-5px_rgba(27, 77, 219,0.3)] active:scale-[0.98]"
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
                    className="bg-[var(--ib-ok)]/5 border border-[var(--ib-ok)]/30 rounded-2xl p-5 space-y-3 cursor-pointer hover:bg-[var(--ib-ok)]/10 transition-all group pointer-events-auto"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--ib-ok)] uppercase tracking-[0.2em]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('isoNavigator.outputStyle') || "Selected Output Type"}
                      </div>
                      <span className="text-[10px] font-medium text-[var(--ib-mute)] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{t('isoNavigator.editNode')}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--ib-ink)] leading-relaxed">
                      {formData.output_type}
                    </p>
                  </div>
                )
              )}
            </div>



            {generatedDocument && (

              <div className="mt-8 animate-in zoom-in-95 border-t border-[var(--ib-line)] pt-8 duration-300">

                <button

                  onClick={handleReset}

                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-3 text-xs font-bold text-[var(--ib-ink)] shadow-sm transition-all hover:bg-[var(--ib-bg)] active:scale-[0.98] md:rounded-2xl md:p-4 md:text-sm"

                >

                  <PlusCircle className="w-4 h-4" />

                  {t('isoNavigator.newGeneration')}

                </button>

              </div>

            )}

          </div>

        </div>



        {/* Right Column - Document Viewer */}

        <div className="md:col-span-7 lg:col-span-7 bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.25)] overflow-hidden min-h-[520px] md:min-h-0 md:h-full md:max-h-full flex flex-col relative min-w-0">

            {!generatedDocument || isGenerating ? (

            <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 md:p-12 text-center overflow-y-auto overscroll-contain">

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

                      className="w-20 h-20 border-[2px] border-[var(--ib-acc)]/10 border-t-[var(--ib-acc)] rounded-full"

                    />

                    <div className="absolute inset-0 flex items-center justify-center">

                      <Loader2

                        className="w-6 h-6 text-[var(--ib-acc)] animate-spin"

                      />

                    </div>

                  </div>

                  <h3 className="text-xl font-black text-[var(--ib-ink)] uppercase tracking-widest">{t('isoNavigator.architectingProtocol')}</h3>

                  <p className="text-sm text-[var(--ib-mute)] max-w-xs font-medium leading-relaxed">{t('isoNavigator.aiStructuring')}</p>

                </div>

              ) : (

                <>

                  <div className="w-24 h-24 mb-8 bg-[var(--ib-bg)] rounded-3xl flex items-center justify-center border border-[var(--ib-line)] group hover:border-[var(--ib-acc)]/50 transition-all duration-500">

                    <FileText

                      className="w-10 h-10 text-[var(--ib-mute)] group-hover:text-[var(--ib-acc)] transition-colors"

                      strokeWidth={1.5}

                    />

                  </div>

                  <h3 className="text-lg font-black text-[var(--ib-ink)] uppercase tracking-[0.2em] mb-4">

                    {t('isoNavigator.awaitingInput')}

                  </h3>

                  <p className="text-sm max-w-sm text-[var(--ib-mute)] font-medium leading-relaxed">

                    {t('isoNavigator.awaitingInputDesc')}

                  </p>

                </>

              )}

            </div>

          ) : (

            <div className="flex flex-col flex-1 min-h-0 basis-0 h-full overflow-hidden animate-in fade-in duration-700">

              <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain custom-thin-scrollbar">

              <div className="p-4 md:p-5 border-b border-[var(--ib-line)] bg-[var(--ib-bg)]/80 backdrop-blur-[8px] flex flex-col gap-3 w-full min-w-0">

                {/* Meta row only: badges left, actions right — title must NOT sit in this flex row */}
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 w-full min-w-0">

                  <div className="flex flex-wrap items-center gap-2 min-w-0">

                    {(() => {
                      const imsSource =
                        generatedDocument.metadata?.iso_standard ||
                        formData.specific_requirements ||
                        generatedDocument.metadata?.grounded_standard ||
                        "";
                      if (
                        generatedDocument.metadata?.is_ims ||
                        isNavigatorImsLabel(imsSource)
                      ) {
                        const standards = extractImsIntegratedStandards(imsSource);
                        return (
                          <div className="flex flex-col gap-1.5 min-w-0 max-w-full">
                            <span className="inline-flex w-fit max-w-full text-left text-xs font-bold text-[var(--ib-ok)] bg-[var(--ib-ok)]/10 px-2 py-1 rounded-md uppercase tracking-wider border border-[var(--ib-ok)]/25 whitespace-normal break-words">
                              {extractIsoStandardBadge(imsSource) ||
                                "Integrated Management Systems"}
                            </span>
                            {standards.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {standards.map((token) => (
                                  <span
                                    key={token}
                                    className="inline-flex items-center rounded-md border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] bg-[var(--ib-accbg)] px-2 py-1 font-jetbrains-mono text-[11px] font-medium tracking-[0.02em] text-[var(--ib-acc)]"
                                  >
                                    {token}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      const isoBadge =
                        extractIsoStandardBadge(generatedDocument.metadata?.iso_standard) ||
                        extractIsoStandardBadge(generatedDocument.metadata?.grounded_standard) ||
                        extractIsoStandardBadge(formData.specific_requirements);
                      return isoBadge ? (
                      <span className="inline-flex items-center rounded-md border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] bg-[var(--ib-accbg)] px-2 py-1 font-jetbrains-mono text-[12px] font-medium tracking-[0.02em] text-[var(--ib-acc)]">
                        {isoBadge}
                      </span>
                      ) : null;
                    })()}

                    {(formData.clause || generatedDocument.metadata?.clause) &&
                      formData.clause !== "IMS" &&
                      generatedDocument.metadata?.clause !== "IMS" && (

                      <span className="inline-flex items-center rounded-md border border-[var(--ib-line)] bg-[var(--ib-card)] px-2 py-1 font-jetbrains-mono text-[12px] font-medium tracking-[0.02em] text-[var(--ib-ink)]">

                        {t('isoNavigator.clauseLabel')} {formData.clause || generatedDocument.metadata?.clause}

                      </span>

                    )}

                    {(formData.document_taxonomy || generatedDocument.metadata?.document_taxonomy) && (

                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium leading-[1.3] text-amber-800">

                        {(formData.document_taxonomy || generatedDocument.metadata?.document_taxonomy) === 'recommended'
                          ? 'Recommended'
                          : (formData.document_taxonomy || generatedDocument.metadata?.document_taxonomy) === 'mandatory_record'
                            ? (t('isoNavigator.recordsLabel') || 'Mandatory Record')
                            : (t('isoNavigator.documentsLabel') || 'Mandatory Document')}

                      </span>

                    )}

                  </div>

                  <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">

                    {typeof generatedDocument.confidence_score === 'number' && (

                      <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--ib-ok)_30%,var(--ib-line))] bg-[var(--ib-okbg)] px-2 py-1 text-[11px] font-medium leading-[1.3] text-[var(--ib-ok)]">

                        {Math.round((generatedDocument.confidence_score || 0) * 100)}% {t('isoNavigator.match')}

                      </span>

                    )}

                    <button

                      type="button"

                      onClick={() => {

                        navigator.clipboard.writeText(getNavigatorPlainText(generatedDocument));

                        toast.success(t('isoNavigator.textCopied'));

                      }}

                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ib-line)] bg-[var(--ib-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--ib-ink)] hover:border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-acc)]/30"

                    >

                      <Copy className="w-3.5 h-3.5" />

                      {t('isoNavigator.copyClipboard')}

                    </button>

                  </div>

                </div>

                {/* Full-bleed title + switcher — not beside Match/Copy */}
                <div className="w-full min-w-0 space-y-2">

                  <h2 className="block w-full max-w-none text-balance break-normal text-[20px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--ib-ink)] md:text-[22px]">

                    {generatedDocument.title}

                  </h2>

                  {generatedDocument.metadata?.ims_guide_available === true &&
                    generatedDocument.metadata?.ims_guide_title && (
                    <p className="text-[12px] leading-[1.4] text-[var(--ib-ok)]">
                      Primary IMS source: {generatedDocument.metadata.ims_guide_title} + selected ISO standards.
                    </p>
                  )}

                  {Array.isArray(generatedDocument.metadata?.missing_editions) &&
                    generatedDocument.metadata.missing_editions.length > 0 && (
                    <p className="text-[12px] leading-[1.4] text-amber-700">
                      Unavailable library editions (not substituted):{" "}
                      {generatedDocument.metadata.missing_editions.join("; ")}
                    </p>
                  )}

                  {Array.isArray(generatedDocument.metadata?.grounding_sources) &&
                    generatedDocument.metadata.grounding_sources.length > 0 && (
                    <p className="text-[11px] leading-[1.45] text-[var(--ib-mute)]">
                      Grounded on{" "}
                      {generatedDocument.metadata.grounding_sources
                        .map((s) => {
                          const ver = s.version ? `:${s.version}` : "";
                          const pages =
                            Array.isArray(s.retrieved_pages) &&
                            s.retrieved_pages.length > 0
                              ? ` (pp. ${s.retrieved_pages.join(", ")})`
                              : s.page_count
                                ? ` (${s.page_count} pp. indexed)`
                                : "";
                          const clauses =
                            Array.isArray(s.clauses) && s.clauses.length > 0
                              ? ` [cl. ${s.clauses.slice(0, 6).join(", ")}]`
                              : "";
                          return `${s.standard}${ver}${pages}${clauses}`;
                        })
                        .join(" · ")}
                    </p>
                  )}

                  {(() => {
                    const docs = [
                      ...(selectedISO?.documents || []),
                      ...(selectedISO?.records || []),
                    ];
                    if (docs.length < 2) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5 pt-1 w-full min-w-0 content-start">
                        {docs.map((d: any, idx: number) => {
                          const active = formData.output_type === d?.title;
                          return (
                            <button
                              key={`switch-${idx}-${d?.title}`}
                              type="button"
                              disabled={isGenerating}
                              onClick={() =>
                                selectDocumentAndGenerate({
                                  output_type: d?.title,
                                  document_title: d?.title,
                                  clause: d?.clause || "",
                                  document_taxonomy:
                                    d?.type === "recommended"
                                      ? "recommended"
                                      : d?.type === "record" ||
                                          selectedISO?.records?.some(
                                            (r: any) => r?.title === d?.title,
                                          )
                                        ? "mandatory_record"
                                        : "mandatory_document",
                                })
                              }
                              title={d?.title}
                              className={`max-w-full truncate rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-40 ${
                                active
                                  ? "border-[var(--ib-acc)]/50 bg-[var(--ib-accbg)] text-[var(--ib-acc)]"
                                  : "border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-mute)] hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:text-[var(--ib-ink)]"
                              }`}
                            >
                              {d?.title}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {(generatedDocument.generation_timestamp || generatedDocument.word_count) && (

                    <p className="text-[11px] font-normal leading-[1.3] text-[var(--ib-mute)]">

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

              </div>

              <div className="p-4 sm:p-5 md:p-6 lg:p-8 bg-[var(--ib-card)] min-w-0">

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

            </div>

          )}

        </div>

      </div>



      {/* Bottom Row - Ask AI */}

      <div className="mt-12 bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full">

        <div className="p-2 sm:p-3 md:p-6 flex items-center gap-4 border-b border-[var(--ib-line)] bg-[var(--ib-card)]">

          <div className="p-2 bg-[var(--ib-accbg)] text-[var(--ib-acc)] rounded-xl">

            <Sparkles className="w-5 h-5 text-[var(--ib-acc)]" />

          </div>

          <div>
            <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-[var(--ib-ink)] uppercase tracking-wider">
              {t('isoNavigator.chatTitle')}
            </div>
            <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-[var(--ib-mute)]">
              {t('isoNavigator.chatDesc')}
            </p>
          </div>
        </div>



        <div className="p-2 sm:p-3 md:p-8 space-y-8 max-w-[94.5vw] sm:max-w-[80vw] md:max-w-[90vw] lg:max-w-[99vw]">

          <div className="flex flex-col space-y-6 min-w-0  ">

            {(chatHistory.length > 0 || isChatting) && (

              <div ref={chatContainerRef} onScroll={handleChatScroll} className="w-full min-w-0 bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-2xl p-5 text-left max-h-[400px] overflow-y-auto custom-thin-scrollbar relative">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                        ? "bg-[var(--ib-acc)] text-white rounded-tr-none font-medium max-w-[85%]"
                        : "bg-[var(--ib-card)] text-[var(--ib-mute)] border border-[var(--ib-line)] rounded-tl-none w-full min-w-0"
                        }`}
                    >
                      {msg.role !== "user" ? (
                        <div className="prose prose-sm max-w-none w-full min-w-0 text-[var(--ib-ink)] prose-headings:text-[var(--ib-ink)] prose-p:text-[var(--ib-ink)]/90 prose-strong:text-[var(--ib-ink)] prose-li:text-[var(--ib-ink)]/90">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              img: ({ ...props }) => (
                                <h3 className="text-center">
                                  <img {...props} className="inline-block max-w-full h-auto" alt={props.alt} />
                                </h3>
                              ),
                              h1: ({ ...props }) => <h3 className="text-[var(--ib-acc)]" {...props} />,
                              h2: ({ ...props }) => <h4 className="text-[var(--ib-acc)]" {...props} />,
                              h3: ({ ...props }) => <h3 className="text-[var(--ib-acc)]" {...props} />,
                              h4: ({ ...props }) => <h4 className="text-[var(--ib-acc)]" {...props} />,
                              table: ({ ...props }) => (
                                <div className="scrollable-table my-4 w-full overflow-x-auto rounded-xl border border-[var(--ib-line)] pb-2">
                                  <table className="w-full text-left border-collapse text-sm md:text-base min-w-[500px]" {...props} />
                                </div>
                              ),
                              th: ({ ...props }) => <th className="border-b border-[var(--ib-line)] bg-[var(--ib-bg)] px-3 py-2 font-bold break-normal text-[var(--ib-ink)] md:px-4 md:py-3" {...props} />,
                              td: ({ ...props }) => <td className="border-b border-[var(--ib-line)] px-3 py-2 align-top break-normal text-[var(--ib-ink)] md:px-4 md:py-3" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {Array.isArray(msg.sources) && msg.sources.length > 0 && (
                            <p className="mt-2 text-[10px] leading-[1.45] text-[var(--ib-ink)]/40">
                              Sources:{" "}
                              {msg.sources
                                .map((s) => {
                                  const ver = s.version ? `:${s.version}` : "";
                                  const pages =
                                    Array.isArray(s.pages) && s.pages.length > 0
                                      ? ` (pp. ${s.pages.join(", ")})`
                                      : s.page_count
                                        ? ` (${s.page_count} pp.)`
                                        : "";
                                  const clauses =
                                    Array.isArray(s.clauses) && s.clauses.length > 0
                                      ? ` [cl. ${s.clauses.slice(0, 5).join(", ")}]`
                                      : "";
                                  return `${s.title || s.standard || ""}${ver}${pages}${clauses}`;
                                })
                                .join(" · ")}
                            </p>
                          )}
                          <div className="mt-2 flex items-center cursor-pointer text-[var(--ib-acc)]" onClick={() => { navigator.clipboard.writeText(msg.content); toast.success(t('isoNavigator.textCopied')) }}>
                            <span className="ml-2 border border-[var(--ib-acc)] rounded-full px-2 py-1 text-[var(--ib-acc)] font-medium">{t('isoNavigator.copyClipboard')}</span>
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
                    <div className="p-3 rounded-2xl bg-[var(--ib-card)] text-[var(--ib-mute)] border border-[var(--ib-line)] rounded-tl-none">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[var(--ib-acc)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-[var(--ib-acc)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-[var(--ib-acc)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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

                className="w-full bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-2xl p-4 md:p-6 pr-16 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ib-acc)]/30 focus:border-[var(--ib-acc)] transition-all text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)]"

              />

              <button

                onClick={() => handleSendChat()}

                disabled={!chatInput.trim() || isChatting}

                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-[var(--ib-acc)] text-white rounded-xl hover:bg-[var(--ib-acc)]/90 disabled:opacity-30 transition-all shadow-lg active:scale-95"

              >

                <Send className="w-4 h-4 md:w-5 md:h-5" />

              </button>

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

            className="bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"

          >

            <div className="p-6 border-b border-[var(--ib-line)] sticky top-0 bg-[var(--ib-card)] flex items-center justify-between">

              <div className="min-w-0 pr-2">
                {isNavigatorImsLabel(selectedISODetail.standard) ? (
                  <div className="space-y-2">
                    <span className="inline-flex max-w-full text-left text-xs font-bold text-[var(--ib-ok)] bg-[var(--ib-ok)]/10 px-2 py-1 rounded-md uppercase tracking-wider border border-[var(--ib-ok)]/25 whitespace-normal break-words">
                      {extractIsoStandardBadge(selectedISODetail.standard) ||
                        selectedISODetail.standard}
                    </span>
                    {extractImsIntegratedStandards(selectedISODetail.standard).length >
                      0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {extractImsIntegratedStandards(selectedISODetail.standard).map(
                          (token) => (
                            <span
                              key={token}
                              className="inline-flex items-center px-2 py-0.5 rounded-md border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] bg-[var(--ib-accbg)] font-jetbrains-mono text-[11px] font-medium text-[var(--ib-acc)]"
                            >
                              {token}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--ib-ok)] text-[11px] font-black uppercase tracking-[0.2em]">
                    {selectedISODetail.standard}
                  </p>
                )}

                <h3 className="text-[var(--ib-ink)] text-lg font-black mt-2">
                  {selectedISODetail.title}
                </h3>
              </div>

              <button

                onClick={() => setSelectedISODetail(null)}

                className="p-2 hover:bg-[var(--ib-ink)] rounded-lg transition-colors shrink-0"

              >

                <X className="w-5 h-5 text-[var(--ib-mute)]" />

              </button>

            </div>



            <div className="p-6 space-y-6">

              {/* Relevance */}

              <div>

                <p className="text-[10px] font-black text-[var(--ib-mute)] uppercase tracking-[0.2em] mb-3">

                  {t('isoNavigator.relevanceLabel')}

                </p>

                <p className="text-[var(--ib-mute)] text-base leading-relaxed font-medium">

                  {selectedISODetail.relevance}

                </p>

              </div>



              {isQhseAnnexSlImsLabel(selectedISODetail.standard || "") && (
                <div className="rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-3.5 space-y-2.5">
                  <p className="text-[10px] font-bold text-[var(--ib-mute)] uppercase tracking-wider">
                    Annex SL Harmonized Structure (HS)
                  </p>
                  <p className="text-[11px] leading-relaxed text-[var(--ib-ink)]/85">
                    Under the Annex SL Harmonized Structure (HS), ISO 9001 (Quality),
                    ISO 14001 (Environmental), and ISO 45001 (Occupational Health &amp; Safety)
                    share an identical core clause structure (Clauses 4 through 10) and common
                    terminology. Standardized management systems classify documented
                    information into two fundamental categories:
                  </p>
                  <ul className="space-y-1.5 text-[11px] leading-relaxed text-[var(--ib-ink)] list-none pl-0">
                    <li className="flex gap-2">
                      <span className="text-[var(--ib-ok)] shrink-0">●</span>
                      <span>
                        <span className="font-semibold text-[var(--ib-ink)]">
                          Maintained Documented Information:
                        </span>{" "}
                        Systems, scopes, policies, plans, and procedures kept up-to-date to
                        direct operational execution.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[var(--ib-ok)] shrink-0">●</span>
                      <span>
                        <span className="font-semibold text-[var(--ib-ink)]">
                          Retained Documented Information (Records):
                        </span>{" "}
                        Objective evidence preserved unaltered to prove that activities were
                        carried out as planned and results were achieved.
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Mandatory Documents */}

              {selectedISODetail.documents && selectedISODetail.documents.length > 0 && (

                <div>

                  <p className="text-[10px] font-black text-[var(--ib-mute)] uppercase tracking-[0.2em] mb-3">

                    {isQhseAnnexSlImsLabel(selectedISODetail.standard || "")
                      ? "Maintained Documented Information (Common · 9001 · 14001 · 45001)"
                      : "Mandatory IMS Documents"}

                  </p>

                  <div className="space-y-2">

                    {selectedISODetail.documents.map((doc: any, idx: number) => (

                      <div key={idx} className="bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-xl p-3">

                        <p className="text-[var(--ib-ink)] text-sm font-medium">{doc.title}</p>

                        <NavigatorImsDocFields
                          item={doc}
                          clauseLabel={t('isoNavigator.clauseLabel')}
                        />

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* Mandatory Records */}

              {selectedISODetail.records && selectedISODetail.records.length > 0 && (

                <div>

                  <p className="text-[10px] font-black text-[var(--ib-mute)] uppercase tracking-[0.2em] mb-3">

                    {isQhseAnnexSlImsLabel(selectedISODetail.standard || "")
                      ? "Retained Documented Information (Records)"
                      : "Mandatory IMS Records — Evidence of Implementation"}

                  </p>

                  <div className="space-y-2">

                    {selectedISODetail.records.map((record: any, idx: number) => (

                      <div key={idx} className="bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-xl p-3">

                        <p className="text-[var(--ib-ink)] text-sm font-medium">{record.title}</p>

                        <NavigatorImsDocFields
                          item={record}
                          clauseLabel={t('isoNavigator.clauseLabel')}
                        />

                      </div>

                    ))}

                  </div>

                </div>

              )}

              {/* Additional for effectiveness */}

              {Array.isArray(selectedISODetail.additional) &&
                selectedISODetail.additional.length > 0 && (

                <div>

                  <p className="text-[10px] font-black text-[var(--ib-mute)] uppercase tracking-[0.2em] mb-3">

                    Additional Documented Information Necessary for IMS Effectiveness

                  </p>

                  <div className="space-y-2">

                    {selectedISODetail.additional.map((item: any, idx: number) => (

                      <div key={idx} className="bg-[var(--ib-bg)] border border-[var(--ib-line)] rounded-xl p-3">

                        <p className="text-[var(--ib-ink)] text-sm font-medium">{item.title}</p>

                        <NavigatorImsDocFields
                          item={item}
                          clauseLabel={t('isoNavigator.clauseLabel')}
                        />

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

                className="w-full bg-[var(--ib-acc)] text-white hover:bg-[var(--ib-acc)] hover:text-white/90  rounded-2xl p-4 text-sm font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(27, 77, 219,0.3)] active:scale-[0.98]"

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

          font-family: 'Inter', system-ui, -apple-system, sans-serif;

          color: var(--ib-ink);

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

          background-color: var(--ib-acc) !important;

        }

        .stepper-container .rc-steps-item-tail::after {

          background-color: var(--ib-ink) !important;

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