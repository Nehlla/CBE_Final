import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from cbe.models import Region, District, Branch, ContactPerson, ATM
from cbe.csv_utils import read_csv_safe, get_row_value, normalize_tid
from cbe.csv_utils import persist_import_row

class Command(BaseCommand):
    help = 'Import CBE data with duplicate removal'

    def handle(self, *args, **options):
        self.stdout.write('Starting CBE data import with duplicate removal...')
        
        with transaction.atomic():
            # Setup regions and districts first
            self.setup_regions()
            
            # Clean existing data to start fresh
            self.clean_existing_data()
            
            # Import data
            self.import_branches()
            self.import_contacts()
            # Import ATMs from main ATM file
            self.import_atms()
            # Merge/Import ATMs - Off - WAN - IP data (updates branches and ATM IPs)
            self.import_atms_off_wan()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully imported CBE data with no duplicates!')
        )

    def clean_existing_data(self):
        """Remove existing data to prevent duplicates"""
        self.stdout.write('Cleaning existing data...')
        Branch.objects.all().delete()
        ContactPerson.objects.all().delete()
        ATM.objects.all().delete()
        self.stdout.write('Existing data cleared')

    def setup_regions(self):
        """Setup South Region and districts"""
        self.stdout.write('Setting up regional structure...')
        
        # Create South Region
        south_region, created = Region.objects.get_or_create(
            name='South Region',
            defaults={'code': 'SOUTH'}
        )
        
        # Create districts
        districts = ['Hawassa', 'Shashemene', 'Dilla']
        for district_name in districts:
            district, created = District.objects.get_or_create(
                name=district_name,
                defaults={'region': south_region}
            )
            if created:
                self.stdout.write(f'Created district: {district_name}')
        
        self.stdout.write('Regional structure setup completed')

    def clean_value(self, value):
        """Clean CSV values"""
        if pd.isna(value) or value in ['', 'null', 'None', ' ', 'nan']:
            return None
        return str(value).strip()
    

    def find_branch_by_name(self, branch_name):
        """Find a branch by name with flexible matching"""
        if not branch_name:
            return None
            
        # Clean branch name
        clean_name = branch_name.replace(' Branch', '').strip()
        
        # Try exact match first
        try:
            return Branch.objects.get(name=clean_name)
        except Branch.DoesNotExist:
            # Try case-insensitive exact match
            try:
                return Branch.objects.get(name__iexact=clean_name)
            except Branch.DoesNotExist:
                # Try contains match
                branches = Branch.objects.filter(name__icontains=clean_name)
                if branches.exists():
                    return branches.first()
                # Try partial match with first word
                first_word = clean_name.split()[0] if clean_name.split() else ''
                if first_word:
                    branches = Branch.objects.filter(name__icontains=first_word)
                    if branches.exists():
                        return branches.first()
        except Branch.MultipleObjectsReturned:
            # If multiple matches, return the first one
            return Branch.objects.filter(name__icontains=clean_name).first()
        
        return None

    def import_branches(self):
        """Import branches with duplicate prevention"""
        self.stdout.write('Importing branches (preventing duplicates)...')
        
        try:
            # Get Hawassa district
            hawassa_district = District.objects.get(name='Hawassa')
            
            # Track processed branches to avoid duplicates
            processed_branches = set()
            count = 0
            
            # Import from main branch file
            try:
                df = read_csv_safe('data/csv/Hawassa District WAN Address.csv')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Could not read branches file: {e}'))
                df = None

            if df is not None:
                for _, row in df.iterrows():
                    branch_name = self.clean_value(get_row_value(row, 'Branch Name', 'branch_name', 'branch'))
                    if branch_name and branch_name not in processed_branches:
                        # Clean branch name
                        clean_branch_name = branch_name.replace(' Branch', '').strip()

                        branch, created = Branch.objects.get_or_create(
                            name=clean_branch_name,
                            defaults={
                                'district': hawassa_district,
                                'connection_type': self.clean_value(get_row_value(row, 'Connection Type', 'connection_type')),
                                'service_number': self.clean_value(get_row_value(row, 'Service No.', 'service_no', 'service_number')),
                                'account_number': self.clean_value(get_row_value(row, 'Account No', 'account_no')),
                                'wan_address': self.clean_value(get_row_value(row, 'WAN Address', 'wan_address', 'wan_ip', 'wan ip')),
                                'default_gateway': self.clean_value(get_row_value(row, 'Default Gateway', 'wan_default_gateway', 'default_gateway')),
                                'lan_address': self.clean_value(get_row_value(row, 'LAN Address', 'lan_address', 'lan ip')),
                            }
                        )
                        processed_branches.add(branch_name)
                        # persist original row for auditing / full column preservation
                        try:
                            persist_import_row('data/csv/Hawassa District WAN Address.csv', row.to_dict(), model='Branch', model_pk=branch.pk)
                        except Exception:
                            pass
                        count += 1
                        if count <= 10:
                            action = 'Created' if created else 'Updated'
                            self.stdout.write(f'  {action} branch: {clean_branch_name}')
            
            # Import from second branch file (avoiding duplicates)
            self.stdout.write('Processing second branches file...')
            try:
                df2 = read_csv_safe('data/csv/WAN-IP and TUNNEL-on-OSPF.csv')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Could not read second branches file: {e}'))
                df2 = None
            if df2 is not None:
                count2 = 0
                for _, row in df2.iterrows():
                    branch_name = self.clean_value(get_row_value(row, 'Branch Name', 'branch_name', 'branch'))
                    if branch_name and branch_name not in processed_branches:
                        clean_branch_name = branch_name.replace(' Branch', '').strip()
                        
                        branch, created = Branch.objects.get_or_create(
                            name=clean_branch_name,
                            defaults={
                                'district': hawassa_district,
                                'connection_type': self.clean_value(get_row_value(row, 'Connection Type', 'connection_type')),
                                'service_number': self.clean_value(get_row_value(row, 'Service No.', 'service_no', 'service_number')),
                                'host_name': self.clean_value(get_row_value(row, 'Host Name', 'host_name')),
                                'wan_address': self.clean_value(get_row_value(row, 'WAN IP', 'wan_ip', 'wan_address')),
                                'lan_address': self.clean_value(get_row_value(row, 'LAN IP', 'lan ip', 'lan_address')),
                                'default_gateway': self.clean_value(get_row_value(row, 'WAN Default Gateway', 'wan_default_gateway', 'default_gateway')),
                            }
                        )
                        processed_branches.add(branch_name)
                        try:
                            persist_import_row('data/csv/WAN-IP and TUNNEL-on-OSPF.csv', row.to_dict(), model='Branch', model_pk=branch.pk)
                        except Exception:
                            pass
                        count2 += 1
                        if created:
                            self.stdout.write(f'  Created from second file: {clean_branch_name}')
            
            self.stdout.write(f'Imported {count + count2} unique branches')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing branches: {e}'))

    def import_contacts(self):
        """Import contact persons with duplicate prevention"""
        self.stdout.write('Importing contact persons (preventing duplicates)...')
        
        try:
            try:
                df = read_csv_safe('data/csv/contact_person.csv')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Could not read contacts file: {e}'))
                df = None
            if df is None:
                self.stdout.write(self.style.ERROR('Could not read contacts file'))
                return
                
            # Remove empty rows (normalized column names)
            if 'contact_person' in df.columns:
                df = df[df['contact_person'].notna() & (df['contact_person'] != '')]
            elif 'contact_person_name' in df.columns:
                df = df[df['contact_person_name'].notna() & (df['contact_person_name'] != '')]
            
            # Track processed contacts to avoid duplicates
            processed_contacts = set()
            count = 0
            
            for _, row in df.iterrows():
                branch_name = self.clean_value(get_row_value(row, 'Branch Name', 'branch_name', 'branch'))
                contact_name = self.clean_value(get_row_value(row, 'Contact Person', 'contact_person', 'contact_person_name'))
                
                if branch_name and contact_name:
                    # Create unique key for contact
                    contact_key = f"{branch_name}_{contact_name}"
                    
                    if contact_key not in processed_contacts:
                        # Find branch using the helper function
                        branch = self.find_branch_by_name(branch_name)
                        
                        if branch:
                            # Use get_or_create to prevent duplicates
                            contact, created = ContactPerson.objects.get_or_create(
                                branch=branch,
                                full_name=contact_name,
                                defaults={
                                    'role': self.clean_value(get_row_value(row, 'Role', 'role')),
                                    'phone_number': self.clean_value(get_row_value(row, 'Phone Number', 'phone_number')),
                                    'email': self.clean_value(get_row_value(row, 'Email', 'email')),
                                    'department': self.clean_value(get_row_value(row, 'Department', 'department')),
                                }
                            )
                            processed_contacts.add(contact_key)
                            count += 1
                            if count <= 10:
                                self.stdout.write(f'  Added contact: {contact_name} for {branch.name}')
                            try:
                                persist_import_row('data/csv/contact_person.csv', row.to_dict(), model='ContactPerson', model_pk=contact.pk)
                            except Exception:
                                pass
                        else:
                            if count <= 5:
                                self.stdout.write(f'  Branch not found: {branch_name}')
            
            self.stdout.write(f'Imported {count} unique contact persons')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing contacts: {e}'))

    def import_atms(self):
        """Import ATMs with duplicate prevention using TID"""
        self.stdout.write('Importing ATMs (preventing duplicates by TID)...')
        
        try:
            try:
                df = read_csv_safe('data/csv/atm_all.csv')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Could not read ATMs file: {e}'))
                df = None
            if df is None:
                self.stdout.write(self.style.ERROR('Could not read ATMs file'))
                return
                
            count = 0
            for _, row in df.iterrows():
                raw_tid = get_row_value(row, 'TID', 'tid')
                tid = self.clean_value(normalize_tid(raw_tid))
                if tid:
                    # Find branch using the helper function
                    branch = None
                    branch_name = self.clean_value(get_row_value(row, 'branch', 'branch_name'))
                    if branch_name:
                        branch = self.find_branch_by_name(branch_name)
                    
                    atm_name = self.clean_value(get_row_value(row, 'atm_name', 'atm name', 'atm')) or f'ATM {tid}'
                    
                    # Use get_or_create with TID (which is unique)
                    atm, created = ATM.objects.get_or_create(
                        tid=tid,
                        defaults={
                            'branch': branch,
                            'atm_name': atm_name,
                            'ip_address': self.clean_value(get_row_value(row, 'ip_address', 'ip address', 'ip')),
                            'port': self.clean_value(get_row_value(row, 'port')),
                            'location_type': self.clean_value(get_row_value(row, 'location_type')),
                            'atm_brand': self.clean_value(get_row_value(row, 'atm_brand', 'brand')) or 'NCR',
                            'dispenser_type': self.clean_value(get_row_value(row, 'dispenser_type')),
                            'atm_type': self.clean_value(get_row_value(row, 'atm_type')),
                            'serial_number': self.clean_value(get_row_value(row, 'serial_number')),
                            'tag_no': self.clean_value(get_row_value(row, 'tag_no')),
                            'deployment_status': self.clean_value(get_row_value(row, 'deployment_status')) or 'DEPLOYED',
                            'placement_type': self.clean_value(get_row_value(row, 'placement_type')),
                            'service_number': self.clean_value(get_row_value(row, 'service_number', 'service_no')),
                            'connection_type': self.clean_value(get_row_value(row, 'connection_type')),
                            'reserve_casset_availability': self.clean_value(get_row_value(row, 'reserve_casset_availability')),
                            'reserve_casset_quantity': self.clean_value(get_row_value(row, 'reserve_casset_quantity')),
                        }
                    )
                    count += 1
                    if count <= 10:
                        action = 'Created' if created else 'Updated'
                        self.stdout.write(f'  {action} ATM: {tid}')
                    try:
                        persist_import_row('data/csv/atm_all.csv', row.to_dict(), model='ATM', model_pk=atm.pk)
                    except Exception:
                        pass
            
            self.stdout.write(f'Imported {count} unique ATMs')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing ATMs: {e}'))

    def import_atms_off_wan(self):
        """Import/merge data from 'ATMs - Off - WAN - IP.csv' into branches and update ATM IPs."""
        self.stdout.write("Importing ATMs - Off - WAN - IP (merging into branches)...")

        try:
            try:
                df = read_csv_safe('data/csv/ATMs - Off - WAN - IP.csv')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Could not read ATMs-off-wan file: {e}'))
                return

            if df is None:
                self.stdout.write(self.style.ERROR('No data in ATMs-off-wan file'))
                return

            count = 0
            for _, row in df.iterrows():
                site = self.clean_value(get_row_value(row, 'Site Name', 'site_name', 'site'))
                if not site:
                    continue

                # attempt to find or create branch
                branch = self.find_branch_by_name(site)
                if branch is None:
                    # fallback: create under Hawassa if district exists
                    try:
                        hawassa = District.objects.get(name='Hawassa')
                    except District.DoesNotExist:
                        hawassa = None

                    branch, created = Branch.objects.get_or_create(
                        name=site,
                        defaults={'district': hawassa}
                    )
                    if created:
                        self.stdout.write(f'  Created branch for site: {site}')

                # update branch fields
                branch.connection_type = self.clean_value(get_row_value(row, 'Connection Type', 'connection_type')) or branch.connection_type
                branch.service_number = self.clean_value(get_row_value(row, 'Service No.', 'service_no', 'service_number')) or branch.service_number
                branch.account_number = self.clean_value(get_row_value(row, 'Account Number', 'account_number')) or branch.account_number
                branch.wan_address = self.clean_value(get_row_value(row, 'WAN IP', 'wan_ip', 'wan_address')) or branch.wan_address
                branch.lan_address = self.clean_value(get_row_value(row, 'LAN Address (Router IP)', 'lan_address', 'lan ip', 'lan_address_router_ip')) or branch.lan_address
                # LoopBack (Router-id) may be a gateway
                branch.default_gateway = self.clean_value(get_row_value(row, 'LoopBack (Router-id)', 'loopback', 'router-id', 'default_gateway')) or branch.default_gateway

                # Collect tunnel columns (up to 7 tunnels mapped to tunnel_0..6)
                tunnel_cols = [c for c in df.columns if c.startswith('tunnel_ip') or 'tunnel' in c]
                # also support original names from this CSV
                preferred = [
                    'tunnel ip dr-er116','tunnel ip dr-er126','tunnel ip dc-er316','tunnel ip dc-er416',
                    'tunnel ip dr-er11','tunnel ip dr-er12','tunnel ip dc-er21','tunnel ip dc-er22'
                ]

                tunnels = []
                for name in preferred:
                    val = get_row_value(row, name)
                    if val:
                        tunnels.append(self.clean_value(val))

                # if no preferred matches, try any column containing 'tunnel'
                if not tunnels:
                    for col in df.columns:
                        if 'tunnel' in col:
                            val = row.get(col)
                            if pd.notna(val) and str(val).strip() != '':
                                tunnels.append(self.clean_value(val))

                # assign up to 7 tunnel fields
                for i in range(7):
                    attr = f'tunnel_{i}'
                    val = tunnels[i] if i < len(tunnels) else None
                    setattr(branch, attr, val)

                branch.save()

                # Update or create ATM by ATM IP if present
                atm_ip = self.clean_value(get_row_value(row, 'ATM IP', 'atm_ip', 'atm ip'))
                if atm_ip:
                    # try find ATM by ip
                    atm = ATM.objects.filter(ip_address=atm_ip).first()
                    if atm:
                        # link to branch if missing
                        if atm.branch is None and branch:
                            atm.branch = branch
                            atm.save()
                    else:
                        # create a minimal ATM record using available data
                            tid_candidate = normalize_tid(get_row_value(row, 'Service No.', 'service_no'))
                            tid = self.clean_value(tid_candidate) or f'AUTO-SN-{self.clean_value(get_row_value(row, 'SN', 'sn'))}'
                        # ensure uniqueness for tid
                        if ATM.objects.filter(tid=tid).exists():
                            # fallback to generated unique
                            import uuid
                            tid = f'AUTO-{uuid.uuid4().hex[:8]}'

                        atm = ATM.objects.create(
                            tid=tid,
                            branch=branch,
                            atm_name=site,
                            ip_address=atm_ip
                        )
                        self.stdout.write(f'  Created ATM {atm.tid} for branch {branch.name} with IP {atm_ip}')

                count += 1

            self.stdout.write(f'Imported/merged {count} rows from ATMs-off-wan file')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing ATMs-off-wan: {e}'))