import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessions: [],
  currentSession: null,
  results: [],
  loading: false,
  error: null,
};

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addSession: (state, action) => {
      state.sessions.unshift(action.payload);
    },
    updateSession: (state, action) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
    },
  },
});

export const { setLoading, setError, addSession, updateSession } = verificationSlice.actions;
export default verificationSlice.reducer;