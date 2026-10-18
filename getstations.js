import fs from 'fs';

async function fetchFromNoaa(offset) {
  var params = new URLSearchParams({
    // datasetid: 'GHCND',
    sortfield: 'datacoverage',
    sortorder: 'desc',
    limit: '1000',
    offset: `${offset}`
  });
  params.append('datatypeid', 'TMIN');
  params.append('datatypeid', 'TMAX');
  params.append('datatypeid', 'PRCP');
  params.append('datatypeid', 'SNOW');
  const token = 'vzyAxeTniGYBjBVLdRMcUJvitZxhGZYP';
  const URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2/stations';
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

var offset = 0;
var coverage = 1;
var outputJSON = [];
do {
  const data = await fetchFromNoaa(offset);
  coverage = data.results[data.results.length-1].datacoverage;
  data.results.forEach((result) => {
    if ((result.datacoverage === 1) && (result.maxdate.slice(0,4) === "2026")){
      outputJSON.push({name: result.name, id: result.id});
    }
  });
  offset += 1000;
  if (data.results.length < 1000) {
    break;
  }
} while (coverage === 1);

console.log(`${outputJSON.length} stations found`);
outputJSON.sort((a,b) => a.name.localeCompare(b.name));

fs.writeFile('stations.json', JSON.stringify(outputJSON, null, 2), 'utf8', (err) => {
  if (err) {
    console.error('Error writing file:', err);
    return;
  }
  console.log('File written successfully!');
});
