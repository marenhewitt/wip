import openmeteo_requests
from ziptocoords import get_zipcode_data 
import pandas as pd
import requests_cache
from retry_requests import retry
from flask import Flask, request

def get_weather(zipcode):
	cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
	retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
	openmeteo = openmeteo_requests.Client(session = retry_session)
	
	url = "https://api.open-meteo.com/v1/forecast"
	coords = get_zipcode_data(zipcode)
	if not coords:
		return {"error": "INVALID ZIPCODE"}
	
	params = {
		"latitude": coords['lat'],
		"longitude": coords['lng'],
		"daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset", "precipitation_hours"],
		"hourly": ["temperature_2m", "apparent_temperature", "precipitation", "precipitation_probability", "cloud_cover", "uv_index"],
		"current": ["temperature_2m", "apparent_temperature", "relative_humidity_2m"],
		"timezone": "auto",
		"past_days": 0,
		"forecast_days": 1,
		"wind_speed_unit": "mph",
		"temperature_unit": "fahrenheit",
		"precipitation_unit": "inch",
	}

	responses = openmeteo.weather_api(url, params=params)
	response = responses[0]
	
#current
	current = response.Current()
	current_data = {
		"time": current.Time(),
        "temp": round(current.Variables(0).Value(), 1),
        "feels_like": round(current.Variables(1).Value(), 1),
        "humidity": current.Variables(2).Value()
	}

#hourly
	hourly = response.Hourly()
	hourly_data = {
        "times": [t.isoformat() for t in pd.date_range(
            start=pd.to_datetime(hourly.Time() + response.UtcOffsetSeconds(), unit="s", utc=True),
            periods=len(hourly.Variables(0).ValuesAsNumpy()),
            freq=pd.Timedelta(seconds=hourly.Interval())
        )],
        "temp": hourly.Variables(0).ValuesAsNumpy().tolist(),
        "apparent_temp": hourly.Variables(1).ValuesAsNumpy().tolist(),
        "precip_prob": hourly.Variables(3).ValuesAsNumpy().tolist()
    }

#daily
	daily = response.Daily()
	daily_data = {
        "dates": [d.isoformat() for d in pd.date_range(
            start=pd.to_datetime(daily.Time() + response.UtcOffsetSeconds(), unit="s", utc=True),
            periods=len(daily.Variables(0).ValuesAsNumpy()),
            freq=pd.Timedelta(seconds=daily.Interval())
        )],
        "weather_code": daily.Variables(0).ValuesAsNumpy().tolist(),
        "temp_max": daily.Variables(1).ValuesAsNumpy().tolist(),
        "temp_min": daily.Variables(2).ValuesAsNumpy().tolist()
    }

	return {
		"time": current_data["time"],
        "temp": current_data["temp"],
        "feels_like": current_data["feels_like"],
        "humidity": current_data["humidity"],
        "city_coords": f"{coords['lat']}, {coords['lng']}",
        "current": current_data,
        "hourly": hourly_data,
        "daily": daily_data
    }