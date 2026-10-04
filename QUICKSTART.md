# 🚀 SignaSecure Enterprise - Quick Start Guide

## Prerequisites
- Python 3.9+
- Node.js 18+
- Git

## ⚡ Quick Start (5 minutes)

### Step 1: Backend Setup & Run

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create logs directory
mkdir -p logs

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create demo data (optional - auto-creates users)
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from apps.users.models import Organization, Role

User = get_user_model()

# Create organization
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

# Create roles
admin_role, _ = Role.objects.get_or_create(
    name='Administrator',
    defaults={'role_type': 'admin', 'description': 'Admin role'}
)

user_role, _ = Role.objects.get_or_create(
    name='Standard User',
    defaults={'role_type': 'user', 'description': 'User role'}
)

# Create superuser
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
    print("✅ Admin created: admin@signasecure.com / Admin@123456")

# Create demo user
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
    print("✅ User created: user@signasecure.com / User@123456")
EOF

# Start backend server
python manage.py runserver

# Backend will run on: http://localhost:8000
```

### Step 2: Frontend Setup & Run (in a new terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on: http://localhost:5173
```

### Step 3: Access the Application

Open your browser and go to:
```
http://localhost:5173
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

## 🔧 Troubleshooting

### Issue: "Network Error: Cannot connect to backend"

**Solution:** Make sure backend is running
```bash
# Check if backend is running
curl http://localhost:8000/health/

# If not running, start it:
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

### Issue: "Port 8000 already in use"

**Solution:** Use a different port
```bash
python manage.py runserver 8001
```

Then update frontend `.env`:
```
VITE_API_URL=http://localhost:8001/api/v1
```

### Issue: "Port 5173 already in use"

**Solution:** Use a different port
```bash
npm run dev -- --port 3000
```

### Issue: Database errors

**Solution:** Reset database
```bash
cd backend
python manage.py flush --noinput
python manage.py migrate
```

### Issue: Module not found errors

**Solution:** Reinstall dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/login/` - Login user
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token
- `POST /api/v1/auth/logout/` - Logout user

### Verification
- `GET /api/v1/verification/templates/` - List templates
- `POST /api/v1/verification/verify/` - Verify signature
- `POST /api/v1/verification/enroll/` - Enroll template
- `POST /api/v1/verification/compare/` - Compare signatures

---

## 🧪 Test Registration

1. Go to http://localhost:5173
2. Click "Create Account"
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: SecurePass123
   - Confirm: SecurePass123
4. Click "Create Account"
5. You should be redirected to dashboard

---

## 🧪 Test Verification

1. Login with demo account
2. Go to "Signature Verification"
3. Enroll a signature template
4. Capture/upload a signature
5. Click "Verify Signature"
6. View results with match score

---

## 📚 Documentation

- Backend API: http://localhost:8000/api/docs/
- Troubleshooting: See `TROUBLESHOOTING.md`
- Architecture: See `README.md`

---

## 🛑 Stopping Services

### Stop Backend
```bash
# Press Ctrl+C in the backend terminal
```

### Stop Frontend
```bash
# Press Ctrl+C in the frontend terminal
```

---

## 🎯 Next Steps

1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:5173
3. ✅ Register a new account
4. ✅ Enroll signature templates
5. ✅ Verify signatures
6. ✅ View analytics and reports

---

**Happy Signing! 🔒**
