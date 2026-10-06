import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GeneratedDocumentData, ISONavigatorFormData, ChatHistoryItem } from '@/types/iso-navigator';

interface ISONavigatorState {
  currentStep: number;
  formData: ISONavigatorFormData;
  generatedDocument: GeneratedDocumentData | null;
  /** Cache keyed by `${standard}::${documentTitle}` so IMS/standard context stays correct. */
  generatedDocumentsByKey: Record<string, GeneratedDocumentData>;
  chatHistory: ChatHistoryItem[];
  sessionId: string | null;
}

const initialState: ISONavigatorState = {
  currentStep: 1,
  formData: {
    organization_context: '',
    specific_requirements: '',
    tone: 'professional',
    language: 'English',
    output_type: '',
    document_title: '',
    clause: '',
    document_taxonomy: undefined,
  },
  generatedDocument: null,
  generatedDocumentsByKey: {},
  chatHistory: [],
  sessionId: null,
};

/** Build a cache key that includes standard/IMS + document title. */
export function navigatorDocumentCacheKey(
  specificRequirements: string | undefined,
  documentTitle: string | undefined,
): string {
  const std = (specificRequirements || '').trim();
  const doc = (documentTitle || '').trim();
  if (!doc) return '';
  return `${std}::${doc}`;
}

function cacheGeneratedDocument(
  state: ISONavigatorState,
  doc: GeneratedDocumentData,
) {
  state.generatedDocument = doc;
  const titleKey = navigatorDocumentCacheKey(
    state.formData.specific_requirements,
    doc.title || state.formData.output_type || state.formData.document_title,
  );
  const outputKey = navigatorDocumentCacheKey(
    state.formData.specific_requirements,
    state.formData.output_type || state.formData.document_title,
  );
  if (titleKey) state.generatedDocumentsByKey[titleKey] = doc;
  if (outputKey && outputKey !== titleKey) {
    state.generatedDocumentsByKey[outputKey] = doc;
  }
  // Keep wizard on document step so context/standards/IMS stay editable
  // and further documents generate inline without restarting the flow.
  if (state.currentStep < 3) state.currentStep = 3;
}

const isoNavigatorSlice = createSlice({
  name: 'isoNavigator',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<ISONavigatorState['formData']>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setGeneratedDocument: (state, action: PayloadAction<GeneratedDocumentData>) => {
      cacheGeneratedDocument(state, action.payload);
    },
    /** Restore a previously generated doc without an API call. */
    restoreGeneratedDocument: (state, action: PayloadAction<GeneratedDocumentData>) => {
      state.generatedDocument = action.payload;
      if (state.currentStep < 3) state.currentStep = 3;
    },
    /** Clear the visible result only — keep per-standard cache for reuse. */
    clearGeneratedDocument: (state) => {
      state.generatedDocument = null;
    },
    addChatMessage: (
      state,
      action: PayloadAction<{
        role: 'user' | 'ai';
        content: string;
        sources?: ChatHistoryItem['sources'];
      }>,
    ) => {
      state.chatHistory.push(action.payload);
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    resetNavigator: () => {
      return initialState;
    },
  },
});

export const {
  setStep,
  updateFormData,
  setGeneratedDocument,
  restoreGeneratedDocument,
  clearGeneratedDocument,
  addChatMessage,
  setSessionId,
  resetNavigator,
} = isoNavigatorSlice.actions;

export default isoNavigatorSlice.reducer;
