/* eslint-disable prefer-destructuring */
// @ts-check

const api = (() => {
  const key = '2e64fad7f4f5faa25c97c2f877a4d7e2';

  const getLatLon = async (location) => {
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

  const getWeather = async (location) => {
    const latLon = await getLatLon(location);
    const urlLatLon = `https://api.openweathermap.org/data/2.5/weather?lat=${latLon.lat}&lon=${latLon.lon}&appid=${key}&units=metric`;
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

const weather = async (location) => {
  const data = await api.getWeather(location);

  const temperatureObj = (tempData) => {
    const celsiusToFahrenheit = (temp) => (temp * 9 / 5) + 32;

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
      const current = tempData.temp;
      const feel = tempData.feels_like;
      const min = tempData.temp_min;
      const max = tempData.temp_max;
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
    const speed = windData.speed;
    const deg = windData.deg;
    return {
      speed, deg,
    };
  };

  const summary = data.weather[0].main;
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;
  const temperature = temperatureObj(data.main);
  const pressure = data.main.pressure;
  const humidity = data.main.humidity;
  const wind = windObj(data.wind);
  const name = data.name;
  const country = data.sys.country;

  return {
    summary, description, icon, temperature, pressure, humidity, wind, name, country,
  };
};

async function main(location) {
  let weatherData = await weather('London');
  console.table(weatherData);
  weatherData = await weather('Museros');
  console.table(weatherData);
}
main();
