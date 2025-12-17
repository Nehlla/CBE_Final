import pandas as pd
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from cbe.models import Region, District, Branch, ContactPerson, ATM

def clean_value(value):
    if pd.isna(value) or value in ['', 'null', 'None', ' ', 'nan']:
        return None
    return str(value).strip()

# Create Region and District
print("Setting up region and district...")
region, _ = Region.objects.get_or_create(name='Sidama Region', defaults={'code': 'SD'})
district, _ = District.objects.get_or_create(name='Hawassa', defaults={'region': region})
print(f"Region: {region.name}, District: {district.name}")

# Import Branches
print("\nImporting branches...")
try:
    df = pd.read_csv('data/csv/Hawassa District WAN Address.csv', encoding='utf-8')
except:
    df = pd.read_csv('data/csv/Hawassa District WAN Address.csv', encoding='latin1')

count = 0
for _, row in df.iterrows():
    branch_name = row.get('Branch Name')
    if pd.notna(branch_name) and branch_name:
        clean_name = str(branch_name).replace(' Branch', '').strip()
        branch, created = Branch.objects.update_or_create(
            name=clean_name,
            defaults={
                'district': district,
                'connection_type': clean_value(row.get('Connection Type')),
                'service_number': clean_value(row.get('Service No.')),
                'wan_address': clean_value(row.get('WAN Address')),
                'lan_address': clean_value(row.get('LAN Address')),
                'default_gateway': clean_value(row.get('Default Gateway')),
            }
        )
        count += 1
        if count <= 10:
            print(f"{'Created' if created else 'Updated'}: {clean_name}")

print(f"\nImported {count} branches")

# Import Contacts
print("\nImporting contacts...")
try:
    df_contacts = pd.read_csv('data/csv/contact_person.csv', encoding='utf-8')
except:
    df_contacts = pd.read_csv('data/csv/contact_person.csv', encoding='latin1')

# Filter out empty rows
df_contacts = df_contacts[df_contacts['Contact Person'].notna() & (df_contacts['Contact Person'] != '')]

count_contacts = 0
for _, row in df_contacts.iterrows():
    branch_name = row.get('Branch Name')
    contact_name = row.get('Contact Person')
    
    if pd.notna(branch_name) and pd.notna(contact_name):
        clean_branch = str(branch_name).replace(' Branch', '').strip()
        try:
            branch = Branch.objects.get(name=clean_branch)
            contact, created = ContactPerson.objects.get_or_create(
                branch=branch,
                full_name=str(contact_name).strip(),
                defaults={
                    'role': clean_value(row.get('Role')),
                    'phone_number': clean_value(row.get('Phone Number')),
                }
            )
            count_contacts += 1
            if count_contacts <= 10:
                print(f"{'Created' if created else 'Found'}: {contact_name} for {branch.name}")
        except Branch.DoesNotExist:
            pass

print(f"\nImported {count_contacts} contacts")

# Import ATMs
print("\nImporting ATMs...")
try:
    df_atms = pd.read_csv('data/csv/atm_all.csv', encoding='utf-8')
except:
    df_atms = pd.read_csv('data/csv/atm_all.csv', encoding='latin1')

count_atms = 0
for _, row in df_atms.iterrows():
    tid = row.get('TID')
    if pd.notna(tid) and tid:
        tid = str(tid).strip()
        atm_name = row.get('atm_name')
        if pd.isna(atm_name):
            atm_name = f'ATM {tid}'
        
        atm, created = ATM.objects.update_or_create(
            tid=tid,
            defaults={
                'atm_name': str(atm_name).strip(),
                'ip_address': clean_value(row.get('ip_address')),
                'deployment_status': clean_value(row.get('deployment_status')) or 'DEPLOYED',
            }
        )
        count_atms += 1
        if count_atms <= 10:
            print(f"{'Created' if created else 'Updated'}: ATM {tid}")

print(f"\nImported {count_atms} ATMs")

print("\n✅ Data import completed!")
print(f"Total Branches: {Branch.objects.count()}")
print(f"Total Contacts: {ContactPerson.objects.count()}")
print(f"Total ATMs: {ATM.objects.count()}")
