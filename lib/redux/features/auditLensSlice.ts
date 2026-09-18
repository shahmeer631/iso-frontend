import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuditLensFormData, GeneratedAuditData, AuditChatHistoryItem } from '@/types/audit-lens';

interface AuditLensState {
  currentStep: number;
  formData: AuditLensFormData;
  generatedDocument: GeneratedAuditData | null;
  chatHistory: AuditChatHistoryItem[];
  sessionId: string | null;
}

const initialState: AuditLensState = {
  currentStep: 1,
  formData: {
    stage: '',
    material_type: '',
    previous_audit_findings: '',
    scope_description: '',
  },
  generatedDocument: null,
  chatHistory: [],
  sessionId: null,
};

const auditLensSlice = createSlice({
  name: 'auditLens',
  initialState,
  reducers: {
    setAuditStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateAuditFormData: (state, action: PayloadAction<Partial<AuditLensFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setGeneratedAuditDocument: (state, action: PayloadAction<GeneratedAuditData>) => {
      state.generatedDocument = action.payload;
      state.currentStep = 4; // Result step
    },
    addAuditChatMessage: (state, action: PayloadAction<AuditChatHistoryItem>) => {
      state.chatHistory.push(action.payload);
    },
    setAuditSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    resetAuditLens: () => {
      return initialState;
    },
  },
});

export const { 
  setAuditStep, 
  updateAuditFormData, 
  setGeneratedAuditDocument, 
  addAuditChatMessage, 
  setAuditSessionId, 
  resetAuditLens 
} = auditLensSlice.actions;

export default auditLensSlice.reducer;
