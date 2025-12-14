# save as import_contacts_only.py
import pandas as pd
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from cbe.models import Branch, ContactPerson
from cbe.csv_utils import read_csv_safe, get_row_value
from cbe.csv_utils import persist_import_row

def clean_value(value):
    if pd.isna(value) or value in ['', 'null', 'None', ' ', 'nan']:
        return None
    return str(value).strip()

def import_contacts():
    print("Importing contacts only...")
    
    file_path = 'data/csv/contact_person.csv'
    try:
        df = read_csv_safe(file_path)
        print("Successfully read contacts file")
    except Exception as e:
        print(f"Could not read contacts file: {e}")
        return
    
    # Remove empty rows
    if 'contact_person' in df.columns:
        df = df[df['contact_person'].notna() & (df['contact_person'] != '')]
    elif 'contact_person_name' in df.columns:
        df = df[df['contact_person_name'].notna() & (df['contact_person_name'] != '')]
    
    count = 0
    for _, row in df.iterrows():
        branch_name = clean_value(get_row_value(row, 'Branch Name', 'branch_name', 'branch'))
        contact_name = clean_value(get_row_value(row, 'Contact Person', 'contact_person', 'contact_person_name'))
        
        if branch_name and contact_name:
            # Clean branch name (remove "Branch" suffix)
            clean_branch_name = branch_name.replace(' Branch', '').strip()
            
            try:
                branch = Branch.objects.get(name=clean_branch_name)
                ContactPerson.objects.create(
                    branch=branch,
                    full_name=contact_name,
                    role=clean_value(get_row_value(row, 'Role', 'role')),
                    phone_number=clean_value(get_row_value(row, 'Phone Number', 'phone_number'))
                )
                count += 1
                print(f'Added contact: {contact_name} for {clean_branch_name}')
                    try:
                        # persist raw contact row
                        persist_import_row(file_path, row.to_dict(), model='ContactPerson')
                    except Exception:
                        pass
            except Branch.DoesNotExist:
                print(f'Branch not found: {clean_branch_name}')
    
    print(f'Imported {count} contact persons')

if __name__ == '__main__':
    import_contacts()