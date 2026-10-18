async function getLocations(name) {
  try {
    const response = await fetch(`http://localhost:3001/get-locations?name=${name}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}

async function getWeatherData(lat, long, imperial) {
  try {
    const params = new URLSearchParams({
      lat: lat,
      long: long,
      imperial: imperial
    });
    const response = await fetch(`http://localhost:3001/get-weather-data?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}

// Connect functionality of input sliders and displays
function setupSlider(sliderName, lowerBound, upperBound, step, limitValue, unit, precision) {
  var sliderInput = document.getElementById(`${sliderName}In`);
  var sliderOutput = document.getElementById(`${sliderName}Out`);

  sliderInput.min = lowerBound;
  sliderInput.max = upperBound;
  sliderInput.step = step;
  sliderInput.value = sliderValues[sliderName];
  sliderOutput.innerHTML = sliderValues[sliderName].toFixed(precision) + unit;
  
  // If current value is Inf or -Inf, replace with boundary value
  if (sliderValues[sliderName] < lowerBound) {
    sliderInput.value = lowerBound;
    sliderOutput.innerHTML = 'No limit';
  }
  if (sliderValues[sliderName] > upperBound) {
    sliderInput.value = upperBound;
    sliderOutput.innerHTML = 'No limit';
  }

  sliderInput.oninput = function () {
    sliderValues[sliderName] = Number(this.value);
    sliderOutput.innerHTML = sliderValues[sliderName].toFixed(precision) + unit;

    // Overwrite with "no limit" if limit value reached
    if ((limitValue < lowerBound) && (Number(this.value) === lowerBound)
      || (limitValue > upperBound) && (Number(this.value) === upperBound)) {
      sliderValues[sliderName] = limitValue;
      sliderOutput.innerHTML = 'No limit';
    }

    // Update calendar display
    updateRideability();
  }
}

function clearAverageSummary() {
  // Display annual overview
  document.getElementById("averageAnnualTotal").textContent = '-';
  document.getElementById("averageAnnualTotal0").textContent = '- easily bike-rideable';
  document.getElementById("averageAnnualTotal1").textContent = '- rideable with some prep';
  document.getElementById("averageAnnualTotal2").textContent = '- not for me';

  // Bar chart math
  document.getElementById("averageAnnualBar0").style.width = '0%';
  document.getElementById("averageAnnualBar1").style.width = '0%';
  document.getElementById("averageAnnualBar2").style.width = '0%';

  // Display monthly overviews
  for (let month=0; month<12; month++) {
    // Add colored display to overlay
    document.getElementById(`averageMonth${month}overlay0`).textContent = '- easily';
    document.getElementById(`averageMonth${month}overlay1`).textContent = '- with prep';
    document.getElementById(`averageMonth${month}overlay2`).textContent = '- not for me';

    // Bar chart math
    document.getElementById(`averageMonth${month}Bar0`).style.height = '0%';
    document.getElementById(`averageMonth${month}Bar1`).style.height = '0%';
    document.getElementById(`averageMonth${month}Bar2`).style.height = '0%';
  };
}

function clearAnnualSummary() {
  // Display annual overview
  document.getElementById("annualTotal").textContent = '-';
  document.getElementById("annualTotal0").textContent = '- easily bike-rideable';
  document.getElementById("annualTotal1").textContent = '- rideable with some prep';
  document.getElementById("annualTotal2").textContent = '- not for me';

  // Bar chart math
  document.getElementById("annualBar0").style.width = '0%';
  document.getElementById("annualBar1").style.width = '0%';
  document.getElementById("annualBar2").style.width = '0%';

  // Display monthly overviews
  for (let month=0; month<12; month++) {
    // Add colored display to overlay
    document.getElementById(`month${month}overlay0`).textContent = '- easily';
    document.getElementById(`month${month}overlay1`).textContent = '- with prep';
    document.getElementById(`month${month}overlay2`).textContent = '- not for me';

    // Bar chart math
    document.getElementById(`month${month}Bar0`).style.height = '0%';
    document.getElementById(`month${month}Bar1`).style.height = '0%';
    document.getElementById(`month${month}Bar2`).style.height = '0%';
  };
}

function changeYear(year) {
  var yearLabel = document.getElementById('year');
  yearLabel.textContent = year;

  var calendar = document.getElementById('calendar');
  // Clear current year if present
  calendar.innerHTML = '';

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // Generate a calendar of the given year
  months.forEach((monthName, month) => {
    const monthDiv = document.createElement('div');
    monthDiv.setAttribute('class', 'month');
    monthDiv.innerHTML = `
        <h3 style='text-align: center;'>${monthName}</h3>
        <div class="weekdays">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
        </div>`;

    var dayGrid = document.createElement('div');
    dayGrid.setAttribute('class', 'daygrid');
    monthDiv.append(dayGrid);

    // Calculate weekday offset at start of month
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    for (let i = 0; i < startWeekday; i++) {
      // Insert empty days at start of month
      const newDiv = document.createElement('div');
      newDiv.setAttribute('class', 'empty');
      dayGrid.append(newDiv);
    }

    // Fill grid with valid days
    for (let day = 1; day <= 31; day++) {
      if (new Date(year, month, day).getDate() === day) {
        var wrapperDiv = document.createElement('div');
        wrapperDiv.setAttribute('class', 'wrapper');
        dayGrid.append(wrapperDiv);

        // Create unique ID with ISO formatted date
        var formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        var dayDiv = document.createElement('div');
        dayDiv.setAttribute('id', formattedDate);
        dayDiv.setAttribute('class', 'day');
        dayDiv.textContent = day;
        wrapperDiv.append(dayDiv);

        var overlayDiv = document.createElement('div');
        overlayDiv.setAttribute('id', `${formattedDate}overlay`);
        overlayDiv.setAttribute('class', 'overlay');
        overlayDiv.innerHTML = `<div id='${formattedDate}overlayLow'></div>
                <div id='${formattedDate}overlayHigh'></div>
                <div id='${formattedDate}overlayRain'></div>
                <div id='${formattedDate}overlaySnow'></div>`;
        wrapperDiv.append(overlayDiv);
      }
    }

    //Add month to calendar
    calendar.append(monthDiv);

    // Connect hover action of each day to displaying overlay
    Array.from(document.getElementsByClassName('day')).forEach((dayBox) => {
      dayBox.addEventListener('mouseenter', () => {
        document.getElementById(`${dayBox.id}overlay`).classList.add('visible');
      });
      dayBox.addEventListener('mouseleave', () => {
        document.getElementById(`${dayBox.id}overlay`).classList.remove('visible');
      });
    });
  });

  // Clear year summary
  clearAnnualSummary();

  updateRideability();
}

function updateAverages() {
  // Clear totals
  for (let i=0; i<3; i++) {
    averageAnnualTotals[currentLocation.id][i] = 0;
  }
  for (let i=0; i<12; i++) {
    for (let j=0; j<3; j++) {
      averageMonthlyTotals[currentLocation.id][i][j] = 0;
    }
  }

  // Accumulate over each year
  var annualYearCount = 0;
  Object.values(annualTotals[currentLocation.id]).forEach((totals) => {
    for (let i=0; i<3; i++) {
      averageAnnualTotals[currentLocation.id][i] += totals[i];
    }
    annualYearCount += 1;
  });

  var monthlyYearCount = 0;
  Object.values(monthlyTotals[currentLocation.id]).forEach((totals) => {
    for (let i=0; i<12; i++) {
      for (let j=0; j<3; j++) {
        averageMonthlyTotals[currentLocation.id][i][j] += totals[i][j];
      }
    }
    monthlyYearCount += 1;
  });

  // Divide by number of years
  for (let i=0; i<3; i++) {
    averageAnnualTotals[currentLocation.id][i] = averageAnnualTotals[currentLocation.id][i]/annualYearCount;
  }
  for (let i=0; i<12; i++) {
    for (let j=0; j<3; j++) {
      averageMonthlyTotals[currentLocation.id][i][j] = averageMonthlyTotals[currentLocation.id][i][j]/monthlyYearCount;
    }
  }

  // Display annual overview
  document.getElementById("averageAnnualTotal").textContent = Math.round(averageAnnualTotals[currentLocation.id][0]) + Math.round(averageAnnualTotals[currentLocation.id][1]);
  document.getElementById("averageAnnualTotal0").textContent = `${Math.round(averageAnnualTotals[currentLocation.id][0])} easily bike-rideable`;
  document.getElementById("averageAnnualTotal1").textContent = `${Math.round(averageAnnualTotals[currentLocation.id][1])} rideable with some prep`;
  document.getElementById("averageAnnualTotal2").textContent = `${Math.round(averageAnnualTotals[currentLocation.id][2])} not for me`;

  // Bar chart math
  var sum = averageAnnualTotals[currentLocation.id][0] + averageAnnualTotals[currentLocation.id][1] + averageAnnualTotals[currentLocation.id][2];
  if (sum === 0) {
    // Avoid divide by 0
    sum = 1;
  }
  document.getElementById("averageAnnualBar0").style.width = `${100 * averageAnnualTotals[currentLocation.id][0] / sum}%`;
  document.getElementById("averageAnnualBar1").style.width = `${100 * averageAnnualTotals[currentLocation.id][1] / sum}%`;
  document.getElementById("averageAnnualBar2").style.width = `${100 * averageAnnualTotals[currentLocation.id][2] / sum}%`;

  // Display monthly overviews
  averageMonthlyTotals[currentLocation.id].forEach((monthlyTotal, index) => {
    // Add colored display to overlay
    document.getElementById(`averageMonth${index}overlay0`).textContent = `${Math.round(monthlyTotal[0])} easily`;
    document.getElementById(`averageMonth${index}overlay1`).textContent = `${Math.round(monthlyTotal[1])} with prep`;
    document.getElementById(`averageMonth${index}overlay2`).textContent = `${Math.round(monthlyTotal[2])} not for me`;

    // Bar chart math
    sum = monthlyTotal[0] + monthlyTotal[1] + monthlyTotal[2];
    if (sum === 0) {
      // Avoid divide by 0
      sum = 1;
    }
    document.getElementById(`averageMonth${index}Bar0`).style.height = `${100 * monthlyTotal[0] / sum}%`;
    document.getElementById(`averageMonth${index}Bar1`).style.height = `${100 * monthlyTotal[1] / sum}%`;
    document.getElementById(`averageMonth${index}Bar2`).style.height = `${100 * monthlyTotal[2] / sum}%`;
  });
}

function updateRideability() {
  // Don't update data there is no data
  if ((!Object.hasOwn(currentLocation, 'id')) || (weatherDataCache[units][currentLocation.id] == null)) {
    return;
  }

  // Clear totals
  for (let yearIdx=startYear; yearIdx<=endYear; yearIdx++) {
    if (!Object.hasOwn(annualTotals[currentLocation.id], yearIdx)) {
      annualTotals[currentLocation.id][yearIdx] = Array(3).fill(0);
    } else {
      for (let i=0; i<3; i++) {
        annualTotals[currentLocation.id][yearIdx][i] = 0;
      }
    }
    if (!Object.hasOwn(monthlyTotals[currentLocation.id], yearIdx)) {
      monthlyTotals[currentLocation.id][yearIdx] = Array.from({ length: 12 }, () => Array(3).fill(0));
    } else {
      for (let i=0; i<12; i++) {
        for (let j=0; j<3; j++) {
          monthlyTotals[currentLocation.id][yearIdx][i][j] = 0;
        }
      }
    }
  }

  Object.keys(weatherDataCache[units][currentLocation.id]).forEach((day) => {
    const yearOfDate = Number(day.slice(0,4));
    // Track comfort level per parameter, assume green to start
    // 0 = Green
    // 1 = Yellow
    // 2 = Red
    var low = 0;
    var high = 0;
    var rain = 0;
    var snow = 0;

    if (weatherDataCache[units][currentLocation.id][day].low < sliderValues.minAbsTemp) {
      low = 2;
    } else if (weatherDataCache[units][currentLocation.id][day].low < sliderValues.minEasyTemp) {
      low = 1;
    }

    if (weatherDataCache[units][currentLocation.id][day].high > sliderValues.maxTemp) {
      high = 2;
    }

    if (weatherDataCache[units][currentLocation.id][day].rain > sliderValues.maxRain) {
      rain = 1;
    }

    if (weatherDataCache[units][currentLocation.id][day].snow > sliderValues.maxSnow) {
      snow = 2;
    }

    if (yearOfDate === year) {
      // Add colored display to overlay
      if (units === 'imperial') {
        document.getElementById(`${day}overlayLow`).textContent = `A.M.: ${weatherDataCache[units][currentLocation.id][day].low}°F`;
        document.getElementById(`${day}overlayHigh`).textContent = `P.M.: ${weatherDataCache[units][currentLocation.id][day].high}°F`;
        document.getElementById(`${day}overlayRain`).textContent = `Rain: ${weatherDataCache[units][currentLocation.id][day].rain} in`;
        document.getElementById(`${day}overlaySnow`).textContent = `Snow: ${weatherDataCache[units][currentLocation.id][day].snow} in`;
      } else {
        document.getElementById(`${day}overlayLow`).textContent = `A.M.: ${weatherDataCache[units][currentLocation.id][day].low}°C`;
        document.getElementById(`${day}overlayHigh`).textContent = `P.M.: ${weatherDataCache[units][currentLocation.id][day].high}°C`;
        document.getElementById(`${day}overlayRain`).textContent = `Rain: ${weatherDataCache[units][currentLocation.id][day].rain} mm`;
        document.getElementById(`${day}overlaySnow`).textContent = `Snow: ${weatherDataCache[units][currentLocation.id][day].snow} mm`;
      }
      document.getElementById(`${day}overlayLow`).style.backgroundColor = color[low];
      document.getElementById(`${day}overlayHigh`).style.backgroundColor = color[high];
      document.getElementById(`${day}overlayRain`).style.backgroundColor = color[rain];
      document.getElementById(`${day}overlaySnow`).style.backgroundColor = color[snow];
    }
      // Color day itself by worst of the 4
      var label = Math.max(low, high, rain, snow);

    if (yearOfDate === year) {
      document.getElementById(day).style.backgroundColor = color[label];
    }

    // Log totals
    annualTotals[currentLocation.id][yearOfDate][label] += 1;
    monthlyTotals[currentLocation.id][yearOfDate][Number(day.slice(5, 7)) - 1][label] += 1;
  });

  // Display annual overview
  document.getElementById("annualTotal").textContent = annualTotals[currentLocation.id][year][0] + annualTotals[currentLocation.id][year][1];
  document.getElementById("annualTotal0").textContent = `${annualTotals[currentLocation.id][year][0]} easily bike-rideable`;
  document.getElementById("annualTotal1").textContent = `${annualTotals[currentLocation.id][year][1]} rideable with some prep`;
  document.getElementById("annualTotal2").textContent = `${annualTotals[currentLocation.id][year][2]} not for me`;

  // Bar chart math
  var sum = annualTotals[currentLocation.id][year][0] + annualTotals[currentLocation.id][year][1] + annualTotals[currentLocation.id][year][2];
  if (sum === 0) {
    // Avoid divide by 0
    sum = 1;
  }
  document.getElementById("annualBar0").style.width = `${100 * annualTotals[currentLocation.id][year][0] / sum}%`;
  document.getElementById("annualBar1").style.width = `${100 * annualTotals[currentLocation.id][year][1] / sum}%`;
  document.getElementById("annualBar2").style.width = `${100 * annualTotals[currentLocation.id][year][2] / sum}%`;

  // Display monthly overviews
  monthlyTotals[currentLocation.id][year].forEach((monthlyTotal, index) => {
    // Add colored display to overlay
    document.getElementById(`month${index}overlay0`).textContent = `${monthlyTotal[0]} easily`;
    document.getElementById(`month${index}overlay1`).textContent = `${monthlyTotal[1]} with prep`;
    document.getElementById(`month${index}overlay2`).textContent = `${monthlyTotal[2]} not for me`;

    // Bar chart math
    sum = monthlyTotal[0] + monthlyTotal[1] + monthlyTotal[2];
    if (sum === 0) {
      // Avoid divide by 0
      sum = 1;
    }
    document.getElementById(`month${index}Bar0`).style.height = `${100 * monthlyTotal[0] / sum}%`;
    document.getElementById(`month${index}Bar1`).style.height = `${100 * monthlyTotal[1] / sum}%`;
    document.getElementById(`month${index}Bar2`).style.height = `${100 * monthlyTotal[2] / sum}%`;
  });

  updateAverages();
}

async function fetchData(lat, long) {
  if (weatherDataCache[units][currentLocation.id] == null) {
    // Only request from server if data is not cached
    weatherDataCache[units][currentLocation.id] = await getWeatherData(lat, long, (units === 'imperial' ? true : false));

    // Adjust low temps to "morning" temps
    Object.keys(weatherDataCache[units][currentLocation.id]).forEach((date) => {
      var low = weatherDataCache[units][currentLocation.id][date]['low'];
      var high = weatherDataCache[units][currentLocation.id][date]['high'];
      if ((low != null) && (high != null)) {
        weatherDataCache[units][currentLocation.id][date]['low'] = Math.round(low + ((high-low)/4));
      }
    });

    updateRideability();
  }
}

async function updateLocation() {
  if (Object.hasOwn(currentLocation, 'id')) {
    document.getElementById("averageAnnualTotalLabel").textContent = `average rideable days a year in ${currentLocation.name}, ${currentLocation.region}, ${currentLocation.country}`;
    if (!Object.hasOwn(weatherDataCache[units], currentLocation.id)) {
      // No data cached, initialize totals and fetch data
      averageAnnualTotals[currentLocation.id] = Array(3).fill(0);
      averageMonthlyTotals[currentLocation.id] = Array.from({ length: 12 }, () => Array(3).fill(0));
      annualTotals[currentLocation.id] = {};
      monthlyTotals[currentLocation.id] = {};

      fetchData(currentLocation.lat, currentLocation.long);
    } else {
      // Data cached, display it
      updateRideability();
    }
  }
  // No matter what, refresh year view
  changeYear(year);
}

async function showLocations(name) {
  var locationList = await getLocations(name);
  var suggestions = document.getElementById('suggestions');
  suggestions.innerHTML = ''; // Clear existing list
  if (locationList.length > 0) {
    locationList.forEach((locationOption) => {
      var listItem = document.createElement('li');
      listItem.textContent = `${locationOption.name}, ${locationOption.region}, ${locationOption.country} (${locationOption.lat}, ${locationOption.long})`;
      listItem.addEventListener('click', () => {
        currentLocation = { ...locationOption };
        updateLocation();
        suggestions.style.display = 'none';
      });

      suggestions.appendChild(listItem);
    });
    suggestions.style.display = 'block';
  }
}

function changeUnits() {
  if (units === 'imperial') {
    setupSlider('minEasyTemp', -4, 68, 1, -Infinity, '°F', 0);
    setupSlider('minAbsTemp', -31, 41, 1, -Infinity, '°F', 0);
    setupSlider('maxTemp', 68, 122, 1, Infinity, '°F', 0);
    setupSlider('maxRain', 0, 1, 0.05, Infinity, ' in', 2);
    setupSlider('maxSnow', 0, 12, 0.2, Infinity, ' in', 1);
  } else {
    setupSlider('minEasyTemp', -20, 20, 1, -Infinity, '°C', 0);
    setupSlider('minAbsTemp', -35, 5, 1, -Infinity, '°C', 0);
    setupSlider('maxTemp', 20, 50, 1, Infinity, '°C', 0);
    setupSlider('maxRain', 0, 25, 1, Infinity, ' mm', 0);
    setupSlider('maxSnow', 0, 305, 5, Infinity, ' mm', 0);
  }
  // Refresh all data on page to use new units
  updateLocation();
}

const color = ['DarkGreen', 'DarkGoldenRod', 'DarkRed'];
var sliderValues = { // Current values of each input slider
  minEasyTemp: 0,  // Default   0 degrees C / 32 degrees F
  minAbsTemp: -15, // Default -15 degrees C /  5 degrees F
  maxTemp: 30,     // Default  30 degrees C / 86 degrees F
  maxRain: 5,      // Default  5 mm / 0.20 in
  maxSnow: 50      // Default 50 mm /  2.0 in
}; 
var units = 'metric';

// Save data from server to avoid excess requests. Cache for each unit type to avoid rounding errors
var weatherDataCache = {metric: {}, imperial: {}}; 

var annualTotals = {}; // Sum of how many days are Green, Yellow, and Red respectively
var monthlyTotals = {}; // Sums broken down by month
var averageAnnualTotals = {}; // Average of annualTotals across all years
var averageMonthlyTotals = {}; // Average of monthlyTotals across all years
var currentLocation = {};
const startYear = new Date().getFullYear() - 10;
const endYear = new Date().getFullYear() - 1;
var year = new Date().getFullYear() - 1; // Current selected year

function init() {
  // Initialize functionality
  changeUnits();

  // Metric radio button on click
  document.getElementById("metric").addEventListener('change', (event) => {
    if (event.target.checked) {
      units = 'metric';
      sliderValues.minEasyTemp = Math.round((sliderValues.minEasyTemp-32)*5/9);
      sliderValues.minAbsTemp = Math.round((sliderValues.minAbsTemp-32)*5/9);
      sliderValues.maxTemp = Math.round((sliderValues.maxTemp-32)*5/9);
      sliderValues.maxRain = Math.round(sliderValues.maxRain*25.4);
      sliderValues.maxSnow = Math.round(sliderValues.maxSnow*25.4/5)*5;
      changeUnits();
    }
  });

  // Imperial radio button on click
  document.getElementById("imperial").addEventListener('change', (event) => {
    if (event.target.checked) {
      units = 'imperial';
      sliderValues.minEasyTemp = Math.round(sliderValues.minEasyTemp*9/5 + 32);
      sliderValues.minAbsTemp = Math.round(sliderValues.minAbsTemp*9/5 + 32);
      sliderValues.maxTemp = Math.round(sliderValues.maxTemp*9/5 + 32);
      sliderValues.maxRain = Math.round(20*sliderValues.maxRain/25.4)/20;
      sliderValues.maxSnow = Math.round(5*sliderValues.maxSnow/25.4)/5;
      changeUnits();
    }
  });

  // Back a year button on click
  document.getElementById("yearDec").onclick = function () {
    if (year > new Date().getFullYear() - 10) {
      year -= 1;
      changeYear(year);
    }
  }

  // Forward a year button on click
  document.getElementById("yearInc").onclick = function () {
    if (year < new Date().getFullYear() - 1) {
      year += 1;
      changeYear(year);
    }
  }

  
  // Location field on input
  let typingTimer;

  document.getElementById('search').addEventListener('input', (event) => {
    clearTimeout(typingTimer);

    var suggestions = document.getElementById('suggestions');
    if (event.target.value.length === 0) {
      suggestions.style.display = 'none';
    } else {
      // Start a new 1-second countdown
      typingTimer = setTimeout(() => {
        showLocations(event.target.value);
      }, 500);
    }
  });

  // Bar charts on hover
  for (let i=0; i<12; i++) {
    var averageMonthContainer = document.getElementById(`averageMonth${i}container`);
    averageMonthContainer.addEventListener('mouseenter', () => {
      document.getElementById(`averageMonth${i}overlay`).classList.add('visible');
    });
    averageMonthContainer.addEventListener('mouseleave', () => {
      document.getElementById(`averageMonth${i}overlay`).classList.remove('visible');
    });

    var monthContainer = document.getElementById(`month${i}container`);
    monthContainer.addEventListener('mouseenter', () => {
      document.getElementById(`month${i}overlay`).classList.add('visible');
    });
    monthContainer.addEventListener('mouseleave', () => {
      document.getElementById(`month${i}overlay`).classList.remove('visible');
    });
  };
}

init();
