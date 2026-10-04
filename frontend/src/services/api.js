import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

console.log('🔗 API Base URL:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('signasecure_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log(`📥 Response from ${res.config.url}:`, res.status);
    return res;
  },
  async (error) => {
    const errorData = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    };
    console.error('❌ API Error:', errorData);

    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('signasecure_refresh');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          localStorage.setItem('signasecure_token', res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return api(error.config);
        } catch (e) {
          console.error('Token refresh failed:', e);
          localStorage.clear();
          window.location.href = '/auth';
        }
      }
    }

    if (!error.response) {
      error.message = `Network Error: Cannot connect to ${API_BASE}. Make sure the backend server is running on http://localhost:8000`;
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: ({ email, phone, password, isAdmin = false }) => {
    console.log('🔐 Attempting login with:', { email, phone, isAdmin });
    return api.post('/auth/login/', { email, phone, password, is_admin: isAdmin });
  },

  register: (payload) => {
    console.log('📝 Attempting registration with:', { email: payload.email, first_name: payload.first_name });
    return api.post('/auth/register/', payload);
  },

  sendPhoneOTP: (phone, purpose = 'login', isAdmin = false) => {
    console.log('📱 Sending phone OTP to:', phone);
    return api.post('/auth/otp/phone/send/', { phone, purpose, is_admin: isAdmin });
  },

  verifyPhoneOTP: (phone, code, purpose = 'login', isAdmin = false) => {
    console.log('✓ Verifying phone OTP for:', phone);
    return api.post('/auth/otp/phone/verify/', { phone, code, purpose, is_admin: isAdmin });
  },

  sendEmailOTP: (email, purpose = 'login', isAdmin = false) => {
    console.log('📧 Sending email OTP to:', email);
    return api.post('/auth/otp/email/send/', { email, purpose, is_admin: isAdmin });
  },

  verifyEmailOTP: (email, code, purpose = 'login', isAdmin = false) => {
    console.log('✓ Verifying email OTP for:', email);
    return api.post('/auth/otp/email/verify/', { email, code, purpose, is_admin: isAdmin });
  },

  resetPassword: (payload) => api.post('/auth/password/reset/', payload),

  logout: (refresh) => {
    console.log('🚪 Logging out...');
    return api.post('/auth/logout/', { refresh });
  },
};

export const userAPI = {
  getUsers: (search = '') => api.get('/users/', { params: search ? { search } : {} }),
  updateUserStatus: (userId, status) => api.patch(`/users/${userId}/status/`, { status }),
};

export const verificationAPI = {
  getTemplates: () => {
    console.log('📋 Fetching templates...');
    return api.get('/verification/templates/');
  },

  verifySignature: (templateId, capturedImageBase64) => {
    console.log('🔍 Verifying signature with template:', templateId);
    return api.post('/verification/verify/', {
      template_id: templateId,
      captured_image_base64: capturedImageBase64,
    });
  },

  verifySignatureFile: (templateId, imageFile) => {
    console.log('📸 Verifying signature from file:', imageFile.name);
    const formData = new FormData();
    formData.append('template_id', templateId);
    formData.append('captured_image', imageFile);
    return api.post('/verification/verify/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  compareSignatures: (sig1Base64, sig2Base64) => {
    console.log('⚖️ Comparing two signatures...');
    return api.post('/verification/compare/', {
      signature1_image_base64: sig1Base64,
      signature2_image_base64: sig2Base64,
    });
  },
};

export const healthCheck = async () => {
  try {
    const response = await axios.get('http://localhost:8000/health/', {
      timeout: 5000,
    });
    console.log('✅ Backend is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    return false;
  }
};

export default api;
