// data.ts — types + all dummy data

export type Status = "Conforming" | "Minor Gap" | "Major Gap";
export type Priority = "High" | "Medium" | "Low";
export type Phase = "upload" | "loading" | "results";

export interface Clause {
  id: string;
  title: string;
  status: Status;
  score: number;
  note: string;
}

export interface Rec {
  priority: Priority;
  clause: string;
  title: string;
  description: string;
  benefit: string;
}

export interface Result {
  overallScore: number;
  grade: string;
  completeness: number;
  effectiveness: number;
  documentType: string;
  standard: string;
  clauses: Clause[];
  strengths: string[];
  gaps: string[];
  recommendations: Rec[];
}

export const RESULT: Result = {
  overallScore: 72,
  grade: "B",
  completeness: 78,
  effectiveness: 68,
  documentType: "Quality Manual",
  standard: "ISO 9001:2015",
  clauses: [
    { id: "4.1", title: "Understanding the organization", status: "Conforming", score: 85, note: "SWOT analysis present and comprehensive" },
    { id: "4.2", title: "Understanding stakeholder needs", status: "Minor Gap", score: 60, note: "Stakeholder register incomplete" },
    { id: "5.1", title: "Leadership and commitment", status: "Conforming", score: 90, note: "Strong evidence of management involvement" },
    { id: "6.1", title: "Risk and opportunity", status: "Major Gap", score: 45, note: "Risk assessment missing or outdated" },
    { id: "7.1", title: "Resources", status: "Conforming", score: 75, note: "Adequate resource planning documented" },
    { id: "7.2", title: "Competence", status: "Minor Gap", score: 65, note: "Training records present but effectiveness not evaluated" },
    { id: "8.1", title: "Operational planning", status: "Conforming", score: 80, note: "Process controls well defined" },
    { id: "9.1", title: "Monitoring and measurement", status: "Conforming", score: 70, note: "KPIs defined, some measurement gaps" },
    { id: "9.2", title: "Internal audit", status: "Conforming", score: 85, note: "Audit program comprehensive" },
    { id: "9.3", title: "Management review", status: "Minor Gap", score: 55, note: "Frequency not specified" },
  ],
  strengths: [
    "Clear documentation of roles and responsibilities",
    "Well-defined quality objectives aligned with policy",
    "Comprehensive process mapping with interactions identified",
    "Good evidence of leadership commitment",
  ],
  gaps: [
    "Missing risk assessment for critical processes (Clause 6.1)",
    "Incomplete stakeholder identification and communication planning (Clause 4.2)",
    "No evidence of management review frequency documented (Clause 9.3)",
    "Training effectiveness evaluation not demonstrated (Clause 7.2)",
  ],
  recommendations: [
    {
      priority: "High", clause: "6.1 Risk and Opportunities",
      title: "No documented risk assessment found",
      description: "Create a risk assessment matrix covering operational, strategic, and compliance risks. Use ISO 31000 framework with likelihood and impact ratings.",
      benefit: "Ensures proactive risk management and demonstrates compliance with clause 6.1 requirements",
    },
    {
      priority: "High", clause: "4.2 Stakeholder Needs",
      title: "Stakeholder register incomplete",
      description: "Develop comprehensive stakeholder register including customers, employees, suppliers, regulators. Define communication methods and frequency for each.",
      benefit: "Improves stakeholder engagement and ensures their requirements are systematically addressed",
    },
    {
      priority: "Medium", clause: "9.3 Management Review",
      title: "Review frequency not specified",
      description: "Document management review schedule (recommend quarterly). Include all required inputs per clause 9.3.2 and document outputs/decisions.",
      benefit: "Ensures systematic top management involvement and continuous improvement oversight",
    },
    {
      priority: "Medium", clause: "7.2 Competence",
      title: "Training effectiveness not measured",
      description: "Implement post-training assessments (tests, observations, performance metrics). Document results and actions taken for ineffective training.",
      benefit: "Verifies training achieves desired competence levels and identifies improvement needs",
    },
  ],
};