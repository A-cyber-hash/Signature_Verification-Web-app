#!/usr/bin/env python
"""
Setup script to create permanent admin user
Run this from the backend directory: python setup_admin.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import Organization, Role
import uuid

User = get_user_model()

def create_permanent_users():
    print("\n" + "="*70)
    print("CREATING PERMANENT USERS")
    print("="*70 + "\n")
    
    # Create organization
    org, org_created = Organization.objects.get_or_create(
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
    if org_created:
        print("✓ Organization created")
    else:
        print("✓ Organization already exists")
    
    # Create admin role
    admin_role, role_created = Role.objects.get_or_create(
        name='Administrator',
        defaults={
            'role_type': 'admin',
            'description': 'Administrator role with full access'
        }
    )
    if role_created:
        print("✓ Admin role created")
    else:
        print("✓ Admin role already exists")
    
    # Create user role
    user_role, user_role_created = Role.objects.get_or_create(
        name='Standard User',
        defaults={
            'role_type': 'user',
            'description': 'Standard user role'
        }
    )
    if user_role_created:
        print("✓ User role created")
    else:
        print("✓ User role already exists")
    
    # Create admin user
    admin_email = 'amir123'
    admin_password = '123456'
    
    try:
        admin_user = User.objects.get(email=admin_email)
        admin_user.set_password(admin_password)
        admin_user.status = 'active'
        admin_user.is_active = True
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print(f"✓ Admin user '{admin_email}' updated with new password")
    except User.DoesNotExist:
        admin_user = User.objects.create(
            email=admin_email,
            username=admin_email,
            first_name='Admin',
            last_name='User',
            phone='+911234567890',
            organization=org,
            role=admin_role,
            status='active',
            is_active=True,
            is_staff=True,
            is_superuser=True,
            api_key=uuid.uuid4().hex,
        )
        admin_user.set_password(admin_password)
        admin_user.save()
        print(f"✓ Admin user '{admin_email}' created successfully")
    
    # Create regular user
    user_email = 'user@example.com'
    user_password = 'User@123456'
    
    try:
        regular_user = User.objects.get(email=user_email)
        regular_user.set_password(user_password)
        regular_user.status = 'active'
        regular_user.is_active = True
        regular_user.save()
        print(f"✓ Regular user '{user_email}' updated with new password")
    except User.DoesNotExist:
        regular_user = User.objects.create(
            email=user_email,
            username=user_email,
            first_name='Demo',
            last_name='User',
            phone='+919876543210',
            organization=org,
            role=user_role,
            status='active',
            is_active=True,
            api_key=uuid.uuid4().hex,
        )
        regular_user.set_password(user_password)
        regular_user.save()
        print(f"✓ Regular user '{user_email}' created successfully")
    
    # Print credentials
    print("\n" + "="*70)
    print("PERMANENT USER CREDENTIALS")
    print("="*70)
    print(f"\n📧 Admin Account:")
    print(f"   Email/ID: {admin_email}")
    print(f"   Password: {admin_password}")
    print(f"   Access: /admin/login")
    print(f"\n👤 Regular User Account:")
    print(f"   Email: {user_email}")
    print(f"   Password: {user_password}")
    print(f"   Access: /login")
    print("\n" + "="*70 + "\n")

if __name__ == '__main__':
    create_permanent_users()
