# 🚀 SignaSecure Enterprise - Complete Startup Guide

## ⚡ Quick Start (Choose One Method)

### Method 1: Automatic Setup (Recommended)

#### On Linux/Mac:
```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise
bash setup_backend_complete.sh
```

#### On Windows:
```bash
cd C:\path\to\SignaSecure-Enterprise
python setup_backend.py
```

#### On Any System:
```bash
python setup_backend.py
```

---

### Method 2: Manual Setup

#### Step 1: Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
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

# Create demo users
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from apps.users.models import Organization, Role

User = get_user_model()

org, _ = Organization.objects.get_or_create(
    slug='demo-org',
    defaults={
        'name': 'Demo Organization',
        'org_type': 'corporate',
        'address': '123 Demo Street',
        'city': 'Mumbai',
        'state': 'MH',
        'country': 'India',
        'postal_code': '400001',
        'phone': '+911234567890',
        'email': 'demo@signasecure.com',
    }
)

admin_role, _ = Role.objects.get_or_create(
    name='Administrator',
    defaults={'role_type': 'admin', 'description': 'Admin role'}
)

user_role, _ = Role.objects.get_or_create(
    name='Standard User',
    defaults={'role_type': 'user', 'description': 'User role'}
)

if not User.objects.filter(email='admin@signasecure.com').exists():
    User.objects.create_superuser(
        username='admin@signasecure.com',
        email='admin@signasecure.com',
        password='Admin@123456',
        first_name='Admin',
        last_name='User',
        organization=org,
        role=admin_role,
        status='active',
    )

if not User.objects.filter(email='user@signasecure.com').exists():
    User.objects.create_user(
        username='user@signasecure.com',
        email='user@signasecure.com',
        password='User@123456',
        first_name='Demo',
        last_name='User',
        organization=org,
        role=user_role,
        status='active',
    )
EOF

# Collect static files
python manage.py collectstatic --noinput
```

#### Step 2: Start Backend Server
```bash
# Make sure you're in backend directory and venv is activated
python manage.py runserver

# Backend will run on: http://localhost:8000
```

#### Step 3: Frontend Setup (in a new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on: http://localhost:5173
```

---

## 📝 Demo Credentials

### Admin Account
- **Email:** admin@signasecure.com
- **Password:** Admin@123456

### Demo User Account
- **Email:** user@signasecure.com
- **Password:** User@123456

---

## ✅ Verify Setup

### Check Backend
```bash
curl http://localhost:8000/health/
```

Expected response: `{"status": "ok"}`

### Check Frontend
Open browser: http://localhost:5173

You should see the login page.

---

## 🧪 Test Registration

1. Go to http://localhost:5173
2. Click "Create Account"
3. Fill in the form:
   ```
   First Name: John
   Last Name: Doe
   Email: john@example.com
   Password: SecurePass123
   Confirm: SecurePass123
   ```
4. Click "Create Account"
5. You should see: ✅ "Connected to backend server"
6. Account created successfully!

---

## 🔍 Troubleshooting

### Issue: "Backend Server Not Connected"

**Solution 1: Check if backend is running**
```bash
curl http://localhost:8000/health/
```

If you get "Connection refused", backend is not running.

**Solution 2: Start backend**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

**Solution 3: Check frontend .env**
```bash
cat frontend/.env
```

Should show:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Issue: "Port 8000 already in use"

**Solution:**
```bash
# Use different port
python manage.py runserver 8001

# Update frontend .env
VITE_API_URL=http://localhost:8001/api/v1
```

### Issue: "Port 5173 already in use"

**Solution:**
```bash
npm run dev -- --port 3000
```

### Issue: "ModuleNotFoundError"

**Solution:**
```bash
cd backend
source venv/bin/activate
pip install --only-binary :all: Django djangorestframework django-cors-headers djangorestframework-simplejwt python-decouple requests cryptography drf-spectacular gunicorn whitenoise
```

### Issue: Database errors

**Solution:**
```bash
cd backend
python manage.py flush --noinput
python manage.py migrate
```

### Issue: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue: "python3: command not found"

**Solution:** Install Python 3.9+ from https://www.python.org/

---

## 📊 Project Structure

```
SignaSecure-Enterprise/
├── backend/                 # Django REST API
│   ├── apps/               # Django apps
│   ├── config/             # Django settings
│   ├── manage.py           # Django management
│   ├── requirements.txt    # Python dependencies
│   └── venv/               # Virtual environment
├── frontend/               # React application
│   ├── src/                # React source code
│   ├── package.json        # Node dependencies
│   ├── .env                # Environment variables
│   └── vite.config.js      # Vite configuration
├── setup_backend.py        # Setup script
└── QUICKSTART.md           # This file
```

---

## 🚀 Next Steps

1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:5173
3. ✅ Register a new account
4. ✅ Login with credentials
5. ✅ Explore the dashboard
6. ✅ Enroll signature templates
7. ✅ Verify signatures

---

## 📞 Support

For issues:
1. Check logs: `backend/logs/django.log`
2. Check browser console: F12 → Console
3. Check API: http://localhost:8000/api/docs/
4. Review: `TROUBLESHOOTING.md`

---

**Happy Signing! 🔒**
