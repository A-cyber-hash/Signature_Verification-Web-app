import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboardData: null,
  reports: [],
  metrics: {},
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },
    setMetrics: (state, action) => {
      state.metrics = action.payload;
    },
  },
});

export const { setLoading, setDashboardData, setMetrics } = analyticsSlice.actions;
export default analyticsSlice.reducer;