import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
USERNAME = "ekram"
PASSWORD = "ekram77"

print(f"--- 1. Testing Login ({BASE_URL}/token/) ---")
try:
    login_resp = requests.post(f"{BASE_URL}/token/", json={
        "username": USERNAME,
        "password": PASSWORD
    })
    
    print(f"Status Code: {login_resp.status_code}")
    if login_resp.status_code == 200:
        tokens = login_resp.json()
        print("✅ Login Successful! Tokens received.")
        access_token = tokens.get('access')
        print(f"Access Token (first 20 chars): {access_token[:20]}...")
        
        # Step 2: Test Profile Fetch
        print(f"\n--- 2. Testing Profile Fetch ({BASE_URL}/users/me/) ---")
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        profile_resp = requests.get(f"{BASE_URL}/users/me/", headers=headers)
        
        print(f"Status Code: {profile_resp.status_code}")
        if profile_resp.status_code == 200:
            print("✅ Profile Fetch Successful!")
            print(json.dumps(profile_resp.json(), indent=2))
        else:
            print("❌ Profile Fetch Failed!")
            print(profile_resp.text)
            
    else:
        print("❌ Login Failed!")
        print(login_resp.text)

except Exception as e:
    print(f"❌ CONNECTION ERROR: {e}")
    print("Ensure the backend server is running on port 8000.")
