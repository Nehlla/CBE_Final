from django.contrib import admin
from .models import Region, District, Branch, ContactPerson, ATM

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'district_count', 'created_at']
    search_fields = ['name', 'code']
    
    def district_count(self, obj):
        return obj.districts.count()
    district_count.short_description = 'Districts'

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'region', 'branch_count', 'created_at']
    list_filter = ['region']
    search_fields = ['name', 'region__name']
    
    def branch_count(self, obj):
        return obj.branch_set.count()
    branch_count.short_description = 'Branches'

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'district', 'connection_type', 'service_number', 'wan_address', 'contact_count', 'atm_count']
    list_filter = ['connection_type', 'district', 'district__region']
    search_fields = ['name', 'service_number', 'wan_address']
    readonly_fields = ['created_at', 'updated_at']
    
    def contact_count(self, obj):
        return obj.contacts.count()
    contact_count.short_description = 'Contacts'
    
    def atm_count(self, obj):
        return obj.atms.count()
    atm_count.short_description = 'ATMs'

@admin.register(ContactPerson)
class ContactPersonAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'branch', 'role', 'phone_number', 'email']
    list_filter = ['role', 'branch', 'branch__district__region']
    search_fields = ['full_name', 'phone_number', 'branch__name']
    raw_id_fields = ['branch']

@admin.register(ATM)
class ATMAdmin(admin.ModelAdmin):
    list_display = ['tid', 'atm_name', 'branch', 'deployment_status', 'ip_address', 'location_type']
    list_filter = ['deployment_status', 'branch', 'branch__district__region']
    search_fields = ['tid', 'atm_name', 'ip_address']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['branch']