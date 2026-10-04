# 📋 Step-by-Step Login Testing Guide

## ✅ Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- Backend database initialized
- Port 3000 (frontend) and 8000 (backend) available

## 🚀 Step 1: Start Backend Server

### Open Terminal 1
```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise/backend
```

### Activate Virtual Environment
```bash
source venv/bin/activate
# On Windows: venv\Scripts\activate
```

### Start Django Server
```bash
python manage.py runserver
```

### Expected Output
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Verify Backend is Running
Open another terminal and run:
```bash
curl http://localhost:8000/health/
```

Expected response:
```json
{"status": "ok", "service": "SignaSecure Enterprise"}
```

---

## 🚀 Step 2: Start Frontend Server

### Open Terminal 2
```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise/frontend
```

### Install Dependencies (if not already done)
```bash
npm install
```

### Start React Development Server
```bash
npm start
```

### Expected Output
```
Local: http://localhost:3000
```

### Browser Should Open Automatically
If not, manually open: `http://localhost:3000`

---

## 🧪 Step 3: Test User Login

### Step 3.1: Navigate to Login Page
1. You should see the landing page with two portal options
2. Click on **"User Portal"** card
3. You should be redirected to `/login`

### Step 3.2: Verify Pre-filled Credentials
1. Email field should show: `user@example.com`
2. Password field should show: `User@123`
3. Both fields are pre-filled for easy testing

### Step 3.3: Submit Login Form
1. Click the **"Sign In Securely"** button
2. You should see a loading spinner
3. Wait for the request to complete (usually 1-2 seconds)

### Step 3.4: Verify Successful Login
1. Page should redirect to `/dashboard`
2. You should see the user dashboard
3. User data should be displayed (name, email, etc.)
4. Navigation menu should be visible

### Step 3.5: Check Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. You should see logs like:
```
🔗 API Base URL: http://localhost:8000/api/v1
🔐 Login attempt: {email: "user@example.com", isAdmin: false}
✅ Login successful: user@example.com
```

### Step 3.6: Check Network Tab
1. Go to Network tab in Developer Tools
2. Look for POST request to `/api/v1/auth/login/`
3. Response should show:
   - Status: 200
   - Response body includes `user` and `tokens`

### Step 3.7: Verify Tokens Saved
1. Go to Application tab in Developer Tools
2. Click on "Local Storage"
3. Select `http://localhost:3000`
4. You should see:
   - `signasecure_token` (JWT access token)
   - `signasecure_refresh` (JWT refresh token)

---

## 🧪 Step 4: Test Admin Login

### Step 4.1: Logout First
1. Click on user profile menu (top right)
2. Click "Logout"
3. You should be redirected to `/auth`

### Step 4.2: Navigate to Admin Login
1. You should see the portal selector page
2. Click on **"Administrator Portal"** card
3. You should be redirected to `/admin/login`

### Step 4.3: Verify Pre-filled Credentials
1. Email field should show: `admin@example.com`
2. Password field should show: `Admin@123`
3. Both fields are pre-filled

### Step 4.4: Submit Login Form
1. Click the **"Sign In Securely"** button
2. You should see a loading spinner
3. Wait for the request to complete

### Step 4.5: Verify Successful Admin Login
1. Page should redirect to `/admin/dashboard`
2. You should see the admin dashboard
3. Admin statistics should be displayed
4. Admin navigation menu should be visible

### Step 4.6: Check Console Logs
```
🔐 Login attempt: {email: "admin@example.com", isAdmin: true}
✅ Login successful: admin@example.com
```

---

## 🧪 Step 5: Test Error Handling

### Step 5.1: Test Invalid Email
1. Go back to `/login`
2. Clear the email field
3. Type: `invalid-email`
4. Click "Sign In Securely"
5. You should see error: "Please enter a valid email"

### Step 5.2: Test Empty Password
1. Clear the password field
2. Click "Sign In Securely"
3. You should see error: "Password is required"

### Step 5.3: Test Wrong Password
1. Email: `user@example.com`
2. Password: `WrongPassword123`
3. Click "Sign In Securely"
4. You should see error: "Invalid login credentials"

### Step 5.4: Test Non-existent User
1. Email: `nonexistent@example.com`
2. Password: `User@123`
3. Click "Sign In Securely"
4. You should see error: "No active account found"

---

## 🧪 Step 6: Test Session Management

### Step 6.1: Test Remember Me
1. Go to `/login`
2. Check the "Remember me" checkbox
3. Login with `user@example.com` / `User@123`
4. Close the browser
5. Reopen `http://localhost:3000`
6. You should still be logged in (session persisted)

### Step 6.2: Test Logout
1. Click on user profile menu (top right)
2. Click "Logout"
3. You should be redirected to `/auth`
4. Tokens should be cleared from localStorage
5. Trying to access `/dashboard` should redirect to `/login`

### Step 6.3: Test Token Refresh
1. Login with `user@example.com` / `User@123`
2. Wait for access token to expire (1 hour)
3. Make any API request
4. System should automatically use refresh token
5. New access token should be generated
6. You should remain logged in

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to server"
**Solution:**
1. Check if backend is running: `curl http://localhost:8000/health/`
2. Check if port 8000 is available
3. Restart backend server

### Issue: "Invalid login credentials"
**Solution:**
1. Verify email is exactly: `user@example.com` or `admin@example.com`
2. Verify password is exactly: `User@123` or `Admin@123`
3. Passwords are case-sensitive
4. Check backend logs for errors

### Issue: "Something went wrong"
**Solution:**
1. Open browser console (F12)
2. Check for error messages
3. Check Network tab for API response
4. Clear localStorage: `localStorage.clear()`
5. Refresh page: Ctrl+Shift+R

### Issue: Tokens not saving
**Solution:**
1. Check if localStorage is enabled
2. Check browser privacy settings
3. Try in incognito/private mode
4. Check Application tab in DevTools

### Issue: Redirect not working
**Solution:**
1. Check browser console for errors
2. Verify Redux state is updated
3. Check that tokens are saved
4. Try clearing cache and reloading

---

## ✅ Checklist

- [ ] Backend is running on http://localhost:8000
- [ ] Frontend is running on http://localhost:3000
- [ ] Can see landing page with portal options
- [ ] User login works with pre-filled credentials
- [ ] User redirects to `/dashboard`
- [ ] Admin login works with pre-filled credentials
- [ ] Admin redirects to `/admin/dashboard`
- [ ] Tokens are saved in localStorage
- [ ] Console shows success logs
- [ ] Network tab shows 200 response
- [ ] Error handling works for invalid inputs
- [ ] Logout clears tokens
- [ ] Can login again after logout

---

## 📊 Expected Results

### User Login
```
Input:
- Email: user@example.com
- Password: User@123

Expected Output:
- Redirect to /dashboard
- User data displayed
- Tokens saved in localStorage
- Console shows: ✅ Login successful: user@example.com
```

### Admin Login
```
Input:
- Email: admin@example.com
- Password: Admin@123

Expected Output:
- Redirect to /admin/dashboard
- Admin statistics displayed
- Tokens saved in localStorage
- Console shows: ✅ Login successful: admin@example.com
```

---

## 🎯 Next Steps After Login Works

1. ✅ Test user dashboard features
2. ✅ Test admin dashboard features
3. ✅ Test signature verification
4. ✅ Test user management
5. ✅ Test analytics and reports
6. ✅ Test logout functionality

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2024
