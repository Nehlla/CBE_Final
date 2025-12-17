import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from django.contrib.auth.models import User

print("=== All Users in Database ===")
users = User.objects.all()
if not users:
    print("No users found in database!")
else:
    for user in users:
        print(f"Username: {user.username}, Email: {user.email}, Is Superuser: {user.is_superuser}, Active: {user.is_active}")
