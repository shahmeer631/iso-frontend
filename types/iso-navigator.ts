// export interface OrganizationContext {
//   what: string;
//   where: string;
//   why: string;
//   when: string;
//   whom: string;
// }

export type DocumentTaxonomy =
  | "mandatory_document"
  | "mandatory_record"
  | "recommended";

export interface OrganizationContext {
  what: string;
  where: string;
  why: string;
  when: string;
  whom: string;
}

export interface ISONavigatorFormData {
  organization_context: string | OrganizationContext;
  organization_context_structured?: OrganizationContext;
  specific_requirements: string;
  tone: string;
  language: string;
  output_type?: string;
  document_title?: string;
  clause?: string;
  document_taxonomy?: DocumentTaxonomy;
}

export interface ChatHistoryItem {
  role: 'user' | 'ai';
  content: string;
}

export interface ContextSuggestion {
  id: number;
  text: string;
}

export interface ContextGeneratorOption {
  what: string;
  where: string;
  why: string;
  when: string;
  whom: string;
}

export interface ContextGeneratorResponse {
  success: boolean;
  message: string;
  data: {
    options: ContextGeneratorOption[];
  };
}

export interface GeneratedDocumentData {
  title: string;
  content: string;
  metadata: {
    organization_context: string;
    tone: string;
    language: string;
    clause?: string;
    document_taxonomy?: string;
    iso_standard?: string;
    grounded_standard?: string;
  };
  iso_clauses_referenced: string[];
  generation_timestamp: string;
  word_count: number;
  confidence_score: number;
  documented_template?: string;
  implementation_guidance?: string;
  daily_usability?: string;
  purpose_strategic_intent?: string;
  rollout_checklist?: string;
  prerequisite_dependencies?: string;
  critical_success_factors?: string;
  common_pitfalls?: string;
  executive_summary?: string;
  process_sipoc?: string;
  escalation_thresholds?: string;
  associated_forms_records?: string;
}

export interface GenerateDocumentResponse {
  success: boolean;
  message: string;
  data: GeneratedDocumentData;
}

export interface ChatMessage {
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  context: {
    document: string;
  };
  session_id: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    sources: string[];
    suggested_followups: string[];
    session_id: string;
  };
}

export interface ISODocument {
  title: string;
  clause: string;
  type: 'document' | 'record' | 'recommended';
}

export interface ISOSuggestion {
  standard: string;
  title: string;
  relevance: string;
  documents: ISODocument[];
  records: ISODocument[];
}

export interface ISOSuggestionsResponse {
  success: boolean;
  message: string;
  data: {
    suggestions: ISOSuggestion[];
  };
}
