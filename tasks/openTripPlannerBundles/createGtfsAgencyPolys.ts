import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join, basename } from 'path';

import * as turf from '@turf/turf';
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

const dataDir = join(__dirname, './data/');

const regionGtfsFeedPaths = getRegionGtfsFeedsPaths();

async function main() {
  const regionGtfsBoundingPolyDir = join(
    dataDir,
    regionName,
    'gtfs_bounding_poly',
  );

  mkdirSync(regionGtfsBoundingPolyDir, { recursive: true });

  console.log(regionName);

  const regionPolys: turf.Feature<turf.Polygon, turf.Properties>[] = [];

  const gtfsFeedPaths = regionGtfsFeedPaths[regionName];

  for (const gtfsFeedPath of gtfsFeedPaths) {
    console.log(`\t${basename(gtfsFeedPath)}`);

    const dao = new GtfsDao(gtfsFeedPath);

    const poly = await dao.getBoundingPolygon();

    regionPolys.push(poly);
  }

  const regionPoly = _.tail(regionPolys).reduce(
    // @ts-ignore
    (acc, poly) => turf.union(acc, poly),
    _.head(regionPolys),
  );

  const regionPolyFileName = 'gtfs-bounding-poly.geojson';

  const regionPolyFilePath = join(
    regionGtfsBoundingPolyDir,
    regionPolyFileName,
  );

  writeFileSync(regionPolyFilePath, JSON.stringify(regionPoly));

  const regionShapefileName = 'gtfs-bounding-poly';
  const regionShapefilePath = join(
    regionGtfsBoundingPolyDir,
    regionShapefileName,
  );

  rmSync(regionShapefilePath, { recursive: true, force: true });

  execSync(
    `
        ogr2ogr \
          -F 'ESRI Shapefile' \
          ${regionShapefileName} \
          ${regionPolyFileName} \
          -lco SPATIAL_INDEX=yes \
          -nln region_bounding_polygon
      `,
    { cwd: regionGtfsBoundingPolyDir },
  );
}

main();
