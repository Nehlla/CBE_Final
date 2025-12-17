import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from django.contrib.auth.models import User

try:
    # Find the existing admin user
    # We try 'admin' first, or fallback to the first superuser found
    user = User.objects.filter(username='admin').first()
    
    if not user:
        user = User.objects.filter(is_superuser=True).first()

    if user:
        print(f"Found user: {user.username} (ID: {user.id})")
        user.username = 'ekram'
        user.set_password('ekram77')
        user.save()
        print("Successfully updated credentials to:")
        print("Username: ekram")
        print("Password: ekram77")
    else:
        print("No superuser found to update. Creating one...")
        User.objects.create_superuser('ekram', 'admin@example.com', 'ekram77')
        print("Created new superuser: ekram")

except Exception as e:
    print(f"Error: {e}")
