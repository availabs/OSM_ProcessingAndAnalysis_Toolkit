import { readdirSync } from 'fs';
import { join } from 'path';

const gtfsFeedFileSuffixRE = /.zip$/;

const dataDir = join(__dirname, './data/');

export default function getRegionGtfsFeedsPaths() {
  const regionGtfsFeedPaths = readdirSync(dataDir, {
    encoding: 'utf8',
    withFileTypes: true,
  }).reduce((acc, regionDirDirent) => {
    if (!regionDirDirent.isDirectory()) {
      return acc;
    }

    const regionName = regionDirDirent.name;

    const regionDataDir = join(dataDir, regionName);
    const gtfsFeedsDir = join(regionDataDir, 'gtfs_feeds');

    const gtfsFeedZips = readdirSync(gtfsFeedsDir).filter((f) =>
      gtfsFeedFileSuffixRE.test(f),
    );

    if (gtfsFeedZips.length) {
      acc[regionName] = gtfsFeedZips.map((f) => join(gtfsFeedsDir, f));
    }

    return acc;
  }, {});

  return regionGtfsFeedPaths;
}
