export interface AuditLensFormData {
  stage: string;
  material_type: string;
  previous_audit_findings: string | Record<string, unknown>;
  scope_description: string;
}

export interface GeneratedAuditData {
  stage: string;
  material_type: string;
  content: string;
  iso_clauses_covered: string[];
  next_steps: string[];
  estimated_duration: string;
  required_resources: string[];
  generation_timestamp: string;
  title?: string;
}

export interface AuditChatHistoryItem {
  role: 'user' | 'ai';
  content: string;
}

export interface AuditLensResponse {
  success: boolean;
  message: string;
  data: GeneratedAuditData;
}

/** Live Audit Lens step response (wizard path) */
export interface AuditStepResult {
  step_number: number;
  title: string;
  stage: string;
  guidance: string;
  template_preview?: string;
  next_step_available: boolean;
  auditor_guidance?: string;
  audit_paper?: string;
  documented_information_template?: string;
  case_study?: string;
  what_to_do?: string;
  when_to_do_it?: string;
  why_it_is_necessary?: string;
  specification_to_check?: string;
  evidence_to_look_for?: string;
  audit_questions?: string;
}

export interface AuditContextOption {
  criteria?: string;
  scope?: string;
  objective?: string;
  organization?: string;
  clause?: string;
  industry?: string;
  [key: string]: unknown;
}
