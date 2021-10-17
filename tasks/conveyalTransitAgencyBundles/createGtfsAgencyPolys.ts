import { execSync } from 'child_process';
import { readdirSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import GtfsDao from '../../src/GtfsDao';

const gtfsFeedFileSuffixRE = /\.gtfs\.zip$/;

const gtfsFeedsDir = join(__dirname, './data/gtfs_feeds');

const gtfsFeedZips = readdirSync(gtfsFeedsDir).filter((f) =>
  gtfsFeedFileSuffixRE.test(f),
);

const gtfsAgencyPolysDir = join(__dirname, './data/gtfs_polys');

mkdirSync(gtfsAgencyPolysDir, { recursive: true });

(async function main() {
  for (const gtfsFeedZip of gtfsFeedZips) {
    const gtfsAgency = gtfsFeedZip.replace(gtfsFeedFileSuffixRE, '');

    console.log(gtfsAgency);

    const gtfsFeedZipPath = join(gtfsFeedsDir, gtfsFeedZip);

    const dao = new GtfsDao(gtfsFeedZipPath);

    const poly = await dao.getBoundingPolygon();

    const gtfsAgencyPolyFile = `${gtfsAgency}.poly.geojson`;

    const gtfsAgencyPolyPath = join(gtfsAgencyPolysDir, gtfsAgencyPolyFile);

    writeFileSync(gtfsAgencyPolyPath, JSON.stringify(poly));

    const layerName = `${gtfsAgency}_polygon`;
    const shpFilePath = join(gtfsAgencyPolysDir, layerName);

    execSync(`
      rm -rf shpFilePath;

      ogr2ogr \
        -F 'ESRI Shapefile' \
        ${shpFilePath} \
        ${gtfsAgencyPolyPath} \
        -lco SPATIAL_INDEX=yes \
        -nln ${layerName}
    `);
  }
})();
