import { execSync } from 'child_process';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';

import { JSDOM } from 'jsdom';
import _ from 'lodash';

const parkAndRidesDir = join(__dirname, './data/park_and_rides');
mkdirSync(parkAndRidesDir, { recursive: true });

const parkAndRideLotsUrl =
  'https://maps.511mobility.org/parkAndRideProfile/list?offset=0&max=10000';

const statewideCsvName = 'nys_park_and_ride_locations.csv';
const statewideCsvPath = join(parkAndRidesDir, statewideCsvName);

const statewideShpName = 'nys_park_and_ride_locations';

async function getParkAndRideLocationsFrom511Mobility() {
  try {
    const csvStream = createWriteStream(statewideCsvPath);

    const dom = await JSDOM.fromURL(parkAndRideLotsUrl);

    // slice(1) removes header
    const tableRows = [...dom.window.document.querySelectorAll('tr')].slice(1);

    csvStream.write('lon,lat,lot_name,county,city,state\n');

    for (const row of tableRows) {
      const [locationE, countyE, cityE, stateE] = [...row.children];

      const [coordsE, , nameE] = locationE.querySelectorAll('a');

      const [, lat, lon] = coordsE.href.match(/lat=([-0-9.]+)&lng=([-0-9.]+)/);

      if (!(Number.isFinite(+lat) && Number.isFinite(+lon))) {
        continue;
      }

      const lotName = nameE.textContent.trim().replace(/"/g, '');

      const county = countyE.textContent.trim().replace(/"/g, '');
      const city = cityE.textContent.trim().replace(/"/g, '');
      const state = stateE.textContent.trim().replace(/"/g, '');

      csvStream.write(
        `${lon},${lat},"${lotName}","${county}","${city}","${state}"\n`,
      );
    }
  } catch (err) {
    throw err;
  }
}

function createStateParkAndRideLocationsShapefile() {
  try {
    const stdout = execSync(
      `
      ogr2ogr \
        -s_srs EPSG:4326 \
        -t_srs EPSG:4326 \
        -oo X_POSSIBLE_NAMES=lon \
        -oo Y_POSSIBLE_NAMES=lat \
        -f "ESRI Shapefile" \
        ${statewideShpName} \
        ${statewideCsvName} \
        -nln park_and_rides
    `,
      { cwd: parkAndRidesDir },
    );

    console.log(stdout.toString());
  } catch (err) {
    console.error(err);
  }
}

(async function main() {
  await getParkAndRideLocationsFrom511Mobility();
  createStateParkAndRideLocationsShapefile();
})();
