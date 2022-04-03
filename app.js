/* eslint-disable prefer-destructuring */
// @ts-check

const unitIsCelsius = true;

const api = (() => {
  const key = '2e64fad7f4f5faa25c97c2f877a4d7e2';

  const getCoordinates = async (location) => {
    /*
    *  Returns latitude and longitude for the selected location
    */
    const urlLocation = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${key}`;
    try {
      const response = await fetch(urlLocation, { mode: 'cors' });
      const data = await response.json();
      const lat = data[0].lat;
      const lon = data[0].lon;
      const country = data[0].country;
      return { lat, lon, country };
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const getDailyForecast = async (location) => {
    /*
    *  Returns daily forecast for the selected location
    */
    const coordinates = await getCoordinates(location);
    const urlLatLon = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=${key}&units=metric`;
    try {
      const response = await fetch(urlLatLon, { mode: 'cors' });
      const data = await response.json();
      return (data);
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
    const degreeToDirection = (deg) => {
    /*
    *  Convert 0-360º to direction (N, S,...)
    */
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      // Split into the 8 directions
      const degrees = deg * 8 / 360;
      let index = Math.round(degrees);
      // Ensure it's within 0-7
      index = (index + 8) % 8;

      return directions[index];
    };
    // Convert speed from m/s to km/h and round result
    const speed = Math.round(windSpeed * 3.6);
    const deg = windDeg;
    const direction = degreeToDirection(deg);
    return {
      speed, deg, direction,
    };
  };

  const summary = data.weather[0].main;
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;
  const iconURL = `/svg/${icon}.svg`;
  let temperature;
  if (isCurrent) {
    temperature = temperatureObj(data.temp, undefined, undefined, data.feels_like);
  } else {
    temperature = temperatureObj(undefined, data.temp.min, data.temp.max, undefined);
  }
  const pressure = data.pressure;
  const humidity = data.humidity;
  const wind = windObj(data.wind_speed, data.wind_deg);

  return {
    summary, description, iconURL, temperature, pressure, humidity, wind,
  };
};

function currentUpdateDOM(weatherData) {
  document.querySelector('#icon').src = weatherData.iconURL;
  document.querySelector('#description').textContent = weatherData.description;
  // document.querySelector('#city').textContent = `${weatherData.name}, ${weatherData.country}`;
  if (unitIsCelsius) {
    document.querySelector('#temp').textContent = `${weatherData.temperature.celsius.current} ºC`;
    document.querySelector('#feels').textContent = `Feels like ${weatherData.temperature.celsius.feel} ºC`;
  } else {
    document.querySelector('#temp').textContent = `${weatherData.temperature.fahrenheit.current} ºF`;
    document.querySelector('#feels').textContent = `${weatherData.temperature.fahrenheit.feel} ºF`;
  }
  document.querySelector('#humidity-value').textContent = `${weatherData.humidity} %`;
  document.querySelector('#wind-value').textContent = `${weatherData.wind.speed} km/h ${weatherData.wind.direction}`;
  document.querySelector('#pressure-value').textContent = `${weatherData.pressure} mbar`;
}

function forecastUpdateDOM(weatherData) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  weatherData.forEach((dayData, i) => {
    const dayElement = document.querySelector(`[data-index="${i}"]`);
    if (i === 0) {
      dayElement.querySelector('.forecast-day').textContent = 'Today';
    } else {
      dayElement.querySelector('.forecast-day').textContent = days[today + i];
    }
    dayElement.querySelector('.forecast-icon').src = dayData.iconURL;
    if (unitIsCelsius) {
      dayElement.querySelector('.forecast-temp-max').textContent = `${dayData.temperature.celsius.max} ºC`;
      dayElement.querySelector('.forecast-temp-min').textContent = `${dayData.temperature.celsius.min} ºC`;
    } else {
      dayElement.querySelector('.forecast-temp-max').textContent = `${dayData.temperature.fahrenheit.max} ºC`;
      dayElement.querySelector('.forecast-temp-min').textContent = `${dayData.temperature.fahrenheit.min} ºC`;
    }
    dayElement.querySelector('.forecast-wind').textContent = `${dayData.wind.speed} km/h ${dayData.wind.direction}`;
  });
}

async function main(location) {
  const weatherData = await api.getDailyForecast(location);
  const currentWeather = weatherObj(weatherData.current, true);
  const forecastWeather = [];
  weatherData.daily.forEach((day) => {
    forecastWeather.push(weatherObj(day, false));
  });
  currentUpdateDOM(currentWeather);
  forecastUpdateDOM(forecastWeather);
}

const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchBar = document.querySelector('#search-bar');
  main(searchBar.value);
  searchBar.value = '';
});

main('Museros');
