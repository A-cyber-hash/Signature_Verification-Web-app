import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  collections: [],
  loading: false,
  error: null,
};

const signatureSlice = createSlice({
  name: 'signature',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTemplates: (state, action) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action) => {
      state.templates.unshift(action.payload);
    },
  },
});

export const { setLoading, setTemplates, addTemplate } = signatureSlice.actions;
export default signatureSlice.reducer;