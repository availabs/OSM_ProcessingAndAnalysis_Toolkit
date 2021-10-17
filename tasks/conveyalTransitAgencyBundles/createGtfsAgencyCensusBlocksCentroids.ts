import { execSync } from 'child_process';
import { readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const gtfsPolySuffixRE = /_2020_tabblock20$/;

const gtfsAgencyCensusBlocksDir = join(
  __dirname,
  './data/gtfs_census_tabblocks',
);

const gtfsAgencyCensusBlocksShps = readdirSync(
  gtfsAgencyCensusBlocksDir,
).filter((f) => gtfsPolySuffixRE.test(f));

const gtfsAgencyCensusCentroidsDir = join(
  __dirname,
  './data/gtfs_census_centroids',
);

mkdirSync(gtfsAgencyCensusCentroidsDir, { recursive: true });

(async function main() {
  for (const agencyBlocksShp of gtfsAgencyCensusBlocksShps) {
    const gtfsAgency = agencyBlocksShp.replace(gtfsPolySuffixRE, '');

    const shpFilePath = join(gtfsAgencyCensusBlocksDir, agencyBlocksShp);

    console.log(gtfsAgency);

    const sqliteFile = `${gtfsAgency}_census_block_centroids.sqlite3`;
    const sqlitePath = join(gtfsAgencyCensusCentroidsDir, sqliteFile);

    const tableName = 'census_block_centroids';

    execSync(`rm -f ${sqlitePath}`);

    execSync(`
      sqlite3 ${sqlitePath} '
        CREATE TABLE ${tableName} (
          geoid20     TEXT PRIMARY KEY,
          longitude   REAL NOT NULL,
          latitude    REAL NOT NULL
        ) WITHOUT ROWID ;
      '
    `);

    execSync(`
      rm -rf ${shpFilePath};

      ogr2ogr \
        -f CSV /vsistdout/ \
        ${shpFilePath} \
        -dialect sqlite \
        -sql '
          SELECT
              geoid20,
              ST_X(centroid) AS lon,
              ST_Y(centroid) AS lat
            FROM (
              SELECT
                  GEOID20 as geoid20,
                  ST_Centroid(Geometry) as centroid
                FROM ${gtfsAgency}_2020_tabblock20
            )
        ' \
      | sqlite3 -csv ${sqlitePath} ".import '|cat -' ${tableName}"
    `);
  }
})();
