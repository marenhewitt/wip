import requests
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("ZIPCODE_API_KEY")

def get_zipcode_data(zipcode):
    url = f"https://apibarn.com/v1/zipcode/api/zip/{zipcode}"
    headers = {
        "x-api-key": api_key,
        "Accept": "application/json"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        coords = {"lat": data['lat'],
                  "lng": data['lng']}
        return coords
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None
    
#test = get_zipcode_data("12345")
#print(test)