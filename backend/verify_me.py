import urllib.request
import json
import urllib.error

# 1. Login
url_token = "http://127.0.0.1:8000/api/token/"
data = {
    "username": "ekram",
    "password": "ekram77"
}
headers = {'Content-Type': 'application/json'}

try:
    print("Attempting Login...")
    req = urllib.request.Request(url_token, data=json.dumps(data).encode(), headers=headers)
    
    with urllib.request.urlopen(req) as response:
        response_data = json.loads(response.read().decode())
        access_token = response_data['access']
        print("Login Success! Token obtained.")

    # 2. Fetch Profile (Me)
    url_me = "http://127.0.0.1:8000/api/users/me/"
    headers_me = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    print(f"Attempting to fetch {url_me}...")
    req_me = urllib.request.Request(url_me, headers=headers_me)
    with urllib.request.urlopen(req_me) as response_me:
        profile = json.loads(response_me.read().decode())
        print("Profile Fetch Success!")
        print(json.dumps(profile, indent=2))

except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
