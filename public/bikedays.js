async function getWeatherStations(extended) {
  try {
    const response = await fetch(`http://localhost:3001/get-weather-stations?extended=${extended}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}

async function getWeatherData(station, year) {
  try {
    const response = await fetch(`http://localhost:3001/get-weather-data?station=${station}&year=${year}`);
    
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
function setupSlider(sliderName, lowerBound, upperBound, defautValue, limitValue, unit, precision) {
  var sliderInput = document.getElementById(`${sliderName}In`);
  var sliderOutput = document.getElementById(`${sliderName}Out`);

  sliderInput.min = lowerBound;
  sliderInput.max = upperBound;
  sliderInput.value = defautValue;
  sliderValues[sliderName] = defautValue;

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
    updateRideability('all');
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

  updateRideability(year);
}

function updateAverages() {
  // Clear totals
  for (let i=0; i<3; i++) {
    averageAnnualTotals[station][i] = 0;
  }
  for (let i=0; i<12; i++) {
    for (let j=0; j<3; j++) {
      averageMonthlyTotals[station][i][j] = 0;
    }
  }

  // Accumulate over each year
  var annualYearCount = 0;
  Object.values(annualTotals[station]).forEach((totals) => {
    for (let i=0; i<3; i++) {
      averageAnnualTotals[station][i] += totals[i];
    }
    annualYearCount += 1;
  });

  var monthlyYearCount = 0;
  Object.values(monthlyTotals[station]).forEach((totals) => {
    for (let i=0; i<12; i++) {
      for (let j=0; j<3; j++) {
        averageMonthlyTotals[station][i][j] += totals[i][j];
      }
    }
    monthlyYearCount += 1;
  });

  // Divide by number of years
  for (let i=0; i<3; i++) {
    averageAnnualTotals[station][i] = averageAnnualTotals[station][i]/annualYearCount;
  }
  for (let i=0; i<12; i++) {
    for (let j=0; j<3; j++) {
      averageMonthlyTotals[station][i][j] = averageMonthlyTotals[station][i][j]/monthlyYearCount;
    }
  }

  // Display annual overview
  document.getElementById("averageAnnualTotal").textContent = Math.round(averageAnnualTotals[station][0]) + Math.round(averageAnnualTotals[station][1]);
  document.getElementById("averageAnnualTotal0").textContent = `${Math.round(averageAnnualTotals[station][0])} easily bike-rideable`;
  document.getElementById("averageAnnualTotal1").textContent = `${Math.round(averageAnnualTotals[station][1])} rideable with some prep`;
  document.getElementById("averageAnnualTotal2").textContent = `${Math.round(averageAnnualTotals[station][2])} not for me`;

  // Bar chart math
  var sum = averageAnnualTotals[station][0] + averageAnnualTotals[station][1] + averageAnnualTotals[station][2];
  if (sum === 0) {
    // Avoid divide by 0
    sum = 1;
  }
  document.getElementById("averageAnnualBar0").style.width = `${100 * averageAnnualTotals[station][0] / sum}%`;
  document.getElementById("averageAnnualBar1").style.width = `${100 * averageAnnualTotals[station][1] / sum}%`;
  document.getElementById("averageAnnualBar2").style.width = `${100 * averageAnnualTotals[station][2] / sum}%`;

  // Display monthly overviews
  averageMonthlyTotals[station].forEach((monthlyTotal, index) => {
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

function updateRideability(yearToUpdate) {
  // Recurse over all years if requested
  if (yearToUpdate === 'all') {
    if (weatherDataCache[station] != null) {
      Object.keys(weatherDataCache[station]).forEach((key) => {
        updateRideability(Number(key));
      });
    }
    return;
  }

  // Don't update data there is no data
  if ((weatherDataCache[station] == null) || (!Object.hasOwn(weatherDataCache[station], yearToUpdate))) {
    return;
  }

  // Clear totals
  if (!Object.hasOwn(annualTotals[station], yearToUpdate)) {
    annualTotals[station][yearToUpdate] = Array(3).fill(0);
  } else {
    for (let i=0; i<3; i++) {
      annualTotals[station][yearToUpdate][i] = 0;
    }
  }
  if (!Object.hasOwn(monthlyTotals[station], yearToUpdate)) {
    monthlyTotals[station][yearToUpdate] = Array.from({ length: 12 }, () => Array(3).fill(0));
  } else {
    for (let i=0; i<12; i++) {
      for (let j=0; j<3; j++) {
        monthlyTotals[station][yearToUpdate][i][j] = 0;
      }
    }
  }

  Object.keys(weatherDataCache[station][yearToUpdate]).forEach((day) => {
    // Track comfort level per parameter, assume green to start
    // 0 = Green
    // 1 = Yellow
    // 2 = Red
    var low = 0;
    var high = 0;
    var rain = 0;
    var snow = 0;

    if (weatherDataCache[station][yearToUpdate][day].TMIN < sliderValues.minAbsTemp) {
      low = 2;
    } else if (weatherDataCache[station][yearToUpdate][day].TMIN < sliderValues.minEasyTemp) {
      low = 1;
    }

    if (weatherDataCache[station][yearToUpdate][day].TMAX > sliderValues.maxTemp) {
      high = 2;
    }

    if (weatherDataCache[station][yearToUpdate][day].PRCP > sliderValues.maxRain) {
      rain = 1;
    }

    if (weatherDataCache[station][yearToUpdate][day].SNOW > sliderValues.maxSnow) {
      snow = 2;
    }

    if (yearToUpdate === year) {
      // Add colored display to overlay
      document.getElementById(`${day}overlayLow`).textContent = `A.M.: ${weatherDataCache[station][yearToUpdate][day].TMIN}°F`;
      document.getElementById(`${day}overlayLow`).style.backgroundColor = color[low];
      document.getElementById(`${day}overlayHigh`).textContent = `P.M.: ${weatherDataCache[station][yearToUpdate][day].TMAX}°F`;
      document.getElementById(`${day}overlayHigh`).style.backgroundColor = color[high];
      document.getElementById(`${day}overlayRain`).textContent = `Rain: ${weatherDataCache[station][yearToUpdate][day].PRCP} in`;
      document.getElementById(`${day}overlayRain`).style.backgroundColor = color[rain];
      document.getElementById(`${day}overlaySnow`).textContent = `Snow: ${weatherDataCache[station][yearToUpdate][day].SNOW} in`;
      document.getElementById(`${day}overlaySnow`).style.backgroundColor = color[snow];
    }
      // Color day itself by worst of the 4
      var label = Math.max(low, high, rain, snow);

    if (yearToUpdate === year) {
      document.getElementById(day).style.backgroundColor = color[label];
    }

    // Log totals
    annualTotals[station][yearToUpdate][label] += 1;
    monthlyTotals[station][yearToUpdate][Number(day.slice(5, 7)) - 1][label] += 1;
  });

  if (yearToUpdate === year) {
    // Display annual overview
    document.getElementById("annualTotal").textContent = annualTotals[station][yearToUpdate][0] + annualTotals[station][yearToUpdate][1];
    document.getElementById("annualTotal0").textContent = `${annualTotals[station][yearToUpdate][0]} easily bike-rideable`;
    document.getElementById("annualTotal1").textContent = `${annualTotals[station][yearToUpdate][1]} rideable with some prep`;
    document.getElementById("annualTotal2").textContent = `${annualTotals[station][yearToUpdate][2]} not for me`;

    // Bar chart math
    var sum = annualTotals[station][yearToUpdate][0] + annualTotals[station][yearToUpdate][1] + annualTotals[station][yearToUpdate][2];
    if (sum === 0) {
      // Avoid divide by 0
      sum = 1;
    }
    document.getElementById("annualBar0").style.width = `${100 * annualTotals[station][yearToUpdate][0] / sum}%`;
    document.getElementById("annualBar1").style.width = `${100 * annualTotals[station][yearToUpdate][1] / sum}%`;
    document.getElementById("annualBar2").style.width = `${100 * annualTotals[station][yearToUpdate][2] / sum}%`;

    // Display monthly overviews
    monthlyTotals[station][yearToUpdate].forEach((monthlyTotal, index) => {
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
  }

  updateAverages();
}

const color = ['DarkGreen', 'DarkGoldenRod', 'DarkRed'];
var sliderValues = {}; // Current values of each input slider
var weatherDataCache = {}; // Save data from NOAA to avoid excess requests
var annualTotals = {}; // Sum of how many days are Green, Yellow, and Red respectively
var monthlyTotals = {}; // Sums broken down by month
var averageAnnualTotals = {}; // Average of annualTotals across all years
var averageMonthlyTotals = {}; // Average of monthlyTotals across all years
var station = ''; // Current selected location ID
var year = new Date().getFullYear() - 1; // Current selected year

function init() {
  // Initialize functionality
  setupSlider('minEasyTemp', 0, 70, 32, -Infinity, '°F', 0);
  setupSlider('minAbsTemp', -32, 38, 0, -Infinity, '°F', 0);
  setupSlider('maxTemp', 70, 120, 90, Infinity, '°F', 0);
  setupSlider('maxRain', 0, 1, 0.2, Infinity, ' in', 2);
  setupSlider('maxSnow', 0, 12, 2, Infinity, ' in', 1);
  clearAverageSummary();
  changeYear(year);

  document.getElementById("yearDec").onclick = function () {
    if (year > 2000) {
      year -= 1;
      changeYear(year);
    }
  }

  document.getElementById("yearInc").onclick = function () {
    if (year < new Date().getFullYear() - 1) {
      year += 1;
      changeYear(year);
    }
  }

  document.getElementById("fetchStations").onclick = async function () {
    document.body.classList.add('loading');
    var extend = document.getElementById("extend").checked;
    var locationList = await getWeatherStations(extend ? 'true' : 'false');

    // Fetch and populate locations
    var locationDropdown = document.getElementById('location');
    locationDropdown.innerHTML = '<option selected disabled hidden>Select Location</option>'; // Clear existing list
    locationList.forEach((weatherStation) => {
      var locationOption = document.createElement('option');
      locationOption.textContent = weatherStation.name;
      locationOption.setAttribute('value', weatherStation.id);
      locationDropdown.append(locationOption);
    });
    station = ''; // Reset selection location
    document.getElementById("averageAnnualTotalLabel").textContent = 'average rideable days a year in';
    clearAverageSummary();
    changeYear(year);
    document.body.classList.remove('loading');
  };

  document.getElementById("fetchData").onclick = async function () {
    if (station) {
      if ((weatherDataCache[station] == null) || (!Object.hasOwn(weatherDataCache[station], year))) {
        // Only request from NOAA if data is not cached
        weatherDataCache[station][year] = await getWeatherData(station, year);

        // Adjust low temps to "morning" temps
        Object.keys(weatherDataCache[station][year]).forEach((date) => {
          var low = weatherDataCache[station][year][date]['TMIN'];
          var high = weatherDataCache[station][year][date]['TMAX'];
          if ((low != null) && (high != null)) {
            weatherDataCache[station][year][date]['TMIN'] = Math.round(low + ((high-low)/4));
          }
        });

        updateRideability(year);
      }
    }
    }

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

  var locationDropdown = document.getElementById('location');
  locationDropdown.addEventListener('change', () => {
    station = locationDropdown.value;
    var prettyName = locationDropdown.options[locationDropdown.selectedIndex].text
      .split(',')[0]
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      + ', '
      + locationDropdown.options[locationDropdown.selectedIndex].text
      .split(',')[1]
      .slice(1,3);
    document.getElementById("averageAnnualTotalLabel").textContent = `average rideable days a year in ${prettyName}`;
    if (!Object.hasOwn(weatherDataCache, station)) {
      averageAnnualTotals[station] = Array(3).fill(0);
      averageMonthlyTotals[station] = Array.from({ length: 12 }, () => Array(3).fill(0));
      weatherDataCache[station] = {};
      annualTotals[station] = {};
      monthlyTotals[station] = {};
      clearAverageSummary();
    } else {
      updateRideability('all');
    }
    changeYear(year);
  });
}

init();
