// Types for assessment quiz
export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
  correctAnswer: string;
  hint: string;
  hintInsight: string;
  explanation: string;
}

export interface SelectedAnswers {
  [questionIndex: number]: string;
}
