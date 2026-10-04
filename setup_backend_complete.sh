#!/bin/bash

# SignaSecure Enterprise - Complete Backend Setup
# This script sets up the entire backend with database and demo users

set -e

echo "🚀 SignaSecure Enterprise Backend Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to backend directory
BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"
cd "$BACKEND_DIR"

echo -e "${BLUE}📁 Working directory: $BACKEND_DIR${NC}"
echo ""

# Step 1: Create virtual environment
echo -e "${BLUE}Step 1: Creating virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment already exists${NC}"
fi

# Step 2: Activate virtual environment
echo -e "${BLUE}Step 2: Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Step 3: Upgrade pip and tools
echo -e "${BLUE}Step 3: Upgrading pip and build tools...${NC}"
pip install --upgrade pip setuptools wheel -q
echo -e "${GREEN}✅ Build tools upgraded${NC}"

# Step 4: Install dependencies
echo -e "${BLUE}Step 4: Installing dependencies...${NC}"
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
    whitenoise==6.6.0 \
    -q
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Create logs directory
echo -e "${BLUE}Step 5: Creating logs directory...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ Logs directory created${NC}"

# Step 6: Run migrations
echo -e "${BLUE}Step 6: Running database migrations...${NC}"
python manage.py migrate --noinput -q
echo -e "${GREEN}✅ Migrations completed${NC}"

# Step 7: Create demo data
echo -e "${BLUE}Step 7: Creating demo users and organization...${NC}"
python manage.py shell << 'PYEOF'
from django.contrib.auth import get_user_model
from apps.users.models import Organization, Role

User = get_user_model()

# Create organization
org, created = Organization.objects.get_or_create(
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

# Create admin user
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
PYEOF

echo -e "${GREEN}✅ Demo users created${NC}"

# Step 8: Collect static files
echo -e "${BLUE}Step 8: Collecting static files...${NC}"
python manage.py collectstatic --noinput -q
echo -e "${GREEN}✅ Static files collected${NC}"

echo ""
echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Demo Credentials:${NC}"
echo "   Admin: admin@signasecure.com / Admin@123456"
echo "   User:  user@signasecure.com / User@123456"
echo ""
echo -e "${YELLOW}🚀 To start the backend server:${NC}"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo -e "${YELLOW}Backend will run on: http://localhost:8000${NC}"
echo ""
