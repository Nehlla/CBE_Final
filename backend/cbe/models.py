from django.db import models
import uuid

class Region(models.Model):
    #id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, blank=True, null=True)
    #created_at = models.DateTimeField(auto_now_add=True)
    #updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'regions'
    
    def __str__(self):
        return self.name

class District(models.Model):
    #id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='districts')
    #created_at = models.DateTimeField(auto_now_add=True)
    #updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'districts'
    
    def __str__(self):
        return f"{self.name} - {self.region.name}"

class Branch(models.Model):
    CONNECTION_TYPES = [
        ('FIBER', 'Fiber'),
        ('ADSL', 'ADSL'),
        ('VSAT', 'VSAT'),
        ('VDSL', 'VDSL'),
        ('3G', '3G'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)  # UNIQUE to prevent duplicates
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)
    
    connection_type = models.CharField(max_length=20, choices=CONNECTION_TYPES, blank=True, null=True)
    service_number = models.CharField(max_length=50, blank=True, null=True)
    wan_address = models.CharField(max_length=100, blank=True, null=True)
    default_gateway = models.CharField(max_length=100, blank=True, null=True)
    lan_address = models.CharField(max_length=100, blank=True, null=True)
    
    host_name = models.CharField(max_length=100, blank=True, null=True)
    vsat_ip = models.CharField(max_length=50, blank=True, null=True)
    
    # Tunnel IPs
    tunnel_0 = models.CharField(max_length=50, blank=True, null=True)
    tunnel_1 = models.CharField(max_length=50, blank=True, null=True)
    tunnel_2 = models.CharField(max_length=50, blank=True, null=True)
    tunnel_3 = models.CharField(max_length=50, blank=True, null=True)
    tunnel_4 = models.CharField(max_length=50, blank=True, null=True)
    tunnel_5 = models.CharField(max_length=50, blank=True, null=True)
    tunnel_6 = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'branches'
        verbose_name_plural = 'branches'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class ContactPerson(models.Model):
    #id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='contacts')
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Additional contact details
    email = models.CharField(max_length=255, blank=True, null=True)
    alternative_phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'contact_persons'
        ordering = ['branch', 'full_name']
        # Prevent duplicate contacts for same branch
        unique_together = ['branch', 'full_name']
    
    def __str__(self):
        return f"{self.full_name} - {self.branch.name}"

class ATM(models.Model):
    DEPLOYMENT_STATUS = [
        ('DEPLOYED', 'Deployed'),
        ('NOT_DEPLOYED', 'Not Deployed'),
        ('IN_MAINTENANCE', 'In Maintenance'),
    ]
    
    LOCATION_TYPES = [
        ('Industrial_Park', 'Industrial Park'),
        ('Financial_Institution', 'Financial Institution'),
        ('University', 'University'),
        ('Hotel', 'Hotel'),
        ('Military_Base', 'Military Base'),
        ('Office_Building', 'Office Building'),
        ('Hospital', 'Hospital'),
        ('other', 'Other'),
    ]
    
    #id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='atms')
    
    # ATM Identification
    tid = models.CharField(max_length=20, unique=True)  # UNIQUE to prevent duplicates
    atm_name = models.CharField(max_length=200)
    
    # Technical Information
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    port = models.CharField(max_length=20, blank=True, null=True)
    
    # ATM Specifications
    location_type = models.CharField(max_length=50, choices=LOCATION_TYPES, blank=True, null=True)
    atm_brand = models.CharField(max_length=50, default='NCR')
    dispenser_type = models.CharField(max_length=20, blank=True, null=True)
    atm_type = models.CharField(max_length=20, blank=True, null=True)
    serial_number = models.CharField(max_length=50, blank=True, null=True)
    tag_no = models.CharField(max_length=50, blank=True, null=True)
    
    # Status Information
    deployment_status = models.CharField(max_length=20, choices=DEPLOYMENT_STATUS, default='DEPLOYED')
    placement_type = models.CharField(max_length=20, blank=True, null=True)
    
    # Service Information
    service_number = models.CharField(max_length=50, blank=True, null=True)
    connection_type = models.CharField(max_length=20, choices=Branch.CONNECTION_TYPES, blank=True, null=True)
    
    # Additional fields
    reserve_casset_availability = models.CharField(max_length=20, blank=True, null=True)
    reserve_casset_quantity = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'atms'
        verbose_name = 'ATM'
        verbose_name_plural = 'ATMs'
        ordering = ['tid']
    
    def __str__(self):
        return f"{self.tid} - {self.atm_name}"
    
class WAN_IP(models.Model):
    CONNECTION_TYPES = [
        ('FIBER', 'Fiber'),
        ('ADSL', 'ADSL'),
        ('VSAT', 'VSAT'),
        ('VDSL', 'VDSL'),
        ('3G', '3G'),
        ('other', 'Other'),
    ]
    #id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='wan_ips')
    ip_address = models.GenericIPAddressField(unique=True)  # UNIQUE to prevent duplicates
    subnet_mask = models.CharField(max_length=20, blank=True, null=True)
    gateway = models.CharField(max_length=50, blank=True, null=True)
    
    # Additional fields
    description = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wan_ips'
        verbose_name_plural = 'WAN IPs'
        ordering = ['ip_address']
    
    def __str__(self):
        return f"{self.ip_address} - {self.branch.name}"