# 🚀 SignaSecure Enterprise - Run Now!

## Copy & Paste These Commands

### Step 1: Setup Backend (Run Once)

```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise
python setup_backend.py
```

**Wait for it to complete. You should see:**
```
✅ Backend setup complete!

📝 Demo Credentials:
   Admin: admin@signasecure.com / Admin@123456
   User:  user@signasecure.com / User@123456
```

---

### Step 2: Start Backend (Terminal 1)

```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise/backend
source venv/bin/activate
python manage.py runserver
```

**You should see:**
```
Starting development server at http://127.0.0.1:8000/
```

---

### Step 3: Start Frontend (Terminal 2)

```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise/frontend
npm run dev
```

**You should see:**
```
  VITE v5.0.5  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 4: Open Browser

Go to: **http://localhost:5173**

---

## ✅ You Should See

1. **Login Page** with SignaSecure logo
2. **"Create Account"** button
3. **Green indicator** "✅ Connected to backend server"

---

## 🧪 Test Registration

1. Click **"Create Account"**
2. Fill in:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `SecurePass123`
   - Confirm: `SecurePass123`
3. Click **"Create Account"**
4. Should redirect to **Dashboard**

---

## 🔑 Or Login with Demo Account

- Email: `admin@signasecure.com`
- Password: `Admin@123456`

---

## 🛑 To Stop

Press **Ctrl+C** in each terminal

---

## ❌ If You Get "Backend Server Not Connected"

**Check if backend is running:**
```bash
curl http://localhost:8000/health/
```

If you get "Connection refused", the backend is not running.

**Start backend:**
```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise/backend
source venv/bin/activate
python manage.py runserver
```

---

## ❌ If You Get "Port 8000 already in use"

```bash
# Use different port
python manage.py runserver 8001

# Then update frontend .env
echo "VITE_API_URL=http://localhost:8001/api/v1" > /home/kali/Desktop/qspider/SignaSecure-Enterprise/frontend/.env
```

---

## ❌ If You Get "Port 5173 already in use"

```bash
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise/frontend
npm run dev -- --port 3000
```

Then go to: http://localhost:3000

---

## 📊 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/api/docs/ |
| Health Check | http://localhost:8000/health/ |

---

## 📝 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@signasecure.com | Admin@123456 |
| User | user@signasecure.com | User@123456 |

---

**That's it! Happy Signing! 🔒**
