# SignaSecure Enterprise - Complete Setup & Login Guide

## ✅ Verified Working Credentials

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `Admin@123`
- **Role:** Administrator (Full Access)
- **Login URL:** `http://localhost:5173/admin/login`

### Regular User Account
- **Email:** `user@example.com`
- **Password:** `User@123`
- **Role:** Standard User
- **Login URL:** `http://localhost:5173/login`

---

## 🚀 Quick Start Guide

### Step 1: Start Backend Server
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```
✓ Backend runs on: `http://localhost:8000`

### Step 2: Start Frontend Server
```bash
cd frontend
npm run dev
```
✓ Frontend runs on: `http://localhost:5173`

### Step 3: Access Application

**Landing Page:**
```
http://localhost:5173/
```

**Portal Selector:**
```
http://localhost:5173/auth
```

---

## 🔐 Login Instructions

### For Admin:
1. Go to: `http://localhost:5173/admin/login`
2. Enter Email: `admin@example.com`
3. Enter Password: `Admin@123`
4. Click "Sign In Securely"
5. ✓ You'll be redirected to Admin Dashboard

### For Regular User:
1. Go to: `http://localhost:5173/login`
2. Enter Email: `user@example.com`
3. Enter Password: `User@123`
4. Click "Sign In Securely"
5. ✓ You'll be redirected to User Dashboard

---

## 📊 Admin Dashboard Features

After logging in as admin, you can:

### 1. View Dashboard Metrics
- Active users count
- Protected workspaces
- Signals to review
- Total verifications

### 2. View Analytics Charts
- User status distribution (pie chart)
- User roles distribution (bar chart)
- MFA coverage (pie chart)
- Security posture (progress bars)

### 3. Manage Users
- Search users by name, email, or role
- Filter by status (Active, Pending, Suspended, Inactive)
- Filter by role
- View user details in table format

### 4. Export User Data to Excel
- Click "Export to Excel" button
- Confirm in dialog
- Download Excel file with all user information
- File format: `SignaSecure_Users_YYYY-MM-DD.xlsx`

---

## 👤 User Dashboard Features

After logging in as regular user, you can:

### 1. Signature Verification
- Upload signature images
- Compare two signatures
- View verification results with confidence scores
- See fraud detection alerts

### 2. Signature Management
- Upload and enroll new signatures
- Manage signature templates
- View enrollment history

### 3. Analytics
- View verification statistics
- See weekly verification volume
- Track average match scores
- Monitor ML metrics

### 4. Reports
- Generate verification reports
- Select date ranges
- Export reports to PDF
- View verification history

### 5. Settings
- Manage profile information
- Update security settings
- Configure notification preferences

---

## 🎨 Professional UI Features

### Portal Selector (`/auth`)
- Clean, professional interface
- Separate cards for User and Admin portals
- Feature highlights for each portal
- Smooth animations and transitions

### Professional Login Page
- Email validation
- Password strength requirements
- Show/hide password toggle
- Remember me checkbox
- Forgot password link
- Real-time form validation
- Security information footer

### Responsive Design
- ✅ Mobile devices (xs)
- ✅ Tablets (md)
- ✅ Desktop (lg)

---

## 🛠️ Troubleshooting

### Login Not Working
**Solution:**
1. Verify backend is running on port 8000
2. Check that frontend is running on port 5173
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try incognito/private window
5. Check browser console for errors (F12)

### Backend Connection Error
**Solution:**
1. Ensure backend server is running
2. Check CORS configuration in `config/settings.py`
3. Verify API endpoints are accessible
4. Check network tab in browser DevTools

### Password Not Working
**Solution:**
1. Verify you're using correct password: `Admin@123` or `User@123`
2. Check that email is correct
3. Ensure Caps Lock is off
4. Try copying/pasting credentials

### Excel Export Not Working
**Solution:**
1. Ensure you're logged in as admin
2. Verify xlsx package is installed
3. Check browser download settings
4. Try exporting with no filters first

---

## 📁 Project Structure

```
SignaSecure-Enterprise/
├── backend/
│   ├── apps/
│   │   ├── authentication/
│   │   ├── users/
│   │   ├── signatures/
│   │   ├── verification/
│   │   └── ...
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   └── ...
│   │   ├── components/
│   │   ├── store/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔄 User Flow

```
Landing Page (/)
    ↓
Portal Selector (/auth)
    ├→ User Portal
    │   ├→ Login (/login)
    │   └→ Dashboard (/dashboard)
    │       ├→ Verification
    │       ├→ Upload
    │       ├→ Analytics
    │       ├→ Reports
    │       └→ Settings
    │
    └→ Admin Portal
        ├→ Login (/admin/login)
        └→ Admin Dashboard (/admin/dashboard)
            ├→ Dashboard Overview
            ├→ User Management (/admin/users)
            ├→ Fraud Monitoring
            └→ Audit Logs
```

---

## 📚 Documentation Files

- `README.md` - Project overview and features
- `AUTHENTICATION_GUIDE.md` - Complete authentication system documentation
- `ADMIN_SETUP.md` - Admin setup and credentials guide

---

## ✅ Verification Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] Can access landing page
- [ ] Can access portal selector
- [ ] Can login with admin credentials
- [ ] Can view admin dashboard
- [ ] Can view user management page
- [ ] Can export users to Excel
- [ ] Can view charts and analytics
- [ ] Can login with regular user account
- [ ] Can access user dashboard
- [ ] Can verify signatures
- [ ] Can upload signatures
- [ ] Can view analytics
- [ ] Can generate reports

---

## 🎯 Key Features Implemented

### Authentication System
- ✅ Professional portal selector
- ✅ Professional login page
- ✅ Email/password authentication
- ✅ Admin and user roles
- ✅ JWT token-based sessions

### Admin Dashboard
- ✅ Real-time metrics
- ✅ User analytics charts
- ✅ User management table
- ✅ Excel data export
- ✅ Advanced filtering

### User Dashboard
- ✅ Signature verification
- ✅ Signature comparison
- ✅ Real-time results
- ✅ Fraud detection
- ✅ Analytics and reports

### UI/UX
- ✅ Professional MNC-style design
- ✅ Dark theme with teal accents
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Material-UI components

---

## 🚀 Next Steps

1. Login with provided credentials
2. Explore admin dashboard
3. Manage users and view analytics
4. Export user data to Excel
5. Test signature verification features
6. Generate reports

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

All components are working and tested!
