from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import Organization, Role, User


class AdminUserManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(
            name='Demo Org',
            slug='demo-org',
            org_type='corporate',
            address='123 Demo Street',
            city='Mumbai',
            state='MH',
            country='India',
            postal_code='400001',
            phone='+911234567890',
            email='demo@signasecure.com',
        )
        self.admin_role = Role.objects.create(name='Administrator', role_type='admin', description='Admin role')
        self.user_role = Role.objects.create(name='Standard User', role_type='user', description='User role')

        self.admin_user = User.objects.create(
            username='admin@signasecure.com',
            email='admin@signasecure.com',
            first_name='Owner',
            last_name='Admin',
            organization=self.organization,
            role=self.admin_role,
            status='active',
            is_active=True,
            api_key='admin-key',
        )
        self.admin_user.set_password('StrongPass123!')
        self.admin_user.save()

        self.regular_user = User.objects.create(
            username='user@example.com',
            email='user@example.com',
            first_name='Jane',
            last_name='Doe',
            organization=self.organization,
            role=self.user_role,
            status='active',
            is_active=True,
            api_key='user-key',
        )
        self.regular_user.set_password('StrongPass123!')
        self.regular_user.save()

    def test_admin_can_list_users_and_toggle_user_status(self):
        self.client.force_authenticate(user=self.admin_user)

        list_response = self.client.get('/api/v1/users/')
        self.assertEqual(list_response.status_code, 200)
        self.assertGreaterEqual(list_response.data['count'], 1)

        update_response = self.client.patch(
            f'/api/v1/users/{self.regular_user.id}/status/',
            {'status': 'suspended'},
            format='json',
        )

        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data['status'], 'suspended')
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.status, 'suspended')

        unblock_response = self.client.patch(
            f'/api/v1/users/{self.regular_user.id}/status/',
            {'status': 'active'},
            format='json',
        )

        self.assertEqual(unblock_response.status_code, 200)
        self.assertEqual(unblock_response.data['status'], 'active')
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.status, 'active')
