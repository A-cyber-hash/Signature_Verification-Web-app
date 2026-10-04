#!/usr/bin/env python3
"""
SignaSecure Enterprise - Backend Setup Script
Initializes database, installs dependencies, and creates demo users
"""

import os
import sys
import subprocess
import platform

def run_command(cmd, description=""):
    """Run a shell command and handle errors"""
    if description:
        print(f"🔧 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Error: {result.stderr}")
            return False
        if description:
            print(f"✅ {description}")
        return True
    except Exception as e:
        print(f"❌ Error running command: {e}")
        return False

def main():
    print("🚀 SignaSecure Enterprise Backend Setup")
    print("=" * 50)
    print()

    # Get backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    print(f"📁 Working directory: {backend_dir}")
    print()

    # Step 1: Create virtual environment
    print("Step 1: Setting up virtual environment...")
    if not os.path.exists('venv'):
        if not run_command('python3 -m venv venv', 'Creating virtual environment'):
            return False
    else:
        print("⚠️  Virtual environment already exists")

    # Determine activation command
    if platform.system() == 'Windows':
        activate_cmd = 'venv\\Scripts\\activate.bat && '
    else:
        activate_cmd = 'source venv/bin/activate && '

    # Step 2: Upgrade pip
    print("\nStep 2: Upgrading pip and build tools...")
    if not run_command(f'{activate_cmd}pip install --upgrade pip setuptools wheel -q', 'Upgrading pip'):
        return False

    # Step 3: Install dependencies
    print("\nStep 3: Installing dependencies...")
    deps = [
        'Django==4.2.7',
        'djangorestframework==3.14.0',
        'django-cors-headers==4.3.1',
        'djangorestframework-simplejwt==5.3.1',
        'python-decouple==3.8',
        'requests==2.31.0',
        'cryptography==41.0.7',
        'drf-spectacular==0.26.5',
        'gunicorn==21.2.0',
        'whitenoise==6.6.0',
    ]
    
    deps_str = ' '.join(deps)
    if not run_command(f'{activate_cmd}pip install --only-binary :all: {deps_str} -q', 'Installing dependencies'):
        print("⚠️  Some dependencies failed to install, continuing...")

    # Step 4: Create logs directory
    print("\nStep 4: Creating logs directory...")
    os.makedirs('logs', exist_ok=True)
    print("✅ Logs directory created")

    # Step 5: Run migrations
    print("\nStep 5: Running database migrations...")
    if not run_command(f'{activate_cmd}python manage.py migrate --noinput -q', 'Running migrations'):
        return False

    # Step 6: Create demo data
    print("\nStep 6: Creating demo users...")
    setup_script = '''
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
    print("✅ Admin user created")

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
    print("✅ Demo user created")
'''
    
    if not run_command(f'{activate_cmd}python manage.py shell << \'EOF\'\n{setup_script}\nEOF', 'Creating demo users'):
        print("⚠️  Demo user creation had issues, continuing...")

    # Step 7: Collect static files
    print("\nStep 7: Collecting static files...")
    if not run_command(f'{activate_cmd}python manage.py collectstatic --noinput -q', 'Collecting static files'):
        print("⚠️  Static file collection had issues, continuing...")

    # Success message
    print("\n" + "=" * 50)
    print("✅ Backend setup complete!")
    print("=" * 50)
    print()
    print("📝 Demo Credentials:")
    print("   Admin: admin@signasecure.com / Admin@123456")
    print("   User:  user@signasecure.com / User@123456")
    print()
    print("🚀 To start the backend server:")
    print("   cd backend")
    if platform.system() == 'Windows':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("   python manage.py runserver")
    print()
    print("Backend will run on: http://localhost:8000")
    print()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)
