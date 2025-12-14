import re
import pandas as pd
import json
import os
from datetime import datetime


def read_csv_safe(file_path: str):
    """Read CSV trying multiple encodings without normalizing column names.

    Returns a DataFrame with original column names or None on failure.
    """
    encodings_to_try = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'windows-1252']
    last_exception = None

    for enc in encodings_to_try:
        try:
            df = pd.read_csv(file_path, encoding=enc)
            # Keep original column names
            return df
        except Exception as e:
            last_exception = e
            continue

    # Final attempt with errors='replace'
    try:
        df = pd.read_csv(file_path, encoding='utf-8', errors='replace')
        return df
    except Exception as e:
        raise last_exception or e


def map_row_to_model(row, model_class, column_mapping):
    """
    Maps a CSV row to a Django model instance using a strict column mapping.

    Args:
        row (pd.Series): A row from the pandas DataFrame.
        model_class (Model): The Django model class to map to.
        column_mapping (dict): A dictionary mapping model field names to CSV column names.

    Returns:
        dict: A dictionary of model fields and their values.
    """
    model_data = {}
    for field_name, column_name in column_mapping.items():
        if column_name in row:
            value = row[column_name]
            if pd.notna(value) and value not in ['', ' ', None]:
                model_data[field_name] = value
    return model_data


def normalize_tid(value):
    """Normalize TID values read from CSVs.

    - Converts floats like '12345.0' to '12345'
    - Converts scientific notation like '1.0011E+12' to full integer string when possible
    - Strips whitespace and common CSV artifacts
    Returns a string or None.
    """
    if value is None:
        return None
    s = str(value).strip()
    if s == '':
        return None

    # remove commas and surrounding quotes
    s = s.replace(',', '').strip('"').strip("'")

    # If it's an integer-like float (e.g., '12345.0'), remove the decimal part
    if re.match(r'^-?\d+\.0+$', s):
        return s.split('.')[0]

    # Try to parse scientific notation or large floats to integer string
    try:
        # Use Decimal for safer large number handling
        from decimal import Decimal
        d = Decimal(s)
        # If it's whole number, return as integer string
        if d == d.to_integral_value():
            return format(d.quantize(1).to_integral_value())
        # otherwise return normalized decimal without exponent
        return format(d.normalize())
    except Exception:
        # fallback: if contains a dot with only zeros after, strip; else return cleaned string
        if '.' in s and s.rstrip('0').endswith('.'):
            return s.split('.')[0]
        return s


def persist_import_row(source_file: str, row: dict, model: str = None, model_pk: str = None):
    """Persist the original CSV row into a JSONL file under `data/imported/`.

    Each line will be a JSON object containing: timestamp, source_file, model, model_pk, row
    This avoids changing DB schema while keeping every column from the CSV.
    """
    try:
        base_dir = os.path.join('data', 'imported')
        os.makedirs(base_dir, exist_ok=True)

        # sanitize source filename to key
        key = os.path.basename(source_file)
        key = re.sub(r'[^0-9a-zA-Z._-]+', '_', key)
        file_path = os.path.join(base_dir, f"{key}.jsonl")

        entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'source_file': source_file,
            'model': model,
            'model_pk': str(model_pk) if model_pk is not None else None,
            'row': row
        }

        with open(file_path, 'a', encoding='utf-8') as fh:
            fh.write(json.dumps(entry, ensure_ascii=False) + '\n')

        return file_path
    except Exception:
        return None
