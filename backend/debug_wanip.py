import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
USERNAME = "ekram"
PASSWORD = "ekram77"

def get_auth_token():
    resp = requests.post(f"{BASE_URL}/token/", json={"username": USERNAME, "password": PASSWORD})
    if resp.status_code == 200:
        return resp.json()['access']
    else:
        print("Login failed")
        return None

def test_wan_ip():
    token = get_auth_token()
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 1. GET all
    print("\n--- GET /wan-ips/ ---")
    resp = requests.get(f"{BASE_URL}/wan-ips/", headers=headers)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    
    # Handle pagination
    results = data.get('results', []) if isinstance(data, dict) else data
    print(f"Found {len(results)} items")
    
    if len(results) > 0:
        first_item = results[0]
        print("First Item Sample:", json.dumps(first_item, indent=2))
        
        item_id = first_item['id']
        branch_id = first_item.get('branch') # Check if this is ID or object
        
        print(f"Trying to UPDATE item {item_id} with branch_id: {branch_id}")
        
        # 2. PUT update
        # Construct payload mimicking frontend
        payload = {
            "branch_id": branch_id,
            "ip_address": first_item.get('ip_address', '127.0.0.1'),
            "subnet_mask": first_item.get('subnet_mask', '255.255.255.0'),
            "gateway": first_item.get('gateway', '127.0.0.1'),
            "description": first_item.get('description', '') + " [Updated]"
        }
        
        print("Payload:", json.dumps(payload, indent=2))
        
        update_resp = requests.put(f"{BASE_URL}/wan-ips/{item_id}/", json=payload, headers=headers)
        print(f"Update Status: {update_resp.status_code}")
        if update_resp.status_code != 200:
            print("Update Failed:", update_resp.text)
        else:
            print("Update Successful!")
            print(json.dumps(update_resp.json(), indent=2))

test_wan_ip()
