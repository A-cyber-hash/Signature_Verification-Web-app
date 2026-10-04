# 🔍 LOGIN PAGE - DEBUGGING GUIDE

## Problem
Black screen when clicking on User Login or Admin Login

## What I Fixed

1. ✅ **Removed whileHover prop** - Was causing issues with MUI Card
2. ✅ **Simplified ProfessionalLoginPage** - Removed complex logic
3. ✅ **Added console logging** - To track what's happening
4. ✅ **Fixed build errors** - All syntax errors resolved

## How to Debug

### Step 1: Open Browser Console (F12)

Press `F12` and go to **Console** tab. You should see logs like:

```
Login page rendered: {isAdmin: false, email: "user@example.com", loading: false, error: null, isAuthenticated: false}
```

### Step 2: Check for Errors

Look for any red error messages in console. Common errors:

- `Cannot read property 'dispatch' of undefined` → Redux issue
- `Cannot find module` → Import issue
- `Unexpected token` → Syntax error

### Step 3: Check Network Tab

Go to **Network** tab and:
1. Click on User Login
2. Look for any failed requests
3. Check if API calls are being made

### Step 4: Check Redux State

In console, type:
```javascript
// Check if Redux is available
console.log(window.__REDUX_DEVTOOLS_EXTENSION__)

// Or check localStorage
console.log(localStorage.getItem('signasecure_token'))
```

## Step-by-Step Testing

### Test 1: Portal Selector Page
1. Go to `http://localhost:3000`
2. You should see two cards: "User Portal" and "Admin Portal"
3. Check console for any errors

### Test 2: Click User Portal
1. Click on "User Portal" card
2. Should navigate to `/login`
3. Check console for: `Login page rendered: {isAdmin: false, ...}`
4. You should see login form with pre-filled credentials

### Test 3: Click Admin Portal
1. Go back to `http://localhost:3000`
2. Click on "Admin Portal" card
3. Should navigate to `/admin/login`
4. Check console for: `Login page rendered: {isAdmin: true, ...}`
5. You should see login form with admin credentials

### Test 4: Try Login
1. Click "Sign In" button
2. Check console for: `Login attempt: {email: "...", password: "...", isAdmin: false}`
3. Check Network tab for POST to `/api/v1/auth/login/`
4. Should see response with user data and tokens

## Common Issues & Solutions

### Issue 1: Black Screen on Login Page
**Solution:**
1. Check browser console for errors
2. Check if component is rendering: `Login page rendered: ...`
3. Try hard refresh: `Ctrl+Shift+R`
4. Clear cache: `localStorage.clear()`

### Issue 2: Navigation Not Working
**Solution:**
1. Check if `useNavigate` is working
2. Check browser console for navigation logs
3. Check URL in address bar
4. Try clicking back button

### Issue 3: Form Not Showing
**Solution:**
1. Check if component is rendering
2. Check if Material-UI is loaded
3. Check browser console for errors
4. Try opening in incognito mode

### Issue 4: Login Button Not Working
**Solution:**
1. Check if form is submitting: `Login attempt: ...`
2. Check Network tab for API call
3. Check if backend is running
4. Check backend logs for errors

## Console Commands to Test

```javascript
// Check if Redux is working
console.log('Redux available:', !!window.__REDUX_DEVTOOLS_EXTENSION__)

// Check localStorage
console.log('Tokens:', {
  access: localStorage.getItem('signasecure_token'),
  refresh: localStorage.getItem('signasecure_refresh')
})

// Check API connection
fetch('http://localhost:8000/health/')
  .then(r => r.json())
  .then(d => console.log('Backend:', d))
  .catch(e => console.error('Backend error:', e))

// Check if component mounted
console.log('Component mounted')
```

## Expected Console Output

### When Page Loads
```
🔗 API Base URL: http://localhost:8000/api/v1
```

### When Clicking User Portal
```
Login page rendered: {
  isAdmin: false,
  email: "user@example.com",
  loading: false,
  error: null,
  isAuthenticated: false
}
```

### When Clicking Sign In
```
Login attempt: {
  email: "user@example.com",
  password: "User@123",
  isAdmin: false
}
Dispatching loginUser...
```

### On Successful Login
```
Login result: {payload: {...}, type: "auth/loginUser/fulfilled"}
Login successful, redirecting...
```

## Files to Check

1. **frontend/src/pages/auth/ProfessionalLoginPage.jsx**
   - Should render login form
   - Should have console logs

2. **frontend/src/pages/auth/LoginPage.jsx**
   - Should import ProfessionalLoginPage
   - Should pass isAdmin={false}

3. **frontend/src/pages/auth/AdminLoginPage.jsx**
   - Should import ProfessionalLoginPage
   - Should pass isAdmin={true}

4. **frontend/src/App.jsx**
   - Should have routes for /login and /admin/login
   - Should render LoginPage and AdminLoginPage

## Quick Fixes to Try

1. **Hard Refresh**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Clear Cache**
   ```javascript
   localStorage.clear()
   location.reload()
   ```

3. **Restart Frontend**
   ```bash
   # Stop: Ctrl+C
   # Start: npm start
   ```

4. **Restart Backend**
   ```bash
   # Stop: Ctrl+C
   # Start: python manage.py runserver
   ```

## What Should Happen

1. ✅ Portal selector page loads
2. ✅ Click "User Portal" → Navigate to /login
3. ✅ Login page shows with pre-filled credentials
4. ✅ Click "Sign In" → API call to backend
5. ✅ Backend returns tokens
6. ✅ Redirect to /dashboard
7. ✅ Dashboard loads with user data

## If Still Black Screen

1. Check browser console (F12) for errors
2. Check Network tab for failed requests
3. Check if backend is running: `curl http://localhost:8000/health/`
4. Check if frontend is running: `http://localhost:3000`
5. Try in incognito mode
6. Try different browser
7. Check firewall/antivirus blocking ports

---

**Please check the browser console and let me know what errors you see!**
