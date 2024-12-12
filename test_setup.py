import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_registration():
    print("\nTesting Registration...")
    data = {
        "username": f"testuser_{int(time.time())}",
        "email": f"test_{int(time.time())}@example.com",
        "password": "Test@123456",
        "first_name": "ValidFirstName",
        "last_name": "ValidLastName"
    }
    
    print("Registration Data:")
    print(json.dumps(data, indent=2))
    print(f"Sending registration data: {json.dumps(data, indent=2)}")
    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print(f"Response Content: {response.content}")
    print(f"Raw Response Content: {response.raw}")
    return response.json()

def test_login(email, password):
    print("\nTesting Login...")
    data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()

def main():
    print("Starting API Tests...")
    print(f"Time: {datetime.now()}")
    print("-" * 50)
    
    # Test registration
    reg_response = test_registration()
    
    # Test login with the registered user
    if 'user' in reg_response:
        test_login(reg_response['user']['email'], "Test@123456")

if __name__ == "__main__":
    main()
