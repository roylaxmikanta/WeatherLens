

// Calls your FastAPI backend — API key is hidden on server!
const BACKEND_URL = "http://127.0.0.1:8000";

const iconMap = {
  "01d": "☀️",
  "01n": "🌙",
  "02d": "⛅",
  "02n": "☁️",
  "03d": "☁️",
  "03n": "☁️",
  "04d": "☁️",
  "04n": "☁️",
  "09d": "🌧️",
  "09n": "🌧️",
  "10d": "🌦️",
  "10n": "🌧️",
  "11d": "⛈️",
  "11n": "⛈️",
  "13d": "❄️",
  "13n": "❄️",
  "50d": "🌫️",
  "50n": "🌫️",
};

document.getElementById("cityInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") getWeather();
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("backStatusText").textContent = "waiting...";
  document.getElementById("backStatusText").style.color = "#7eb3ff";
});

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();

  const weatherCard = document.getElementById("weatherCard");
  const errorMsg    = document.getElementById("errorMsg");
  const loader      = document.getElementById("loader");

  weatherCard.style.display = "none";
  errorMsg.style.display    = "none";
  loader.style.display      = "none";

  if (!city) return;

  document.getElementById("backStatusText").textContent = "loading...";
  document.getElementById("backStatusText").style.color = "#ffaa00";

  loader.style.display = "block";

  try {
    const response = await fetch(`${BACKEND_URL}/weather/${encodeURIComponent(city)}`);

    loader.style.display = "none";

    if (!response.ok) {
      errorMsg.style.display = "block";
      errorMsg.textContent   = "⚠️ City not found. Please try again.";
      return;
    }

    const data = await response.json();
    document.getElementById("backStatusText").textContent = "✅ connected";
    document.getElementById("backStatusText").style.color = "#00ff88";
    displayWeather(data);

  } catch (error) {
    loader.style.display   = "none";
    errorMsg.style.display = "block";
    errorMsg.textContent   = "⚠️ Cannot connect to server. Make sure backend is running!";
    document.getElementById("backStatusText").textContent = "❌ offline";
    document.getElementById("backStatusText").style.color = "#ff4444";
    console.error("Error:", error);
  }
}

function displayWeather(data) {
  document.getElementById("cityName").textContent    = `${data.city}, ${data.country}`;
  document.getElementById("country").textContent     = data.country;
  document.getElementById("temperature").textContent = `${data.temperature}°C`;
  document.getElementById("description").textContent = data.description;
  document.getElementById("humidity").textContent    = `${data.humidity}%`;
  document.getElementById("windSpeed").textContent   = `${data.wind_speed} km/h`;
  document.getElementById("visibility").textContent  = `${data.visibility} km`;
  document.getElementById("feelsLike").textContent   = `${data.feels_like}°C`;
  
  // Backend sends icon code (e.g. 01d); map to emoji in browser.
  document.getElementById("weatherEmoji").textContent = iconMap[data.icon] || "🌡️";

  document.getElementById("weatherCard").style.display = "block";
}