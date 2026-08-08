import requests
import json

url = "http://localhost:54321/auth/v1/token?grant_type=password"
headers = {
    "apikey": "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
    "Content-Type": "application/json"
}
data = {
    "email": "admin@kapeuno.com",
    "password": "password"
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print(response.text)
    else:
        print("Login successful.")
        resp_data = response.json()
        print("Access Token length:", len(resp_data.get("access_token", "")))
except Exception as e:
    print("Request failed:", e)
