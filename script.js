const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusMsg = document.getElementById("statusMsg");
const currentCard = document.getElementById("currentCard");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const windEl = document.getElementById("wind");
const conditionEl = document.getElementById("condition");
const forecastBody = document.getElementById("forecastBody");

// ============================================================
// TASK 1 — WEATHER CODE DESCRIPTION
// ============================================================

 
 function describeWeatherCode(code) {
    

     if (code==0) return "Clear Sky";
     if (1<= code >=3) return "Partly cloudy";
     if (45<= code >=48) return "Fog";
     if (51<= code >=57) return "Drizzle";
     if (61<= code >=67) return "Rain";
     if (71<= code >=77) return "Snow";
     if (80<= code >=82) return "Rain showers";
     if (95<= code >=99) return "Thunderstorm";
     else return "Unknown";
    
 }

// ============================================================
// TASK 2 — STATUS MESSAGE
// ============================================================

// TODO:
// Complete this function.
//
// The function should:
// 1. Display the supplied message inside the element
//    represented by statusMsg.
// 2. Add the "error" class when isError is true.
// 3. Remove the "error" class when isError is false.

        
function setStatus(message, isError = false) {
    statusMsg.textContent = message;
    if (isError) {
        statusMsg.classList.add("error");
    } else {
        statusMsg.classList.remove("error");
    }
}


// ============================================================
// API FUNCTION 1 — GEOCODING
// ============================================================


async function geocodeCity(city) {
const url =
`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

const res = await fetch(url);

if (!res.ok) {
throw new Error("Geocoding request failed");
}

const data = await res.json();

if (!data.results || data.results.length === 0) {
throw new Error("City not found — try another name.");
}

return data.results[0];
}

// ============================================================
// API FUNCTION 2 — WEATHER FORECAST
// ============================================================



async function fetchForecast(lat, lon) {
const url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
`&current_weather=true` +
`&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
`&timezone=auto`;

const res = await fetch(url);

if (!res.ok) {
throw new Error("Forecast request failed");
}

return res.json();
}

// ============================================================
// TASK 3 — DISPLAY CURRENT WEATHER
// ============================================================


function renderCurrentWeather(place, weatherData) {
    const current = weatherData.current_weather;
    
    cityNameEl.textContent = `${place.name}, ${place.country}`;
    tempEl.textContent = `${current.temperature} °C`;
    windEl.textContent = `${current.windspeed} km/h`;
    conditionEl.textContent = describeWeatherCode(current.weathercode);
    
    currentCard.classList.remove("hidden");
}

// ============================================================
// TASK 4 — CREATE THE FORECAST TABLE
// ============================================================


function renderForecastTable(daily) {
    forecastBody.innerHTML = "";
    
    for (let i = 0; i < daily.time.length; i++) {
        const row = document.createElement("tr");
        
        const date = daily.time[i];
        const condition = describeWeatherCode(daily.weathercode[i]);
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const precipitation = daily.precipitation_sum[i];
        
        // Stretch Goal: Highlight rainy days
        if (precipitation > 0) {
            row.classList.add("rainy");
        }
        
        row.innerHTML = `
            <td>${date}</td>
            <td>${condition}</td>
            <td>${maxTemp} °C</td>
            <td>${minTemp} °C</td>
            <td>${precipitation} mm</td>
        `;
        
        forecastBody.appendChild(row);
    }
}

// ============================================================
// TASK 5 — HANDLE SEARCH
// ============================================================


async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        setStatus("Please type a city name.", true);
        return;
    }
    
    currentCard.classList.add("hidden");
    forecastBody.innerHTML = "";
    setStatus("Loading…");
    
    try {
        const place = await geocodeCity(city);
        const weatherData = await fetchForecast(place.latitude, place.longitude);
        
        renderCurrentWeather(place, weatherData);
        renderForecastTable(weatherData.daily);
        
        setStatus("");
    } catch (error) {
        setStatus(error.message, true);
    }
}

// ============================================================
// TASK 6 — SEARCH BUTTON EVENT
// ============================================================

searchBtn.addEventListener("click", handleSearch);

// ============================================================
// TASK 7 — ENTER KEY SUPPORT
// ============================================================


cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleSearch();
    }
});

