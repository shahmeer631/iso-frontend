export interface ClauseCompliance {
  clause_number: string;
  clause_title: string;
  status: string;
  compliance_percentage: number;
  evidence_found: string;
  gap_description: string;
  recommendation: string;
}

export interface IdentifiedGap {
  priority: string;
  clause_reference: string;
  gap_title: string;
  gap_description: string;
  risk_level: string;
  iso_requirement: string;
}

export interface Recommendation {
  priority: string;
  clause_reference: string;
  title: string;
  description: string;
  benefit_statement: string;
  effort_level: string;
  estimated_timeline: string;
}

export interface BenchmarkData {
  overall_score?: number;
  grade?: string;
  compliance_percentage?: number;
  effectiveness_percentage?: number;
  document_type_detected?: string;
  standard_analyzed?: string;
  clause_compliance?: ClauseCompliance[];
  strengths?: string[];
  identified_gaps?: IdentifiedGap[];
  recommendations?: Recommendation[];
  analysis_timestamp?: string;
  analysis_id?: string;
  word_count_analyzed?: number;
  conversation_id?: string;
  iso_suggestions?: ISOSuggestion[];
}

export interface BenchmarkResponse {
  success: boolean;
  message: string;
  data: BenchmarkData;
}

export interface BenchmarkFileRequest {
  file: File;
  improvement_goal: string;
  document_type?: string;
  department?: string;
}

export interface BenchmarkTextRequest {
  document_text: string;
  improvement_goal: string;
  target_standard?: string;
  document_type?: string;
  department?: string;
}

export interface ISODocument {
  title: string;
  clause: string;
  type: "document" | "record";
}

export interface ISOSuggestion {
  standard: string;
  title: string;
  relevance: string;
  documents: ISODocument[];
  records: ISODocument[];
  improvements: string[];
}

export interface ISOSuggestionsResponse {
  success: boolean;
  message: string;
  data: {
    suggestions: ISOSuggestion[];
  };
}
