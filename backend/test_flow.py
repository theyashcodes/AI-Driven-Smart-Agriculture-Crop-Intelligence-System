import requests

BASE_URL = "http://localhost:8000/api"

print("1. Testing login with admin")
resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin"})
if resp.status_code == 200:
    token = resp.json()["access_token"]
    print("Admin login successful")
else:
    print("Admin login failed:", resp.text)
    token = None

print("\n2. Registering new user")
resp = requests.post(f"{BASE_URL}/auth/signup", json={"username": "testuser1", "email": "test1@test.com", "password": "password"})
user_id = None
if resp.status_code == 200:
    print("User registered", resp.json())
    user_id = resp.json()["id"]
else:
    print("User register failed or already exists:", resp.text)
    # let's login to get it or just pretend we have it
    
print("\n3. Testing login with new user (Should fail)")
resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "testuser1", "password": "password"})
print("Expected 403, got:", resp.status_code, resp.text)

if token and user_id:
    print("\n4. Approving new user")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.put(f"{BASE_URL}/auth/users/{user_id}/approve", headers=headers)
    print("Approve response:", resp.status_code, resp.text)
    
    print("\n5. Testing login with new user again (Should succeed)")
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "testuser1", "password": "password"})
    print("Expected 200, got:", resp.status_code, resp.text)
