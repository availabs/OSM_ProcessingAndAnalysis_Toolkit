import { rm, mkdir, readdir, copy, readFile, writeFile } from 'fs-extra';
import { join, basename } from 'path';

if (process.argv.length !== 3) {
  console.error(
    'Provide the region name as the first and only CLI positional argument.',
  );
  process.exit(1);
}

const regionName = process.argv[2];

const regionDataDir = join(__dirname, './data/', regionName);
const bundleDir = join(__dirname, './bundles/', regionName);

async function copyGtfsFiles() {
  const gtfsFeedsDir = join(regionDataDir, 'gtfs_feeds');
  const gtfsFiles = (await readdir(gtfsFeedsDir)).filter((f) =>
    /\.zip$/i.test(f),
  );

  for (const f of gtfsFiles) {
    await copy(join(gtfsFeedsDir, f), join(bundleDir, f));
  }
}

async function copyOsmFile() {
  const osmDir = join(regionDataDir, 'osm');
  const [osmFile] = (await readdir(osmDir)).filter((f) => /\.pbf/i.test(f));

  await copy(join(osmDir, osmFile), join(bundleDir, osmFile));
}

async function createBuildConfig() {
  const dateRangesDir = join(regionDataDir, 'gtfs_date_range');
  const files = (await readdir(dateRangesDir))
    .filter((f) => /\.json/i.test(f))
    .map((f) => join(dateRangesDir, f));

  const ranges: [number, number][] = [];
  for (const f of files) {
    console.log(
      basename(f, '.json'),
      '\n\t',
      await readFile(f, { encoding: 'utf8' }),
      '\n',
    );
    const { start_date, end_date } = JSON.parse(
      await readFile(f, { encoding: 'utf8' }),
    );
    ranges.push([+start_date, +end_date]);
  }

  const maxStart = `${Math.max(...ranges.map(([s]) => s))}`;
  const minEnd = `${Math.min(...ranges.map(([, e]) => e))}`;

  if (minEnd < maxStart) {
    throw new Error(
      `No shared feed dates: maxFeedStartDate: ${maxStart}, minFeedEndDate: ${minEnd}`,
    );
  }

  const transitServiceStart = `${maxStart.slice(0, 4)}-${maxStart.slice(
    4,
    6,
  )}-${maxStart.slice(6, 8)}`;

  const transitServiceEnd = `${minEnd.slice(0, 4)}-${minEnd.slice(
    4,
    6,
  )}-${minEnd.slice(6, 8)}`;

  await writeFile(
    join(bundleDir, 'build-config.json'),
    JSON.stringify({ transitServiceStart, transitServiceEnd }, null, 2),
  );
}

async function main() {
  try {
    await rm(bundleDir, { recursive: true, force: true });
    await mkdir(bundleDir, { recursive: true });

    // await copyGtfsFiles();
    // await copyOsmFile();
    await createBuildConfig();
  } catch (err) {
    console.error(err.message);
  }
}

main();
