import { execSync } from 'child_process';
import {
  mkdirSync,
  readdirSync,
  existsSync,
  symlinkSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';

import _ from 'lodash';

const parkAndRidesDir = join(__dirname, './data/park_and_rides');
mkdirSync(parkAndRidesDir, { recursive: true });

const statewideShpName = 'nys_park_and_ride_locations';

const gtfsFeedFileSuffixRE = /_shapes$/;

const gtfsAgencyShapesDir = join(__dirname, './data/gtfs_shapes');
const gtfsAgencyShapesShps = readdirSync(gtfsAgencyShapesDir).filter((f) =>
  gtfsFeedFileSuffixRE.test(f),
);

(async function main() {
  for (const shapesShp of gtfsAgencyShapesShps) {
    const gtfsAgency = shapesShp.replace(gtfsFeedFileSuffixRE, '');

    console.log(gtfsAgency);

    const gtfsAgencyShapesShpsPath = join(gtfsAgencyShapesDir, shapesShp);

    const shpLinkPath = join(parkAndRidesDir, shapesShp);

    if (!existsSync(shpLinkPath)) {
      symlinkSync(gtfsAgencyShapesShpsPath, shpLinkPath);
    }

    const outLayerName = `${gtfsAgency}_park_and_rides`;
    const outShpPath = join(parkAndRidesDir, outLayerName);

    execSync(
      `
        rm -rf ${outShpPath};

        ogr2ogr \
          -f 'ESRI Shapefile' \
          ${outShpPath} \
          ${statewideShpName} \
          -dialect sqlite \
          -sql '
             SELECT DISTINCT
                 a.*
               FROM park_and_rides AS a,
                 '${shapesShp}'.${shapesShp} AS b
               WHERE (
                 ST_INTERSECTS(
                   ST_BUFFER(a.Geometry, 0.005),
                   b.Geometry
                 )
                )
          ' \
          -nln ${outLayerName}
      `,
      { cwd: parkAndRidesDir },
    );

    unlinkSync(shpLinkPath);

    const outCsvPath = `${outShpPath}.csv`;

    execSync(
      `
        rm -f ${outCsvPath};

        ogr2ogr \
          -f 'CSV' \
          ${outCsvPath} \
          ${outShpPath} \
          -dialect sqlite \
          -sql '
            SELECT DISTINCT
                CAST(rowid AS REAL) AS id,
                ST_X(Geometry) AS lon,
                ST_Y(Geometry) AS lat
              FROM ${outLayerName}
          '
      `,
      { cwd: parkAndRidesDir },
    );
  }
})();
