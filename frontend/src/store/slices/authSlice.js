import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import api from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, phone, password, isAdmin = false }, { rejectWithValue }) => {
    try {
      console.log('🔐 Login attempt:', { email, isAdmin });
      const res = await authAPI.login({ email, phone, password, isAdmin });

      if (!res.data) {
        return rejectWithValue('No response from server');
      }

      if (!res.data.tokens || !res.data.tokens.access) {
        return rejectWithValue('Invalid authentication response');
      }

      if (!res.data.user) {
        return rejectWithValue('User data missing from response');
      }

      console.log('✅ Login successful:', res.data.user.email);
      return res.data;
    } catch (e) {
      console.error('❌ Login error:', e);
      const errorMsg = e.response?.data?.error || e.message || 'Login failed. Please try again.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const initializeAuth = createAsyncThunk('auth/initializeAuth', async () => {
  const token = localStorage.getItem('signasecure_token');
  if (!token) return { isAuthenticated: false };
  try {
    const res = await api.get('/users/me/');
    return { isAuthenticated: true, user: res.data, token };
  } catch {
    localStorage.removeItem('signasecure_token');
    localStorage.removeItem('signasecure_refresh');
    return { isAuthenticated: false };
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  const refresh = localStorage.getItem('signasecure_refresh');
  try {
    await authAPI.logout(refresh);
  } catch {
    // Local credentials must still be cleared when the server is unavailable.
  }
  localStorage.removeItem('signasecure_token');
  localStorage.removeItem('signasecure_refresh');
});

// ── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  token: localStorage.getItem('signasecure_token'),
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
};

function handleLoginSuccess(state, payload) {
  state.loading = false;
  state.isAuthenticated = true;
  state.user = payload.user;
  state.token = payload.tokens?.access;
  state.isAdmin =
    payload.user?.role_type && ['admin', 'super_admin'].includes(payload.user.role_type);
  state.error = null;
  if (payload.tokens) {
    localStorage.setItem('signasecure_token', payload.tokens.access);
    localStorage.setItem('signasecure_refresh', payload.tokens.refresh);
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    resetAuthFormState: state => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: builder => {
    const pending = state => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        handleLoginSuccess(state, action.payload);
      })
      .addCase(loginUser.rejected, rejected)

      // Init
      .addCase(initializeAuth.pending, pending)
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isAdmin =
          action.payload.user?.role_type &&
          ['admin', 'super_admin'].includes(action.payload.user.role_type);
      })

      // Logout
      .addCase(logoutUser.fulfilled, state => {
        Object.assign(state, initialState);
        state.token = null;
      });
  },
});

export const { clearError, resetAuthFormState, updateUser } = authSlice.actions;
export default authSlice.reducer;
