import { readFile, rename, rm } from 'fs/promises';
import { join } from 'path';

import * as turf from '@turf/turf';

import OsmExtractDao from '../../src/OsmDao';

if (process.argv.length !== 3) {
  console.error(
    'Provide the region name as the first and only CLI positional argument.',
  );
  process.exit(1);
}

const regionName = process.argv[2];

const osmBase = `new-york-220101`;

const extractName = `${regionName}-transit-15mi-buffer_${osmBase}`;

const osmDataDir = join(__dirname, '../../data/osm');
const dataDir = join(__dirname, './data/');

const regionGtfsBoundingPolyDir = join(
  dataDir,
  regionName,
  'gtfs_bounding_poly',
);

const regionPolyFileName = 'gtfs-bounding-poly.geojson';

const regionPolyFilePath = join(regionGtfsBoundingPolyDir, regionPolyFileName);

async function main() {
  const poly = JSON.parse(
    await readFile(regionPolyFilePath, { encoding: 'utf8' }),
  );

  const multipoly = turf.multiPolygon([turf.getCoords(poly)]);
  const osmDao = new OsmExtractDao(osmBase);

  osmDao.createPolygonExtract(extractName, multipoly);

  const extractDir = join(osmDataDir, extractName);

  await rm(join(dataDir, regionName, 'osm'), { recursive: true, force: true });
  await rename(extractDir, join(dataDir, regionName, 'osm'));
  await rm(join(dataDir, regionName, 'osm', `${extractName}.poly.xz`));
}

main();
