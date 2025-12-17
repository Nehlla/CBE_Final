# cbe/serializers.py
from rest_framework import serializers
from .models import Region, District, Branch, ContactPerson, ATM, WAN_IP

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'name', 'code']

class DistrictSerializer(serializers.ModelSerializer):
    region = RegionSerializer(read_only=True)
    region_id = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(), 
        source='region', 
        write_only=True
    )
    
    class Meta:
        model = District
        fields = ['id', 'name', 'region', 'region_id']

class ContactPersonSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    
    class Meta:
        model = ContactPerson
        fields = [
            'id', 'branch', 'branch_name', 'full_name', 'role', 
            'phone_number', 'email', 'alternative_phone', 'department',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class BranchSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    contacts = ContactPersonSerializer(many=True, read_only=True)
    district_id = serializers.PrimaryKeyRelatedField(
        queryset=District.objects.all(),
        source='district',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Branch
        fields = [
            'id', 'name', 'district', 'district_id', 'district_name',
            'connection_type', 'service_number', 'wan_address', 
            'default_gateway', 'lan_address', 'host_name', 'vsat_ip',
            'tunnel_0', 'tunnel_1', 'tunnel_2', 'tunnel_3', 
            'tunnel_4', 'tunnel_5', 'tunnel_6',
            'contacts', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ATMSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = ATM
        fields = [
            'id', 'branch', 'branch_id', 'branch_name', 'tid', 'atm_name',
            'ip_address', 'port', 'location_type', 'atm_brand',
            'dispenser_type', 'atm_type', 'serial_number', 'tag_no',
            'deployment_status', 'placement_type', 'service_number',
            'connection_type', 'reserve_casset_availability',
            'reserve_casset_quantity', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class WANIPSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        write_only=True
    )
    
    class Meta:
        model = WAN_IP
        fields = [
            'id', 'branch', 'branch_id', 'branch_name', 'ip_address',
            'subnet_mask', 'gateway', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        from django.contrib.auth.models import User
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_superuser']
        read_only_fields = ['id', 'is_superuser'] # superuser status restricted in serializer for safety

    def create(self, validated_data):
        from django.contrib.auth.models import User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        return super().update(instance, validated_data)
