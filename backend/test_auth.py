import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from django.contrib.auth import authenticate

# Test authentication
username = 'ekram'
password = 'ekram77'

print(f"Testing authentication for username: '{username}'")
print(f"Password: '{password}'")

user = authenticate(username=username, password=password)

if user is not None:
    print(f"✅ SUCCESS! Authentication worked.")
    print(f"User: {user.username}, Superuser: {user.is_superuser}")
else:
    print("❌ FAILED! Authentication failed.")
    print("This means the password is incorrect.")
    
    # Try to check if user exists and reset password
    from django.contrib.auth.models import User
    try:
        user = User.objects.get(username=username)
        print(f"\n🔧 User exists. Resetting password to '{password}'...")
        user.set_password(password)
        user.save()
        print("Password reset complete. Try logging in again.")
    except User.DoesNotExist:
        print(f"User '{username}' does not exist!")
