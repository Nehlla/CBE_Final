import pandas as pd
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from cbe.models import District, Branch
from cbe.csv_utils import read_csv_safe, get_row_value
from cbe.csv_utils import persist_import_row

def clean_value(value):
    if pd.isna(value) or value in ['', 'null', 'None', ' ', 'nan']:
        return None
    return str(value).strip()

def import_branches():
    print("Importing branches only...")
    
    # Create district
    district, created = District.objects.get_or_create(
        name='Hawassa',
        defaults={'region': 'Sidama'}
    )
    
    file_path = 'data/csv/Hawassa District WAN Address.csv'
    try:
        df = read_csv_safe(file_path)
    except Exception as e:
        print(f"Could not read the file: {e}")
        return
    
    count = 0
    for _, row in df.iterrows():
        branch_name = clean_value(get_row_value(row, 'Branch Name', 'branch_name', 'branch'))
        if branch_name:
            # Remove "Branch" suffix if present for matching
            clean_branch_name = branch_name.replace(' Branch', '').strip()
            
            branch, created = Branch.objects.update_or_create(
                name=clean_branch_name,
                defaults={
                    'district': district,
                    'connection_type': clean_value(get_row_value(row, 'Connection Type', 'connection_type')),
                    'service_number': clean_value(get_row_value(row, 'Service No.', 'service_no', 'service_number')),
                    'account_number': clean_value(get_row_value(row, 'Account No', 'account_no')),
                    'wan_address': clean_value(get_row_value(row, 'WAN Address', 'wan_address', 'wan_ip')),
                    'lan_address': clean_value(get_row_value(row, 'LAN Address', 'lan_address', 'lan_ip')),
                    'default_gateway': clean_value(get_row_value(row, 'Default Gateway', 'default_gateway')),
                }
            )
            count += 1
            action = 'Created' if created else 'Updated'
            print(f'{action} branch: {clean_branch_name}')
            try:
                persist_import_row(file_path, row.to_dict(), model='Branch', model_pk=branch.pk)
            except Exception:
                pass
    
    print(f'Imported {count} branches')

if __name__ == '__main__':
    import_branches()