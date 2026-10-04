#!/bin/bash

# SignaSecure Enterprise Backend Setup Script
# Initializes database, runs migrations, and creates demo data

set -e

echo "🚀 SignaSecure Enterprise Backend Setup"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit 1

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Create logs directory
mkdir -p logs

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
python manage.py shell << END
from django.contrib.auth import get_user_model
from apps.users.models import Organization, Role

User = get_user_model()

# Create demo organization
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

# Create admin role
admin_role, _ = Role.objects.get_or_create(
    name='Administrator',
    defaults={'role_type': 'admin', 'description': 'Administrator role'}
)

# Create user role
user_role, _ = Role.objects.get_or_create(
    name='Standard User',
    defaults={'role_type': 'user', 'description': 'Standard user role'}
)

# Create superuser
if not User.objects.filter(email='admin@signasecure.com').exists():
    admin = User.objects.create_superuser(
        username='admin@signasecure.com',
        email='admin@signasecure.com',
        password='Admin@123456',
        first_name='Admin',
        last_name='User',
        organization=org,
        role=admin_role,
        status='active',
    )
    print("✅ Superuser created: admin@signasecure.com / Admin@123456")
else:
    print("⚠️  Superuser already exists")

# Create demo user
if not User.objects.filter(email='user@signasecure.com').exists():
    demo_user = User.objects.create_user(
        username='user@signasecure.com',
        email='user@signasecure.com',
        password='User@123456',
        first_name='Demo',
        last_name='User',
        organization=org,
        role=user_role,
        status='active',
    )
    print("✅ Demo user created: user@signasecure.com / User@123456")
else:
    print("⚠️  Demo user already exists")

END

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput -q

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📝 Demo Credentials:"
echo "   Admin: admin@signasecure.com / Admin@123456"
echo "   User:  user@signasecure.com / User@123456"
echo ""
echo "🚀 To start the server, run:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
