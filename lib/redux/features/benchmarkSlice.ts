import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BenchmarkData } from '@/types/benchmark';

interface BenchmarkState {
  analysisResults: BenchmarkData | null;
  history: unknown[]; // Placeholder for history if needed
}

const initialState: BenchmarkState = {
  analysisResults: null,
  history: [],
};

const benchmarkSlice = createSlice({
  name: 'benchmark',
  initialState,
  reducers: {
    setAnalysisResults: (state, action: PayloadAction<BenchmarkData | null>) => {
      state.analysisResults = action.payload;
    },
    clearResults: (state) => {
      state.analysisResults = null;
    },
  },
});

export const { setAnalysisResults, clearResults } = benchmarkSlice.actions;

export default benchmarkSlice.reducer;
