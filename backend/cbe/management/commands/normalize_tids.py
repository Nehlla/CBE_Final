from django.core.management.base import BaseCommand
from cbe.models import ATM
from cbe.csv_utils import normalize_tid


class Command(BaseCommand):
    help = 'Normalize existing ATM tid values to consistent string format'

    def handle(self, *args, **options):
        self.stdout.write('Starting TID normalization for ATMs...')
        updated = 0
        conflicts = 0

        for atm in ATM.objects.all():
            original = atm.tid
            new_tid = normalize_tid(original)
            if new_tid is None:
                continue

            # If unchanged, skip
            if str(original) == str(new_tid):
                continue

            # Ensure uniqueness: if new_tid already exists for a different ATM, append suffix
            existing = ATM.objects.filter(tid=new_tid).exclude(pk=atm.pk).first()
            if existing:
                # create a unique tid
                suffix = 1
                candidate = f"{new_tid}-{suffix}"
                while ATM.objects.filter(tid=candidate).exists():
                    suffix += 1
                    candidate = f"{new_tid}-{suffix}"
                atm.tid = candidate
                conflicts += 1
            else:
                atm.tid = new_tid

            atm.save()
            updated += 1

        self.stdout.write(self.style.SUCCESS(f'Normalized {updated} ATM tid values; {conflicts} conflicts resolved.'))