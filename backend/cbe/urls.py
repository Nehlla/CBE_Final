# cbe/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegionViewSet, DistrictViewSet, BranchViewSet,
    ContactPersonViewSet, ATMViewSet, WANIPViewSet, UserViewSet
)

router = DefaultRouter()
router.register(r'regions', RegionViewSet)
router.register(r'districts', DistrictViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'contacts', ContactPersonViewSet)
router.register(r'atms', ATMViewSet)
router.register(r'wan-ips', WANIPViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
