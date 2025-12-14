import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbe_project.settings')
django.setup()

from cbe.models import District, Branch

# Get the district
district = District.objects.get(name='Hawassa')

# List of missing branches from your error messages
missing_branches = [
    'Aleta Wondo', 'Borecha', 'Chiri', 'Dara', 'Daye', 'Deka Softu', 
    'Dore Bafeno', 'Erba Muda', 'Furra', 'Gebriel Sefer', 'Gorche',
    'Hantete', 'Harekello', 'Hawassa Addisu Menaherya', 'Hawassa Bahil Adarash',
    'Hawassa', 'Huladirrie', 'Haranfama', 'Mountain Tabor', 'Rahima CBE Noor',
    'Tabor', 'Tula', 'Godguada', 'Wolde Amanuel Adebabay', 'Wondogenet Chuko',
    'Wonsho', 'Yirgalem Industrial Park'
]

print("Creating missing branches...")
for branch_name in missing_branches:
    branch, created = Branch.objects.get_or_create(
        name=branch_name,
        defaults={'district': district}
    )
    if created:
        print(f'Created branch: {branch_name}')

print("Missing branches created!")