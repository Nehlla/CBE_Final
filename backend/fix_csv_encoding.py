import pandas as pd

def fix_encoding(file_path):
    """Fix CSV encoding issues"""
    try:
        # Try reading with different encodings
        encodings = ['latin-1', 'iso-8859-1', 'cp1252', 'windows-1252']
        
        for encoding in encodings:
            try:
                print(f"Trying {encoding} for {file_path}")
                df = pd.read_csv(file_path, encoding=encoding)
                print(f"Success with {encoding}!")
                
                # Save with UTF-8 encoding
                df.to_csv(file_path, index=False, encoding='utf-8')
                print(f"Converted {file_path} to UTF-8")
                return True
            except UnicodeDecodeError:
                continue
            except Exception as e:
                print(f"Error with {encoding}: {e}")
                continue
        
        print(f"Could not convert {file_path}")
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False


print("Fixing CSV encoding...")
fix_encoding('data/csv/Hawassa District WAN Address.csv')
print("Done!")