import pandas as pd
import os
import django
import sys

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from cbe.models import Region, District, Branch, ContactPerson, ATM, WAN_IP

def clean_value(value):
    if pd.isna(value) or value in ['', 'null', 'None', ' ', 'nan', 'NaT']:
        return None
    return str(value).strip()

def run_import():
    print("="*50)
    print("STARTING FULL DATA IMPORT")
    print("="*50)

    # 1. Setup Region and District
    print("\n1. Setting up Region and District...")
    region, _ = Region.objects.get_or_create(name='Sidama Region', defaults={'code': 'SD'})
    district, _ = District.objects.get_or_create(name='Hawassa', defaults={'region': region})
    print(f"   Region: {region.name}, District: {district.name}")

    # 2. Import Branches (File 1)
    print("\n2. Importing Branches from 'Hawassa District WAN Address.csv'...")
    try:
        df1 = pd.read_csv('data/csv/Hawassa District WAN Address.csv', encoding='latin1')
        count = 0
        for _, row in df1.iterrows():
            branch_name = clean_value(row.get('Branch Name'))
            if branch_name:
                clean_name = branch_name.replace(' Branch', '').strip()
                branch, created = Branch.objects.update_or_create(
                    name=clean_name,
                    defaults={
                        'district': district,
                        'connection_type': clean_value(row.get('Connection Type')),
                        'service_number': clean_value(row.get('Service No.')),
                        'wan_address': clean_value(row.get('WAN Address')),
                        'lan_address': clean_value(row.get('LAN Address')),
                        'default_gateway': clean_value(row.get('Default Gateway')),
                        'account_number': clean_value(row.get('Account No')),
                    }
                )
                count += 1
        print(f"   Processed {count} branches from File 1.")
    except Exception as e:
        print(f"   ERROR reading File 1: {e}")

    # 3. Import WAN-IPs and More Branches (File 2)
    print("\n3. Importing WAN-IPs and Branches from 'WAN-IP and TUNNEL-on-OSPF.csv'...")
    try:
        df2 = pd.read_csv('data/csv/WAN-IP and TUNNEL-on-OSPF.csv', encoding='latin1')
        count_branches = 0
        count_wan_ips = 0

        for idx, row in df2.iterrows():
            try:
                branch_name = clean_value(row.get('Branch Name'))
                if branch_name:
                    clean_name = branch_name.replace(' Branch', '').strip()
                    
                    # Update/Create Branch first
                    branch, created = Branch.objects.update_or_create(
                        name=clean_name,
                        defaults={
                            'district': district,
                            'host_name': clean_value(row.get('Host Name')),
                            'lan_address': clean_value(row.get('LAN IP')) or branch.lan_address if not created else clean_value(row.get('LAN IP')),
                            'wan_address': clean_value(row.get('WAN IP')) or branch.wan_address if not created else clean_value(row.get('WAN IP')),
                            'default_gateway': clean_value(row.get('WAN Default Gateway')) or branch.default_gateway if not created else clean_value(row.get('WAN Default Gateway')),
                            'connection_type': clean_value(row.get('Connection Type')) or branch.connection_type if not created else clean_value(row.get('Connection Type')),
                            'service_number': clean_value(row.get('Service No.')) or branch.service_number if not created else clean_value(row.get('Service No.')),
                            'account_number': clean_value(row.get('Account Number')) or branch.account_number if not created else clean_value(row.get('Account Number')),
                            # Tunnel IPs
                            'tunnel_0': clean_value(row.get('Tunnel 0')),
                            'tunnel_1': clean_value(row.get('Tunnel 1')),
                            'tunnel_2': clean_value(row.get('Tunnel 2')),
                            'tunnel_3': clean_value(row.get('Tunnel 3')),
                            'tunnel_4': clean_value(row.get('Tunnel 4')),
                            'tunnel_5': clean_value(row.get('Tunnel 5')),
                            'tunnel_6': clean_value(row.get('Tunnel 6')),
                            'vsat_ip': clean_value(row.get('VSAT IP')),
                        }
                    )
                    count_branches += 1

                    # Create WAN_IP entry
                    wan_ip_raw = clean_value(row.get('WAN IP'))
                    if wan_ip_raw:
                        # Handle multiple IPs like "10.1.1.1/10.2.2.2" or "10.1.1.1 (10.2.2.2)"
                        # Take the first one for simplicity, or split?
                        # Since unique=True, we should be careful.
                        ip_parts = wan_ip_raw.replace('(', '/').replace(')', '').split('/')
                        primary_ip = ip_parts[0].strip()
                        
                        # Basic very simple validation check
                        if primary_ip and len(primary_ip.split('.')) == 4:
                            try:
                                WAN_IP.objects.get_or_create(
                                    branch=branch,
                                    ip_address=primary_ip,
                                    defaults={
                                        'subnet_mask': '', 
                                        'gateway': clean_value(row.get('WAN Default Gateway')),
                                        'description': clean_value(row.get('Connection Type'))
                                    }
                                )
                                count_wan_ips += 1
                            except Exception as e:
                                print(f"      Warning: Failed to save WAN_IP '{primary_ip}' for {clean_name}: {e}")
                        else:
                             print(f"      Warning: Skipped invalid WAN_IP '{wan_ip_raw}' for {clean_name}")

            except Exception as e:
                print(f"   Error processing row {idx}: {e}")
        
        print(f"   Processed {count_branches} branches/updates.")
        print(f"   Created/Verified {count_wan_ips} WAN_IP records.")

    except Exception as e:
        print(f"   ERROR reading File 2: {e}")

    # 4. Import Contacts
    print("\n4. Importing Contacts from 'contact_person.csv'...")
    try:
        df_contacts = pd.read_csv('data/csv/contact_person.csv', encoding='latin1')
        count_contacts = 0
        
        # Filter valid rows
        if 'Contact Person' in df_contacts.columns:
            name_col = 'Contact Person'
        else:
            name_col = df_contacts.columns[0] # Fallback
            
        for _, row in df_contacts.iterrows():
            contact_name = clean_value(row.get(name_col))
            branch_name = clean_value(row.get('Branch Name'))
            
            if contact_name and branch_name:
                clean_branch_name = branch_name.replace(' Branch', '').strip()
                try:
                    branch = Branch.objects.get(name=clean_branch_name)
                    ContactPerson.objects.update_or_create(
                        branch=branch,
                        full_name=contact_name,
                        defaults={
                            'role': clean_value(row.get('Role')),
                            'phone_number': clean_value(row.get('Phone Number')),
                            'email': clean_value(row.get('Email')),
                        }
                    )
                    count_contacts += 1
                except Branch.DoesNotExist:
                    # print(f"   Skipping contact {contact_name}: Branch '{clean_branch_name}' not found.")
                    pass

        print(f"   Processed {count_contacts} contacts.")

    except Exception as e:
        print(f"   ERROR reading Contacts file: {e}")

    # 5. Import ATMs (File 1: atm_all.csv)
    print("\n5. Importing ATMs from 'atm_all.csv'...")
    try:
        df_atm = pd.read_csv('data/csv/atm_all.csv', encoding='latin1')
        count_atms = 0
        
        for _, row in df_atm.iterrows():
            tid = clean_value(row.get('TID'))
            if tid:
                # Resolve Branch
                branch_name = clean_value(row.get('branch'))
                branch = None
                if branch_name:
                    clean_branch_name = branch_name.replace(' Branch', '').strip()
                    branch = Branch.objects.filter(name=clean_branch_name).first()
                
                atm_name = clean_value(row.get('atm_name')) or f"ATM {tid}"
                
                ATM.objects.update_or_create(
                    tid=tid,
                    defaults={
                        'branch': branch,
                        'atm_name': atm_name,
                        'ip_address': clean_value(row.get('ip_address')),
                        'port': clean_value(row.get('port')),
                        'location_type': clean_value(row.get('location_type')),
                        'atm_brand': clean_value(row.get('atm_brand')) or 'NCR',
                        'deployment_status': clean_value(row.get('deployment_status')) or 'DEPLOYED',
                        'serial_number': clean_value(row.get('serial_number')),
                        'service_number': clean_value(row.get('service_number')),
                        'connection_type': clean_value(row.get('connection_type')),
                        'atm_type': clean_value(row.get('atm_type')),
                        'dispenser_type': clean_value(row.get('dispenser_type')),
                    }
                )
                count_atms += 1
        print(f"   Processed {count_atms} ATMs from main file.")

    except Exception as e:
        print(f"   ERROR reading ATM file: {e}")

    # 6. Import Extra ATMs (File 2: ATMs - Off - WAN - IP.csv)
    print("\n6. Importing Extra ATMs from 'ATMs - Off - WAN - IP.csv'...")
    try:
        df_off = pd.read_csv('data/csv/ATMs - Off - WAN - IP.csv', encoding='latin1')
        count_off = 0
        
        for _, row in df_off.iterrows():
            site_name = clean_value(row.get('Site Name'))
            if site_name:
                # Try to map Site Name to Branch Name if not found
                branch = Branch.objects.filter(name=site_name).first()
                if not branch:
                    branch, _ = Branch.objects.get_or_create(
                        name=site_name, 
                        defaults={'district': district}
                    )
                
                # It seems this file describes Branches with ATMs or just ATMs.
                # It has WAN IP, Service No, etc. updating Branch info
                if branch:
                    branch.wan_address = clean_value(row.get('WAN IP')) or branch.wan_address
                    branch.service_number = clean_value(row.get('Service No.')) or branch.service_number
                    branch.account_number = clean_value(row.get('Account Number')) or branch.account_number
                    branch.save()
                
                # Check for ATM IP
                atm_ip = clean_value(row.get('ATM IP'))
                if atm_ip:
                    # Create/Update ATM based on IP or Site Name?
                    # Since TID is unique and missing here, we might need a generated one or check if exists
                    # This part is tricky. Let's look up by IP first.
                    atm = ATM.objects.filter(ip_address=atm_ip).first()
                    if not atm:
                         # Generate a pseudo TID if not exists
                         tid = f"GEN-{site_name[:5]}-{atm_ip[-3:]}"
                         ATM.objects.create(
                             tid=tid,
                             branch=branch,
                             atm_name=f"{site_name} ATM",
                             ip_address=atm_ip,
                             location_type='Off_Site' if 'Off' in 'Off-WAN' else 'other'
                         )
                         count_off += 1
                    else:
                        # Update branch link
                        if not atm.branch:
                            atm.branch = branch
                            atm.save()
        
        print(f"   Processed {count_off} new ATMs from Off-WAN file.")
    except Exception as e:
        print(f"   ERROR reading Off-WAN file: {e}")

    print("\n" + "="*50)
    print("IMPORT COMPLETE")
    print(f"Total Branches: {Branch.objects.count()}")
    print(f"Total WAN IPs: {WAN_IP.objects.count()}")
    print(f"Total Contacts: {ContactPerson.objects.count()}")
    print(f"Total ATMs: {ATM.objects.count()}")
    print("="*50)

if __name__ == '__main__':
    run_import()
