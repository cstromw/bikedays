import express from 'express';
const app = express()
const port = 3001

// Send API request to open meteo for data
async function fetchFromOpenMeteo(URL, params) {
  
  const response = await fetch(`${URL}?${params}`, {
    method: 'GET'
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HTTP error! Status: ${response.status}, Data: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data;
};

// Returns a list of 10 locations matching the search string
async function getLocations(name) {

  const URL = `https://geocoding-api.open-meteo.com/v1/search`;
  var params = new URLSearchParams({
    name: name,
    language: 'en'
  });

  const data = await fetchFromOpenMeteo(URL, params);

  if (!Object.hasOwn(data, 'results')) {
    return [];
  } else {
    const locationList = data.results.map(result => ({
      id: result.id,
      name: result.name,
      region: result.admin1,
      country: result.country,
      lat: result.latitude,
      long: result.longitude
    }));

    return locationList;
  }
}

// Returns a list of the following data points over the past decade, indexed by date:
// - Daily low temperature
// - Daily high temperature
// - Daily rain total
// - Daily snow total
// If imperial == true, converts from degrees Celsius/mm to degrees Fahrenheit/inch
async function getWeatherData(lat, long, imperial) {
  const endYear = new Date().getFullYear() - 1;
  const tempUnit = imperial ? 'fahrenheit' : 'celsius';
  const prcpUnit = imperial ? 'inch' : 'mm';

  const URL = `https://archive-api.open-meteo.com/v1/archive`;
  const params = new URLSearchParams({
    latitude: lat,
    longitude: long,
    start_date: `${endYear-9}-01-01`,
    end_date: `${endYear}-12-31`,
    daily: 'rain_sum,snowfall_sum,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    temperature_unit: tempUnit,
    precipitation_unit: prcpUnit
  });

  const data = await fetchFromOpenMeteo(URL, params);

  const rainPrecision = imperial ? 100 : 10;
  const snowPrecision = imperial ? 10 : 1;
  const weatherData = Object.fromEntries(
    data.daily.time.map((day, index) => [day, {
      high: Math.round(data.daily.temperature_2m_max[index]),
      low: Math.round(data.daily.temperature_2m_min[index]),
      rain: Math.round(rainPrecision*data.daily.rain_sum[index])/rainPrecision,
      snow: Math.round(snowPrecision*data.daily.snowfall_sum[index])/snowPrecision
    }])
  );

  return weatherData;
}

var options = {
  index: "bikedays.html"
};

app.use('/', express.static('public', options));

app.get('/get-weather-data', async (req, res) => {
  var lat = req.query['lat'];
  var long = req.query['long'];
  var imperial = (req.query['imperial'] === 'true') ? true : false;
  var data = await getWeatherData(lat, long, imperial);
  res.send(data);
})

app.get('/get-locations', async (req, res) => {
  var name = req.query['name'];
  var data = await getLocations(name);
  res.send(data);
})

app.listen(port, () => {
  console.log(`bikedays app listening on port ${port}`)
})
