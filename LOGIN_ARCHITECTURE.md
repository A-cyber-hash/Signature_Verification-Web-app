# 🔐 Login System - Architecture & Flow

## Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER OPENS APPLICATION                        │
│                   http://localhost:3000                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                                  │
│              (AuthPortalSelector Component)                      │
│                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────┐           │
│  │   User Portal        │    │  Admin Portal        │           │
│  │  (Click to login)    │    │  (Click to login)    │           │
│  └──────────────────────┘    └──────────────────────┘           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │   USER LOGIN PAGE    │  │  ADMIN LOGIN PAGE    │
    │   /login             │  │  /admin/login        │
    └──────────────────────┘  └──────────────────────┘
                │                         │
                │ Pre-filled:             │ Pre-filled:
                │ Email: user@...         │ Email: admin@...
                │ Password: User@123      │ Password: Admin@123
                │                         │
                └────────────┬────────────┘
                             │
                             ▼
        ┌────────────────────────────────────┐
        │   USER ENTERS CREDENTIALS          │
        │   (or uses pre-filled values)       │
        │                                    │
        │   Email: user@example.com          │
        │   Password: User@123               │
        │                                    │
        │   [Sign In Securely Button]        │
        └────────────────────┬───────────────┘
                             │
                             ▼
        ┌────────────────────────────────────┐
        │   FORM VALIDATION                  │
        │   - Email format check             │
        │   - Password not empty             │
        │   - Both fields required           │
        └────────────────────┬───────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ❌ INVALID          ✅ VALID
                    │                 │
                    ▼                 ▼
            Show Error Message   Send to Backend
                    │                 │
                    │                 ▼
                    │    ┌──────────────────────────────┐
                    │    │  BACKEND: /api/v1/auth/login/│
                    │    │                              │
                    │    │  POST Request:               │
                    │    │  {                           │
                    │    │    "email": "user@...",      │
                    │    │    "password": "User@123",   │
                    │    │    "is_admin": false         │
                    │    │  }                           │
                    │    └──────────────────┬───────────┘
                    │                       │
                    │                       ▼
                    │    ┌──────────────────────────────┐
                    │    │  AUTHENTICATE USER           │
                    │    │  - Find user by email        │
                    │    │  - Verify password           │
                    │    │  - Check user status         │
                    │    └──────────────────┬───────────┘
                    │                       │
                    │            ┌──────────┴──────────┐
                    │            │                     │
                    │      ❌ FAILED          ✅ SUCCESS
                    │            │                     │
                    │            ▼                     ▼
                    │    Return Error         Generate JWT Tokens
                    │    (401/404)            - Access Token (1h)
                    │            │            - Refresh Token (7d)
                    │            │                     │
                    │            │            Return User Data
                    │            │            + Tokens
                    │            │                     │
                    └────────────┬─────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────┐
        │   FRONTEND RECEIVES RESPONSE       │
        │                                    │
        │   ✅ Success:                      │
        │   - Save tokens to localStorage    │
        │   - Update Redux state             │
        │   - Set isAuthenticated = true     │
        │   - Set user data                  │
        │                                    │
        │   ❌ Error:                        │
        │   - Show error message             │
        │   - Keep user on login page        │
        └────────────────────┬───────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ❌ ERROR            ✅ SUCCESS
                    │                 │
                    ▼                 ▼
            Stay on Login Page   Redirect to Dashboard
                    │                 │
                    │                 ├─ User → /dashboard
                    │                 │
                    │                 └─ Admin → /admin/dashboard
                    │                         │
                    │                         ▼
                    │            ┌──────────────────────────┐
                    │            │  DASHBOARD LOADED        │
                    │            │  - User data displayed   │
                    │            │  - Navigation available  │
                    │            │  - Features accessible   │
                    │            └──────────────────────────┘
                    │
                    └─ User can try again or clear cache
```

## Component Architecture

```
App.jsx
├── Routes
│   ├── /auth → AuthPortalSelector
│   │   ├── User Portal Card → /login
│   │   └── Admin Portal Card → /admin/login
│   │
│   ├── /login → LoginPage
│   │   └── ProfessionalLoginPage (isAdmin=false)
│   │       ├── Email Input (pre-filled: user@example.com)
│   │       ├── Password Input (pre-filled: User@123)
│   │       ├── Show/Hide Password Toggle
│   │       ├── Remember Me Checkbox
│   │       ├── Sign In Button
│   │       └── Error Alert (if login fails)
│   │
│   ├── /admin/login → AdminLoginPage
│   │   └── ProfessionalLoginPage (isAdmin=true)
│   │       ├── Email Input (pre-filled: admin@example.com)
│   │       ├── Password Input (pre-filled: Admin@123)
│   │       ├── Show/Hide Password Toggle
│   │       ├── Remember Me Checkbox
│   │       ├── Sign In Button
│   │       └── Error Alert (if login fails)
│   │
│   ├── /dashboard → ProtectedRoute → DashboardPage
│   └── /admin/dashboard → ProtectedRoute → AdminDashboardPage
│
└── Redux Store
    └── authSlice
        ├── loginUser (thunk)
        ├── initializeAuth (thunk)
        ├── logoutUser (thunk)
        └── State:
            ├── user (object)
            ├── token (string)
            ├── isAuthenticated (boolean)
            ├── isAdmin (boolean)
            ├── loading (boolean)
            └── error (string)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
│                                                                 │
│  ProfessionalLoginPage                                          │
│  ├── State: email, password, loading, error                    │
│  ├── Dispatch: loginUser(email, password, isAdmin)             │
│  └── Subscribe: auth.loading, auth.error, auth.isAuthenticated │
│                                                                 │
│  Redux Store (authSlice)                                        │
│  ├── loginUser Thunk                                            │
│  │   ├── Call: authAPI.login()                                 │
│  │   ├── Validate: response.tokens.access                      │
│  │   ├── Validate: response.user                               │
│  │   └── Return: { user, tokens }                              │
│  │                                                              │
│  │   On Success:                                               │
│  │   ├── Save tokens to localStorage                           │
│  │   ├── Update state.user                                     │
│  │   ├── Update state.token                                    │
│  │   ├── Set state.isAuthenticated = true                      │
│  │   └── Set state.isAdmin = true/false                        │
│  │                                                              │
│  │   On Error:                                                 │
│  │   ├── Set state.error = errorMessage                        │
│  │   └── Keep state.isAuthenticated = false                    │
│  │                                                              │
│  └── API Service (axios)                                        │
│      ├── Base URL: http://localhost:8000/api/v1                │
│      ├── Interceptor: Add Authorization header                 │
│      ├── Interceptor: Handle 401 errors                        │
│      └── Interceptor: Log requests/responses                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP POST
                             │ /api/v1/auth/login/
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Django)                           │
│                                                                 │
│  DirectLoginView (APIView)                                      │
│  ├── Extract: email, password, is_admin                        │
│  ├── Validate: email or phone required                         │
│  ├── Find: User by email or username                           │
│  ├── Authenticate: Check password                              │
│  ├── Authorize: Check admin role if is_admin=true              │
│  └── Generate: JWT tokens (access + refresh)                   │
│                                                                 │
│  Response:                                                      │
│  {                                                              │
│    "user": {                                                    │
│      "id": "uuid",                                              │
│      "email": "user@example.com",                               │
│      "first_name": "Demo",                                      │
│      "last_name": "User",                                       │
│      "role_type": "user",                                       │
│      "status": "active",                                        │
│      ...                                                        │
│    },                                                           │
│    "tokens": {                                                  │
│      "access": "eyJ...",                                        │
│      "refresh": "eyJ..."                                        │
│    }                                                            │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## State Management

```
Redux Store (authSlice)
│
├── Initial State
│   ├── user: null
│   ├── token: null (from localStorage)
│   ├── isAuthenticated: false
│   ├── isAdmin: false
│   ├── loading: false
│   └── error: null
│
├── Actions
│   ├── clearError() → error = null
│   ├── resetAuthFormState() → error = null
│   └── updateUser(payload) → user = {...user, ...payload}
│
├── Thunks
│   ├── loginUser({ email, password, isAdmin })
│   │   ├── Pending: loading = true, error = null
│   │   ├── Fulfilled: 
│   │   │   ├── isAuthenticated = true
│   │   │   ├── user = response.user
│   │   │   ├── token = response.tokens.access
│   │   │   ├── isAdmin = role_type in ['admin', 'super_admin']
│   │   │   └── Save tokens to localStorage
│   │   └── Rejected: loading = false, error = errorMessage
│   │
│   ├── initializeAuth()
│   │   ├── Check localStorage for token
│   │   ├── If token exists, fetch /users/me/
│   │   └── Set isAuthenticated based on response
│   │
│   └── logoutUser()
│       ├── Call /auth/logout/
│       ├── Clear localStorage
│       └── Reset state to initial
│
└── Selectors
    ├── state.auth.user
    ├── state.auth.token
    ├── state.auth.isAuthenticated
    ├── state.auth.isAdmin
    ├── state.auth.loading
    └── state.auth.error
```

## Error Handling Flow

```
User Input
    │
    ▼
Form Validation
    │
    ├─ ❌ Invalid Email → Show "Please enter a valid email"
    ├─ ❌ Empty Password → Show "Password is required"
    └─ ✅ Valid → Continue
    │
    ▼
API Request
    │
    ├─ ❌ Network Error → Show "Cannot connect to server"
    ├─ ❌ 401 Unauthorized → Show "Invalid login credentials"
    ├─ ❌ 404 Not Found → Show "No active account found"
    ├─ ❌ 403 Forbidden → Show "Admin access required"
    ├─ ❌ 500 Server Error → Show "Server error. Please try again"
    └─ ✅ 200 OK → Continue
    │
    ▼
Response Validation
    │
    ├─ ❌ Missing tokens → Show "Invalid authentication response"
    ├─ ❌ Missing user → Show "User data missing from response"
    └─ ✅ Valid → Continue
    │
    ▼
Login Success
    │
    ├─ Save tokens to localStorage
    ├─ Update Redux state
    ├─ Redirect to dashboard
    └─ Display user data
```

## Security Flow

```
1. User enters credentials
   ↓
2. Frontend validates input
   ↓
3. Frontend sends HTTPS POST to backend
   ↓
4. Backend validates credentials
   ↓
5. Backend generates JWT tokens
   - Access Token (1 hour expiry)
   - Refresh Token (7 days expiry)
   ↓
6. Frontend receives tokens
   ↓
7. Frontend stores in localStorage
   ↓
8. Frontend adds token to Authorization header
   Authorization: Bearer <access_token>
   ↓
9. All subsequent API requests include token
   ↓
10. Backend validates token on each request
    ↓
11. If token expired, use refresh token to get new access token
    ↓
12. If refresh token expired, redirect to login
```

---

**This diagram shows the complete login flow from user opening the app to accessing the dashboard.**
