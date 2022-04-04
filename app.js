/* eslint-disable prefer-destructuring */
// @ts-check

const unitIsCelsius = true;

const api = (() => {
  const key = '2e64fad7f4f5faa25c97c2f877a4d7e2';

  const getCoordinates = async (location) => {
    /*
    *  Returns latitude and longitude for the selected location
    */
    const urlLocation = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${key}`;
    try {
      const response = await fetch(urlLocation, { mode: 'cors' });
      const data = await response.json();
      const name = data[0].name;
      const lat = data[0].lat;
      const lon = data[0].lon;
      const country = data[0].country;
      return {
        lat, lon, country, name,
      };
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const getDailyForecast = async (location) => {
    /*
    *  Returns daily forecast for the selected location
    */
    const locationData = await getCoordinates(location);
    const urlLatLon = `https://api.openweathermap.org/data/2.5/onecall?lat=${locationData.lat}&lon=${locationData.lon}&exclude=minutely,hourly&appid=${key}&units=metric`;
    try {
      const response = await fetch(urlLatLon, { mode: 'cors' });
      const data = await response.json();
      return { data, locationData };
    } catch (error) {
      console.log('Error:', error);
    }
  };

  return { getDailyForecast };
})();

const weatherObj = (data, isCurrent) => {
  /*
  *  Object with all current weather data
  */

  const temperatureObj = (currentTemp, minTemp, maxTemp, feelTemp) => {
    const celsiusToFahrenheit = (temp) => Math.round((temp * 9 / 5) + 32);

    const fahrenheitObj = (currentTemp, minTemp, maxTemp, feelTemp) => {
      const current = celsiusToFahrenheit(currentTemp);
      const feel = celsiusToFahrenheit(feelTemp);
      const min = celsiusToFahrenheit(minTemp);
      const max = celsiusToFahrenheit(maxTemp);
      return {
        current, feel, max, min,
      };
    };
    const celsiusObj = (currentTemp, minTemp, maxTemp, feelTemp) => {
      const current = Math.round(currentTemp);
      const feel = Math.round(feelTemp);
      const min = Math.round(minTemp);
      const max = Math.round(maxTemp);

      return {
        current, feel, max, min,
      };
    };

    const celsius = celsiusObj(currentTemp, minTemp, maxTemp, feelTemp);
    const fahrenheit = fahrenheitObj(currentTemp, minTemp, maxTemp, feelTemp);

    return {
      celsius, fahrenheit,
    };
  };

  const windObj = (windSpeed, windDeg) => {
    // Convert speed from m/s to km/h and round result
    const speed = Math.round(windSpeed * 3.6);
    const deg = windDeg;
    return {
      speed, deg,
    };
  };

  const summary = data.weather[0].main;
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;
  const iconURL = `svg/${icon}.svg`;

  const pressure = data.pressure;
  const humidity = data.humidity;
  const wind = windObj(data.wind_speed, data.wind_deg);
  const probPrecipitation = data.pop;
  const rain = data.rain ? Math.floor(data.rain) : 0;

  let temperature;
  if (isCurrent) {
    temperature = temperatureObj(data.temp, undefined, undefined, data.feels_like);
  } else {
    temperature = temperatureObj(undefined, data.temp.min, data.temp.max, undefined);
  }

  return {
    summary, description, iconURL, temperature, pressure, humidity, wind, probPrecipitation, rain,
  };
};

function updateTime(timezoneOffset) {
  const now = new Date();
  const localTime = new Date();
  localTime.setTime(now.getTime() + timezoneOffset * 1000);
  const hours = `${localTime.getUTCHours()}`;
  // At least two digits for minutes
  const minutes = (localTime.getUTCMinutes() < 10) ? `0${localTime.getUTCMinutes()}` : `${localTime.getUTCMinutes()}`;
  document.querySelector('#time').textContent = `${hours}:${minutes}`;
}

function currentUpdateDOM(weatherData, location, country) {
  document.querySelector('#icon').src = weatherData.iconURL;
  document.querySelector('#description').textContent = weatherData.summary;
  document.querySelector('#city').textContent = `${location}, ${country}`;
  if (unitIsCelsius) {
    document.querySelector('#temp').textContent = `${weatherData.temperature.celsius.current} ºC`;
    document.querySelector('#feels').textContent = `Feels like ${weatherData.temperature.celsius.feel} ºC`;
  } else {
    document.querySelector('#temp').textContent = `${weatherData.temperature.fahrenheit.current} ºF`;
    document.querySelector('#feels').textContent = `${weatherData.temperature.fahrenheit.feel} ºF`;
  }
  document.querySelector('#humidity-value').textContent = `${weatherData.humidity} %`;

  document.querySelector('#wind-value').textContent = `${weatherData.wind.speed} km/h`;
  document.querySelector('#wind-direction').style.transform = `rotate(${weatherData.wind.deg}deg)`;

  document.querySelector('#pressure-value').textContent = `${weatherData.pressure} mbar`;
}

function forecastUpdateDOM(weatherData) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  weatherData.forEach((dayData, i) => {
    const dayElement = document.querySelector(`[data-index="${i}"]`);
    if (i === 0) {
      dayElement.querySelector('.forecast-day').textContent = 'Today';
    } else if (today + i <= 6) {
      dayElement.querySelector('.forecast-day').textContent = days[today + i];
    } else {
      dayElement.querySelector('.forecast-day').textContent = days[today - 7 + i];
    }
    dayElement.querySelector('.forecast-icon').src = dayData.iconURL;
    if (unitIsCelsius) {
      dayElement.querySelector('.forecast-temp-max').textContent = `${dayData.temperature.celsius.max} ºC`;
      dayElement.querySelector('.forecast-temp-min').textContent = `${dayData.temperature.celsius.min} ºC`;
    } else {
      dayElement.querySelector('.forecast-temp-max').textContent = `${dayData.temperature.fahrenheit.max} ºC`;
      dayElement.querySelector('.forecast-temp-min').textContent = `${dayData.temperature.fahrenheit.min} ºC`;
    }
    dayElement.querySelector('.forecast-wind-value').textContent = `${dayData.wind.speed} km/h`;
    dayElement.querySelector('.forecast-wind-direction').style.transform = `rotate(${dayData.wind.deg}deg)`;
    dayElement.querySelector('.forecast-precipitation-value').textContent = `${dayData.rain} mm`;
  });
}

async function update(location) {
  const weatherData = await api.getDailyForecast(location);
  const currentWeather = weatherObj(weatherData.data.current, true);
  const forecastWeather = [];
  weatherData.data.daily.forEach((day) => {
    forecastWeather.push(weatherObj(day, false));
  });
  const locationName = weatherData.locationData.name;
  const country = weatherData.locationData.country;
  const timezoneOffset = weatherData.data.timezone_offset;
  updateTime(timezoneOffset);
  currentUpdateDOM(currentWeather, locationName, country);
  forecastUpdateDOM(forecastWeather);
  setInterval(() => updateTime(timezoneOffset), 10000);
  // Display page after JS is loaded
  document.querySelector('.container').style.display = 'grid';
}

const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchBar = document.querySelector('#search-bar');
  update(searchBar.value);
  searchBar.value = '';
});

update('Museros');
