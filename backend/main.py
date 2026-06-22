from pathlib import Path
import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenWeatherMap API Key from backend/.env
OPENWEATHER_API_KEY = os.getenv("OPEN_WEATHER_API_KEY")

@app.get("/")
def home():
    return {"message": "Weather API is running with OpenWeatherMap!"}

@app.get("/weather/{city}")
async def get_weather(city: str):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="Missing OPEN_WEATHER_API_KEY in backend/.env")

    # Step 1: Get city coordinates using OpenWeatherMap Geocoding API
    geocoding_url = "https://api.openweathermap.org/geo/1.0/direct"
    geocoding_params = {
        "q": city,
        "limit": 5,
        "appid": OPENWEATHER_API_KEY
    }
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        geo_response = await client.get(geocoding_url, params=geocoding_params)
    
    if geo_response.status_code != 200:
        raise HTTPException(status_code=500, detail="Geocoding service error")
    
    geo_data = geo_response.json()
    
    # Check if city found
    if not geo_data or len(geo_data) == 0:
        raise HTTPException(status_code=404, detail="City not found. Try a major city name.")
    
    result = geo_data[0]  # Get first result
    
    latitude = result["lat"]
    longitude = result["lon"]
    city_name = result["name"]
    country = result.get("country", "")
    
    # Step 2: Get weather data using OpenWeatherMap Weather API
    weather_url = "https://api.openweathermap.org/data/2.5/weather"
    weather_params = {
        "lat": latitude,
        "lon": longitude,
        "units": "metric",
        "appid": OPENWEATHER_API_KEY
    }
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        weather_response = await client.get(weather_url, params=weather_params)
    
    if weather_response.status_code != 200:
        raise HTTPException(status_code=500, detail="Weather service error")
    
    weather_data = weather_response.json()
    
    # Extract data from OpenWeatherMap response
    main = weather_data.get("main", {})
    weather = weather_data.get("weather", [{}])[0]
    wind = weather_data.get("wind", {})
    # Return icon code; frontend maps code to emoji to avoid text-encoding issues.
    icon_code = weather.get("icon", "01d")
    
    return {
        "city": city_name,
        "country": country,
        "temperature": round(main.get("temp", 0)),
        "feels_like": round(main.get("feels_like", 0)),
        "humidity": main.get("humidity", 0),
        "wind_speed": round(wind.get("speed", 0) * 3.6),  # Convert m/s to km/h
        "visibility": round(weather_data.get("visibility", 10000) / 1000),  # Convert to km
        "description": weather.get("main", "Unknown"),
        "icon": icon_code
    }
