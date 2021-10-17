import { spawn, exec } from 'child_process';
import { readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

import GtfsDao from '../../src/GtfsDao';

const ndjsonToGeoJsonPath = join(__dirname, '../../bin/ndjson_to_geojson');

const gtfsFeedFileSuffixRE = /\.gtfs\.zip$/;

const gtfsFeedsDir = join(__dirname, './data/gtfs_feeds');

const gtfsFeedZips = readdirSync(gtfsFeedsDir).filter((f) =>
  gtfsFeedFileSuffixRE.test(f),
);

const gtfsAgencyShapesDir = join(__dirname, './data/gtfs_shapes');

mkdirSync(gtfsAgencyShapesDir, { recursive: true });

(async function main() {
  for (const gtfsFeedZip of gtfsFeedZips) {
    const gtfsAgency = gtfsFeedZip.replace(gtfsFeedFileSuffixRE, '');

    // console.log(gtfsAgency);

    const gtfsFeedZipPath = join(gtfsFeedsDir, gtfsFeedZip);

    const dao = new GtfsDao(gtfsFeedZipPath);

    const source = spawn(ndjsonToGeoJsonPath);

    const layerName = `${gtfsAgency}_shapes`;
    const shpFilePath = join(gtfsAgencyShapesDir, layerName);

    const sink = exec(
      `
        rm -rf ${shpFilePath};

        ogr2ogr \
          -F 'ESRI Shapefile' \
          ${shpFilePath} \
          /vsistdin/ \
          -lco SPATIAL_INDEX=yes \
          -nln ${layerName}
      `,
    );

    source.stdout.pipe(sink.stdin);

    const iter = dao.makeShapeLineStringsAsyncGenerator();

    for await (const line of iter) {
      source.stdin.write(`${JSON.stringify(line)}\n`);
    }

    source.stdin.end();
  }
})();
