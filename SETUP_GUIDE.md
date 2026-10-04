# 🔒 SignaSecure Enterprise - Complete Setup Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Demo Credentials](#demo-credentials)
6. [Troubleshooting](#troubleshooting)
7. [API Documentation](#api-documentation)

---

## ⚡ Quick Start

### Fastest Way (One Command)

#### Linux/Mac:
```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise
bash setup_backend_complete.sh
```

#### Windows/Any System:
```bash
cd C:\path\to\SignaSecure-Enterprise
python setup_backend.py
```

Then in a new terminal:
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Prerequisites

- **Python 3.9+** - Download from https://www.python.org/
- **Node.js 18+** - Download from https://nodejs.org/
- **Git** - Download from https://git-scm.com/

### Verify Installation:
```bash
python3 --version    # Should be 3.9 or higher
node --version       # Should be 18 or higher
npm --version        # Should be 8 or higher
```

---

## 🔧 Installation

### Step 1: Backend Setup

#### Option A: Automatic (Recommended)
```bash
# Linux/Mac
bash setup_backend_complete.sh

# Windows/Any System
python setup_backend.py
```

#### Option B: Manual
```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install --only-binary :all: \
    Django==4.2.7 \
    djangorestframework==3.14.0 \
    django-cors-headers==4.3.1 \
    djangorestframework-simplejwt==5.3.1 \
    python-decouple==3.8 \
    requests==2.31.0 \
    cryptography==41.0.7 \
    drf-spectacular==0.26.5 \
    gunicorn==21.2.0 \
    whitenoise==6.6.0

# Create logs directory
mkdir logs

# Run migrations
python manage.py migrate

# Create demo users (see below for script)
python manage.py shell < create_demo_users.py
```

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (if not exists)
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
```

---

## 🚀 Running the Application

### Option 1: Run Both Services (Recommended)

#### Linux/Mac:
```bash
bash run.sh
```

#### Windows/Manual:
**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Run Individually

**Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
# Runs on: http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on: http://localhost:5173
```

---

## 📝 Demo Credentials

### Admin Account
```
Email:    admin@signasecure.com
Password: Admin@123456
```

### Demo User Account
```
Email:    user@signasecure.com
Password: User@123456
```

---

## 🧪 Test the Application

### 1. Access Frontend
Open browser: http://localhost:5173

### 2. Register New Account
- Click "Create Account"
- Fill in details:
  ```
  First Name: John
  Last Name: Doe
  Email: john@example.com
  Password: SecurePass123
  Confirm: SecurePass123
  ```
- Click "Create Account"
- Should see: ✅ "Connected to backend server"

### 3. Login
- Use credentials from registration or demo account
- Should be redirected to dashboard

### 4. Test Verification
- Go to "Signature Verification"
- Enroll a signature template
- Capture/upload a signature
- Click "Verify Signature"
- View results

---

## 🔴 Troubleshooting

### Issue 1: "Backend Server Not Connected"

**Cause:** Backend is not running

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/health/

# If not, start it
cd backend
source venv/bin/activate
python manage.py runserver
```

### Issue 2: "Port 8000 already in use"

**Solution:**
```bash
# Use different port
python manage.py runserver 8001

# Update frontend .env
VITE_API_URL=http://localhost:8001/api/v1
```

### Issue 3: "Port 5173 already in use"

**Solution:**
```bash
npm run dev -- --port 3000
```

### Issue 4: "ModuleNotFoundError: No module named 'django'"

**Solution:**
```bash
cd backend
source venv/bin/activate
pip install --only-binary :all: Django djangorestframework django-cors-headers djangorestframework-simplejwt python-decouple requests cryptography drf-spectacular gunicorn whitenoise
```

### Issue 5: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue 6: Database errors

**Solution:**
```bash
cd backend
python manage.py flush --noinput
python manage.py migrate
```

### Issue 7: "Cannot find module '@services/api'"

**Solution:**
```bash
cd frontend
npm install
```

### Issue 8: Virtual environment not activating

**Solution:**
```bash
# Linux/Mac - Make sure you're in backend directory
source venv/bin/activate

# Windows - Make sure you're in backend directory
venv\Scripts\activate

# If still not working, recreate venv
rm -rf venv  # or rmdir venv on Windows
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
```

---

## 📊 API Documentation

### Access API Docs
```
http://localhost:8000/api/docs/
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/login/` - Login user
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token
- `POST /api/v1/auth/logout/` - Logout user

#### Verification
- `GET /api/v1/verification/templates/` - List templates
- `POST /api/v1/verification/verify/` - Verify signature
- `POST /api/v1/verification/enroll/` - Enroll template
- `POST /api/v1/verification/compare/` - Compare signatures

---

## 📁 Project Structure

```
SignaSecure-Enterprise/
├── backend/
│   ├── apps/
│   │   ├── authentication/    # Auth endpoints
│   │   ├── users/             # User models
│   │   ├── verification/      # Verification endpoints
│   │   ├── signatures/        # Signature models
│   │   └── ...
│   ├── config/                # Django settings
│   ├── manage.py              # Django CLI
│   ├── requirements.txt       # Python dependencies
│   ├── venv/                  # Virtual environment
│   └── db.sqlite3             # Database
├── frontend/
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── components/        # React components
│   │   ├── services/          # API services
│   │   ├── App.jsx            # Main app
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node dependencies
│   ├── .env                   # Environment variables
│   ├── vite.config.js         # Vite config
│   └── index.html             # HTML template
├── setup_backend.py           # Setup script
├── setup_backend_complete.sh  # Setup script (Linux/Mac)
├── run.sh                     # Run both services
├── STARTUP.md                 # Startup guide
├── QUICKSTART.md              # Quick start guide
├── TROUBLESHOOTING.md         # Troubleshooting guide
└── README.md                  # Project README
```

---

## 🎯 Common Tasks

### Reset Database
```bash
cd backend
python manage.py flush --noinput
python manage.py migrate
```

### Create New User
```bash
cd backend
python manage.py createsuperuser
```

### View Logs
```bash
# Backend logs
tail -f backend/logs/django.log

# Frontend console
Open browser → F12 → Console
```

### Stop Services
```bash
# Press Ctrl+C in terminal(s)
```

### Change API Port
```bash
# Backend
python manage.py runserver 8001

# Update frontend .env
VITE_API_URL=http://localhost:8001/api/v1
```

---

## 🔐 Security Notes

- Change default credentials in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Set `DEBUG=False` in production
- Use strong passwords (min 8 characters)

---

## 📞 Support

For issues:
1. Check logs: `backend/logs/django.log`
2. Check browser console: F12 → Console
3. Check API: http://localhost:8000/api/docs/
4. Review: `TROUBLESHOOTING.md`
5. Review: `STARTUP.md`

---

## ✅ Verification Checklist

- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database migrations run
- [ ] Demo users created
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Can access http://localhost:5173 in browser
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Backend shows "Connected" status

---

**Happy Signing! 🔒**

Last Updated: 2024
Version: 1.0.0
