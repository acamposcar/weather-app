/* eslint-disable prefer-destructuring */
// @ts-check

const api = (() => {
  const key = '2e64fad7f4f5faa25c97c2f877a4d7e2';

  const getWeather = async (location) => {
    /*
    *  Get the weather data the selected location
    */
    const urlLatLon = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${key}&units=metric`;
    try {
      const response = await fetch(urlLatLon, { mode: 'cors' });
      const data = await response.json();
      return (data);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  return { getWeather };
})();

const weatherObj = (data) => {
  /*
  *  Object with all weather data
  */

  const temperatureObj = (tempData) => {
    const celsiusToFahrenheit = (temp) => Math.round((temp * 9 / 5) + 32);

    const fahrenheitObj = (tempData) => {
      const current = celsiusToFahrenheit(tempData.temp);
      const feel = celsiusToFahrenheit(tempData.feels_like);
      const min = celsiusToFahrenheit(tempData.temp_min);
      const max = celsiusToFahrenheit(tempData.temp_max);
      return {
        current, feel, max, min,
      };
    };
    const celsiusObj = (tempData) => {
      const current = Math.round(tempData.temp);
      const feel = Math.round(tempData.feels_like);
      const min = Math.round(tempData.temp_min);
      const max = Math.round(tempData.temp_max);
      return {
        current, feel, max, min,
      };
    };
    const celsius = celsiusObj(tempData);
    const fahrenheit = fahrenheitObj(tempData);
    return {
      celsius, fahrenheit,
    };
  };

  const windObj = (windData) => {
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
    const speed = Math.round(windData.speed * 3.6);
    const deg = windData.deg;
    const direction = degreeToDirection(deg);
    return {
      speed, deg, direction,
    };
  };

  const summary = data.weather[0].main;
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;
  const iconURL = `/svg/${icon}.svg`;
  const temperature = temperatureObj(data.main);
  const pressure = data.main.pressure;
  const humidity = data.main.humidity;
  const wind = windObj(data.wind);
  const name = data.name;
  const country = data.sys.country;

  return {
    summary, description, iconURL, temperature, pressure, humidity, wind, name, country,
  };
};

const unitIsCelsius = true;
function updateDOM(weatherData) {
  document.querySelector('#icon').src = weatherData.iconURL;
  document.querySelector('#description').textContent = weatherData.description;
  document.querySelector('#city').textContent = `${weatherData.name}, ${weatherData.country}`;
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
async function main(location) {
  const data = await api.getWeather(location);
  const weather = weatherObj(data);
  console.log(weather);
  updateDOM(weather);
}

const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchBar = document.querySelector('#search-bar');
  main(searchBar.value);
  searchBar.value = '';
});

main('Museros');
