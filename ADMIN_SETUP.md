# SignaSecure Enterprise - Admin Credentials & Setup Guide

## 🔐 Default Admin Account

**Email:** `admin@signasecure.com`  
**Password:** `StrongPass123!`

---

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd backend
python manage.py runserver
```
Backend runs on: `http://localhost:8000`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 3. Access the Application

**Landing Page:**
```
http://localhost:5173/
```

**Portal Selector:**
```
http://localhost:5173/auth
```

**User Login:**
```
http://localhost:5173/login
```

**Admin Login:**
```
http://localhost:5173/admin/login
```

---

## 👤 Test Accounts

### Administrator Account
- **Email:** `admin@signasecure.com`
- **Password:** `StrongPass123!`
- **Role:** Administrator
- **Access:** Full admin dashboard with user management, data export, analytics

### Regular User Account
- **Email:** `user@example.com`
- **Password:** `StrongPass123!`
- **Role:** Standard User
- **Access:** User dashboard, signature verification, reports

---

## 📊 Admin Dashboard Features

### After logging in as admin, you can:

1. **View Dashboard Metrics**
   - Active users count
   - Protected workspaces
   - Signals to review
   - Total verifications

2. **View Analytics Charts**
   - User status distribution (pie chart)
   - User roles distribution (bar chart)
   - MFA coverage (pie chart)
   - Security posture (progress bars)

3. **Manage Users**
   - Search users by name, email, or role
   - Filter by status (Active, Pending, Suspended, Inactive)
   - Filter by role
   - View user details in table format
   - **Export user data to Excel**

4. **Export User Data**
   - Click "Export to Excel" button
   - Confirm in dialog
   - Download Excel file with all user information
   - File format: `SignaSecure_Users_YYYY-MM-DD.xlsx`

---

## 🎯 Professional Login System Features

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

---

## 📱 Responsive Design

All pages are fully responsive:
- ✅ Mobile devices (xs)
- ✅ Tablets (md)
- ✅ Desktop (lg)

---

## 🔄 User Flow

```
Landing Page (/):
  ↓
  [Access Portal] → Portal Selector (/auth)
                      ↓
                      ├→ User Portal → Login (/login) → Dashboard
                      └→ Admin Portal → Login (/admin/login) → Admin Dashboard
```

---

## 🛠️ Troubleshooting

### Backend Connection Issues
- Ensure backend is running on port 8000
- Check CORS configuration in `config/settings.py`
- Verify API endpoints are accessible

### Frontend Issues
- Clear browser cache
- Check that all npm packages are installed
- Verify Vite proxy configuration in `vite.config.js`

### Login Issues
- Verify email format is correct
- Check password meets minimum requirements (6+ characters)
- Ensure user account exists in database
- Check browser console for API errors

### Excel Export Issues
- Ensure you're logged in as admin
- Verify xlsx package is installed (`npm list xlsx`)
- Check browser download settings
- Try exporting with no filters first

---

## 📚 Documentation

For detailed information, see:
- `AUTHENTICATION_GUIDE.md` - Complete authentication system documentation
- `README.md` - Project overview and features

---

## 🎨 Design System

**Color Scheme:**
- Primary Teal: `#14b8a6`
- Secondary Blue: `#0ea5e9`
- Dark Background: `#0f172a`
- Text Primary: `#f1f5f9`

**Typography:**
- Headings: Fontweight 800
- Body: Fontweight 400-600
- Captions: Fontweight 600

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

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** Production Ready
