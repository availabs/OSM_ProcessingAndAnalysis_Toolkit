import { execSync } from 'child_process';
import { readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const gtfsPolySuffixRE = /_polygon$/;

const gtfsAgencyPolysDir = join(__dirname, './data/gtfs_polys');

const gtfsAgencyPolyFiles = readdirSync(gtfsAgencyPolysDir).filter((f) =>
  gtfsPolySuffixRE.test(f),
);

const gtfsAgencyCensusBlocksDir = join(
  __dirname,
  './data/gtfs_census_tabblocks',
);

mkdirSync(gtfsAgencyCensusBlocksDir, { recursive: true });

(async function main() {
  for (const gtfsAgencyPolyFile of gtfsAgencyPolyFiles) {
    const gtfsAgency = gtfsAgencyPolyFile.replace(gtfsPolySuffixRE, '');

    console.log(gtfsAgency);

    const gtfsAgencyPolyPath = join(gtfsAgencyPolysDir, gtfsAgencyPolyFile);

    execSync(`cp -r ${gtfsAgencyPolyPath} .`);

    const outShpPath = join(
      gtfsAgencyCensusBlocksDir,
      `${gtfsAgency}_2020_tabblock20`,
    );

    execSync(`
      rm -rf ${outShpPath};

      ogr2ogr \
        -f 'ESRI Shapefile' \
        ${outShpPath} \
        /vsizip/data/census_blocks/tl_2020_36_all.zip \
        -dialect sqlite \
        -sql '
           SELECT
               a.*
             FROM tl_2020_36_tabblock20 AS a,
               '${gtfsAgencyPolyFile}'.${gtfsAgencyPolyFile} AS b
             WHERE ST_INTERSECTS(a.Geometry, b.Geometry)
        ' \
        -nln ${gtfsAgency}_2020_tabblock20
    `);

    execSync(`rm -rf ${gtfsAgencyPolyFile}`);
  }
})();
