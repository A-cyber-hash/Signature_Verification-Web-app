# SignaSecure Enterprise - Registration & Verification Troubleshooting Guide

## 🔴 Registration Failed - Common Issues & Solutions

### Issue 1: "Email already registered"
**Cause:** Email address is already in the system
**Solution:**
- Use a different email address
- Or reset the database: `python manage.py flush --noinput`

### Issue 2: "Password must be at least 8 characters"
**Cause:** Password is too short
**Solution:**
- Use a password with minimum 8 characters
- Example: `SecurePass123`

### Issue 3: "First name, last name, email, and password are required"
**Cause:** Missing required fields
**Solution:**
- Fill all required fields (marked with *)
- First Name, Last Name, Email, Password are mandatory

### Issue 4: "Invalid email format"
**Cause:** Email doesn't match standard format
**Solution:**
- Use valid email: `user@example.com`
- Check for typos

### Issue 5: "Passwords do not match"
**Cause:** Password and Confirm Password fields don't match
**Solution:**
- Ensure both password fields are identical
- Check for extra spaces or typos

### Issue 6: "Registration failed. Please try again."
**Cause:** Backend connection issue or server error
**Solution:**
1. Check if backend is running:
   ```bash
   curl http://localhost:8000/health/
   ```
2. Check backend logs:
   ```bash
   tail -f backend/logs/django.log
   ```
3. Verify database is initialized:
   ```bash
   python manage.py migrate
   ```

---

## 🔴 Signature Verification Failed - Common Issues & Solutions

### Issue 1: "Failed to load templates"
**Cause:** No signature templates enrolled or API error
**Solution:**
1. Enroll a signature template first
2. Check backend is running
3. Verify API endpoint: `GET /api/v1/verification/templates/`

### Issue 2: "Camera access denied"
**Cause:** Browser doesn't have camera permission
**Solution:**
1. Allow camera access when prompted
2. Check browser settings → Privacy → Camera
3. Try a different browser
4. Use HTTPS (required for camera access in production)

### Issue 3: "Verification failed. Please try again."
**Cause:** ML engine error or invalid image
**Solution:**
1. Ensure image is clear and well-lit
2. Signature should be visible and not blurry
3. Check image format (PNG, JPG supported)
4. Check backend logs for detailed error

### Issue 4: "Template not found or not active"
**Cause:** Selected template doesn't exist or is inactive
**Solution:**
1. Refresh the page to reload templates
2. Enroll a new template if needed
3. Check template status in database

### Issue 5: "Captured image is invalid"
**Cause:** Image file is corrupted or wrong format
**Solution:**
1. Retake the photo
2. Ensure good lighting
3. Use supported formats: PNG, JPG, JPEG

---

## 🔧 Backend Setup & Initialization

### Step 1: Install Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Initialize Database
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 3: Create Demo Data
```bash
python manage.py shell
```

Then run:
```python
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

# Create demo user
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

print("✅ Setup complete!")
```

### Step 4: Run Backend Server
```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

---

## 🔧 Frontend Setup

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Configure API URL
Create `.env` file in frontend directory:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Step 3: Run Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🧪 Testing Registration Flow

### Test Case 1: Successful Registration
```
Email: test@example.com
First Name: John
Last Name: Doe
Password: SecurePass123
Confirm: SecurePass123
```

Expected: Account created, redirected to dashboard

### Test Case 2: Invalid Email
```
Email: invalid-email
```

Expected: Error "Invalid email format"

### Test Case 3: Short Password
```
Password: short
```

Expected: Error "Password must be at least 8 characters"

### Test Case 4: Mismatched Passwords
```
Password: SecurePass123
Confirm: DifferentPass123
```

Expected: Error "Passwords do not match"

---

## 🧪 Testing Verification Flow

### Test Case 1: Successful Verification
1. Register account
2. Enroll signature template
3. Capture/upload signature
4. Click "Verify Signature"

Expected: Match score displayed, result shown

### Test Case 2: No Template Selected
1. Skip template selection
2. Try to verify

Expected: Error "Select a template and provide an image"

### Test Case 3: No Image Captured
1. Select template
2. Skip image capture
3. Try to verify

Expected: Error "Select a template and provide an image"

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/login/` - Login user
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token
- `POST /api/v1/auth/logout/` - Logout user

### Verification
- `GET /api/v1/verification/templates/` - List user's templates
- `POST /api/v1/verification/verify/` - Verify signature
- `POST /api/v1/verification/enroll/` - Enroll new template
- `POST /api/v1/verification/compare/` - Compare two signatures

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
tail -f backend/logs/django.log
```

### Check Frontend Console
Open browser DevTools (F12) → Console tab

### Test API Endpoint
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Check Database
```bash
python manage.py dbshell
SELECT * FROM users;
```

### Reset Database
```bash
python manage.py flush --noinput
python manage.py migrate
```

---

## 📞 Support

For additional help:
1. Check logs in `backend/logs/django.log`
2. Review API responses in browser DevTools
3. Verify all services are running (backend, frontend)
4. Ensure database is initialized with migrations

---

**Last Updated:** 2024
**Version:** 1.0.0
