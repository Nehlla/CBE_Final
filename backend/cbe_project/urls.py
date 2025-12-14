# cbe_project/urls.py
from django.contrib import admin
from django.urls import path
from cbe.views import home  # Import your home view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),  # Use your home view
]