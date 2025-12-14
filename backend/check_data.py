import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from cbe.models import District, Branch, ContactPerson, ATM

print("=== CURRENT DATA ===")
print(f"Districts: {District.objects.count()}")
print(f"Branches: {Branch.objects.count()}")
print(f"Contacts: {ContactPerson.objects.count()}")
print(f"ATMs: {ATM.objects.count()}")

print("\n=== BRANCHES ===")
for branch in Branch.objects.all()[:10]:  # Show first 10
    print(f"- {branch.name}")

print("\n=== ATMs ===")
for atm in ATM.objects.all()[:10]:  # Show first 10
    print(f"- {atm.tid}: {atm.atm_name} (Branch: {atm.branch})")