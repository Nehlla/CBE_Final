# cbe/views.py
from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from .models import Region, District, Branch, ContactPerson, ATM, WAN_IP
from .serializers import (
    RegionSerializer, DistrictSerializer, BranchSerializer,
    ContactPersonSerializer, ATMSerializer, WANIPSerializer, UserSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        # Update current user profile
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class RegionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing regions.
    """
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name']
    ordering = ['name']

class DistrictViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing districts.
    """
    queryset = District.objects.select_related('region').all()
    serializer_class = DistrictSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['region']
    search_fields = ['name', 'region__name']
    ordering_fields = ['name']
    ordering = ['name']

class BranchViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing branches.
    """
    queryset = Branch.objects.select_related('district').prefetch_related('contacts').all()
    serializer_class = BranchSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['district', 'connection_type']
    search_fields = ['name', 'service_number', 'district__name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class ContactPersonViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing contact persons.
    """
    queryset = ContactPerson.objects.select_related('branch').all()
    serializer_class = ContactPersonSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['branch', 'role']
    search_fields = ['full_name', 'role', 'branch__name']
    ordering_fields = ['full_name', 'created_at']
    ordering = ['full_name']

class ATMViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing ATMs.
    """
    queryset = ATM.objects.select_related('branch').all()
    serializer_class = ATMSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['branch', 'deployment_status', 'location_type', 'atm_brand']
    search_fields = ['tid', 'atm_name', 'branch__name']
    ordering_fields = ['tid', 'atm_name', 'created_at']
    ordering = ['tid']

class WANIPViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing WAN IP addresses.
    """
    queryset = WAN_IP.objects.select_related('branch').all()
    serializer_class = WANIPSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['branch']
    search_fields = ['ip_address', 'branch__name']
    ordering_fields = ['ip_address', 'created_at']
    ordering = ['ip_address']