import { mkdirSync, createWriteStream, rmSync } from 'fs';
import { join, basename } from 'path';

import _ from 'lodash';

import GtfsDao from '../../src/GtfsDao';

import getRegionGtfsFeedsPaths from './getRegionGtfsFeedsPaths';

if (process.argv.length !== 3) {
  console.error(
    'Provide the region name as the first and only CLI positional argument.',
  );
  process.exit(1);
}

const regionName = process.argv[2];

const regionGtfsFeedPaths = getRegionGtfsFeedsPaths();

const dataDir = join(__dirname, './data/');

async function main() {
  const regionGtfsShapesDir = join(dataDir, regionName, 'gtfs_shapes');

  rmSync(regionGtfsShapesDir, { recursive: true, force: true });
  mkdirSync(regionGtfsShapesDir, { recursive: true });

  console.log(regionName);

  const gtfsFeedPaths = regionGtfsFeedPaths[regionName];

  for (const gtfsFeedPath of gtfsFeedPaths) {
    const agencyName = _.snakeCase(
      basename(gtfsFeedPath, '.zip').toLowerCase(),
    );

    console.log(`\t${agencyName}`);

    const dao = new GtfsDao(gtfsFeedPath);

    const feedShapesGeoJsonPath = join(
      regionGtfsShapesDir,
      `${agencyName}.shapes.geojson`,
    );

    const ws = createWriteStream(feedShapesGeoJsonPath);
    ws.write('{"type": "FeatureCollection","features": [');

    let firstLine = true;
    for await (const line of dao.makeShapeLineStringsAsyncGenerator()) {
      const pre = firstLine ? '' : ',';

      const good = ws.write(`${pre}${JSON.stringify(line)}`);
      firstLine = false;

      if (!good) {
        await new Promise((resolve) => ws.once('drain', resolve));
      }
    }

    ws.write(']}');

    ws.close();
  }
}

main();
