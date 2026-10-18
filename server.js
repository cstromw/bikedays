import express from 'express';
const app = express()
const port = 3001

// Send API request to noaa.gov for weather data
async function fetchFromNoaa(endpoint, params) {
  // Request token at https://www.ncdc.noaa.gov/cdo-web/token
  const token = 'yourtokenhere';
  const URL = `https://www.ncei.noaa.gov/cdo-web/api/v2/${endpoint}`;
  const response = await fetch(`${URL}?${params}`, {
    method: 'GET',
    headers: {
      'token': token
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Returns a list of reliable weather stations (currently ~100 across the US) and their unique IDs
async function getWeatherStations(extended) {
  var params = new URLSearchParams({
    datasetid: 'GHCND',
    sortfield: 'datacoverage',
    sortorder: 'desc',
    limit: '1000',
    offset: '0'
  });
  params.append('datatypeid', 'TMIN');
  params.append('datatypeid', 'TMAX');
  params.append('datatypeid', 'PRCP');
  params.append('datatypeid', 'SNOW');

  // Removing GHCND requirement expands the list from ~100 to ~5000
  if(extended === 'true') {
    params.delete('datasetid');
  }

  var offset = 0;
  var coverage = 1;
  var outputJSON = [];
  do {
    const data = await fetchFromNoaa('stations', params);
    data.results.forEach((result) => {
      // Log name and ID if data is current
      // Many stations are historic data only
      if ((result.datacoverage === 1) && (result.maxdate.slice(0,4) === "2026")){
        outputJSON.push({name: result.name, id: result.id});
      }
    });

    // If out of stations, finish requesting
    if (data.results.length < 1000) {
      break;
    }

    // Set up for another chunk of records
    offset += 1000;
    params.set('offset', `${offset}`);
    
    // Request another chunk if the end of the list is still 100% data coverage
    coverage = data.results[data.results.length-1].datacoverage;
  } while (coverage === 1);

  console.log(`${outputJSON.length} stations found`);
  outputJSON.sort((a,b) => a.name.localeCompare(b.name));

  return outputJSON;
}

// Returns a list of the following data points, indexed by date:
// - Daily low temperature in degrees Farenheit, rounded to whole degree
// - Daily high temperature in degrees Farenheit, rounded to whole degree
// - Daily rain total in inches, rounded to hundredths of an inch
// - Daily snow total in inches, rounded to tenths of an inch
async function getWeatherData(station, year) {
  const locationParams = {
    datasetid: 'GHCND',
    stationid: station,
    startdate: `${year}-01-01`,
    enddate: `${year}-12-31`,
    limit: '1000'
  };

  // Temperature minimum and maximum datasets
  var tempParams = new URLSearchParams(locationParams);
  tempParams.append('datatypeid', 'TMIN');
  tempParams.append('datatypeid', 'TMAX');

  // Precipitation and snow datasets
  var prcpParams = new URLSearchParams(locationParams);
  prcpParams.append('datatypeid', 'PRCP');
  prcpParams.append('datatypeid', 'SNOW');

  // Split in two requests to fit under 1000 record limit
  const tempData = await fetchFromNoaa('data', tempParams);
  const prcpData = await fetchFromNoaa('data', prcpParams);

  var weatherData = {};
  // Reformat data into one date-indexed structure
  if (tempData != null) {
    tempData.results.forEach((result) => {
      var date = result.date.split("T")[0];
      weatherData[date] ??= {};
      // Temps given in tenths of a degree Celsius, convert to Farenheit
      weatherData[date][result.datatype] = Math.round(result.value * 9 / 50 + 32);
    });
  }
  if (prcpData != null) {
  prcpData.results.forEach((result) => {
      var date = result.date.split("T")[0];
      weatherData[date] ??= {};
      if (result.datatype === 'PRCP') {
        // Rain given in tenths of a millimeter, convert to inches to the nearest 100th
        weatherData[date][result.datatype] = Math.round((result.value / 254) * 100) / 100;
      } else {
        // Snow given in millimeters, convert to inches to the nearest 10th
        weatherData[date][result.datatype] = Math.round((result.value / 25.4) * 10) / 10
      }
    });
  }

  return weatherData;
}

var options = {
  index: "bikedays.html"
};

app.use('/', express.static('public', options));

app.get('/get-weather-data', async (req, res) => {
  var station = req.query['station'];
  var year = req.query['year'];
  var data = await getWeatherData(station, Number(year));
  res.send(data);
})

app.get('/get-weather-stations', async (req, res) => {
  var extended = req.query['extended'];
  var data = await getWeatherStations(extended);
  res.send(data);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


