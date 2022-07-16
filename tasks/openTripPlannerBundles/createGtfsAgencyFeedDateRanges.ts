import { mkdirSync, writeFileSync, rmSync } from 'fs';
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

const dataDir = join(__dirname, './data/');

const regionGtfsFeedPaths = getRegionGtfsFeedsPaths();

async function main() {
  const regionGtfsDateRangeDir = join(dataDir, regionName, 'gtfs_date_range');

  rmSync(regionGtfsDateRangeDir, { recursive: true, force: true });
  mkdirSync(regionGtfsDateRangeDir, { recursive: true });

  const gtfsFeedPaths = regionGtfsFeedPaths[regionName];

  for (const gtfsFeedPath of gtfsFeedPaths) {
    const feedName = basename(gtfsFeedPath, '.zip');

    const dao = new GtfsDao(gtfsFeedPath);

    const dateRange = await dao.getFeedDateRange();

    if (dateRange !== null) {
      const [start_date, end_date] = dateRange;

      const d = {
        start_date,
        end_date,
      };

      const outF = join(regionGtfsDateRangeDir, `${feedName}.json`);
      writeFileSync(outF, JSON.stringify(d));
    }
  }
}

main();
