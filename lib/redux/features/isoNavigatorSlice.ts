// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { GeneratedDocumentData, ISONavigatorFormData, ChatHistoryItem } from '@/types/iso-navigator';

// interface ISONavigatorState {
//   currentStep: number;
//   formData: ISONavigatorFormData;
//   generatedDocument: GeneratedDocumentData | null;
//   chatHistory: ChatHistoryItem[];
//   sessionId: string | null;
// }

// const initialState: ISONavigatorState = {
//   currentStep: 1,
//   formData: {
//     organization_context: '',
//     specific_requirements: '',
//     tone: 'professional',
//     language: 'English',
//   },
//   generatedDocument: null,
//   chatHistory: [],
//   sessionId: null,
// };

// const isoNavigatorSlice = createSlice({
//   name: 'isoNavigator',
//   initialState,
//   reducers: {
//     setStep: (state, action: PayloadAction<number>) => {
//       state.currentStep = action.payload;
//     },
//     updateFormData: (state, action: PayloadAction<Partial<ISONavigatorState['formData']>>) => {
//       state.formData = { ...state.formData, ...action.payload };
//     },
//     setGeneratedDocument: (state, action: PayloadAction<GeneratedDocumentData>) => {
//       state.generatedDocument = action.payload;
//       state.currentStep = 4; // Result step
//     },
//     addChatMessage: (state, action: PayloadAction<{ role: 'user' | 'ai'; content: string }>) => {
//       state.chatHistory.push(action.payload);
//     },
//     setSessionId: (state, action: PayloadAction<string>) => {
//       state.sessionId = action.payload;
//     },
//     resetNavigator: () => {
//       return initialState;
//     },
//   },
// });

// export const { 
//   setStep, 
//   updateFormData, 
//   setGeneratedDocument, 
//   addChatMessage, 
//   setSessionId, 
//   resetNavigator 
// } = isoNavigatorSlice.actions;

// export default isoNavigatorSlice.reducer;



import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GeneratedDocumentData, ISONavigatorFormData, ChatHistoryItem } from '@/types/iso-navigator';

interface ISONavigatorState {
  currentStep: number;
  formData: ISONavigatorFormData;
  generatedDocument: GeneratedDocumentData | null;
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
  chatHistory: [],
  sessionId: null,
};

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
      state.generatedDocument = action.payload;
      state.currentStep = 4; // Result step
    },
    addChatMessage: (state, action: PayloadAction<{ role: 'user' | 'ai'; content: string }>) => {
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
  addChatMessage,
  setSessionId,
  resetNavigator
} = isoNavigatorSlice.actions;

export default isoNavigatorSlice.reducer;