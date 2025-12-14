# cbe/views.py
from django.shortcuts import render
from .models import District, Branch, ContactPerson, ATM

def home(request):
    context = {
        'branches_count': Branch.objects.count(),
        'atms_count': ATM.objects.count(),
        'contacts_count': ContactPerson.objects.count(),
        'districts_count': District.objects.count(),
    }
    return render(request, 'home.html', context)