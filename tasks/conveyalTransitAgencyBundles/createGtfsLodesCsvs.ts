import { execSync } from 'child_process';
import { readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const censusLodesDir = join(__dirname, './data/census_lodes');

const sqlitePath = join(censusLodesDir, 'census_lodes_2018.sqlite3');

const gtfsCensusCentroidsSuffixRE = /_census_block_centroids\.sqlite3$/;

const gtfsAgencyCensusCentroidsDir = join(
  __dirname,
  './data/gtfs_census_centroids',
);

const gtfsAgencyCensusCentroidsDbs = readdirSync(
  gtfsAgencyCensusCentroidsDir,
).filter((f) => gtfsCensusCentroidsSuffixRE.test(f));

(async function main() {
  for (const centroidsDb of gtfsAgencyCensusCentroidsDbs) {
    const gtfsAgency = centroidsDb.replace(gtfsCensusCentroidsSuffixRE, '');

    console.log(gtfsAgency);

    const centroidsDbPath = join(gtfsAgencyCensusCentroidsDir, centroidsDb);

    const agencyDir = join(censusLodesDir, gtfsAgency);

    execSync(`rm -rf ${agencyDir}`);
    mkdirSync(agencyDir, { recursive: true });

    const odCsvFile = join(
      agencyDir,
      `${gtfsAgency}_lodes_origin_destination.csv`,
    );
    const racCsvFile = join(
      agencyDir,
      `${gtfsAgency}_lodes_residence_area_characteristics.csv`,
    );
    const wacCsvFile = join(
      agencyDir,
      `${gtfsAgency}_lodes_workplace_area_characteristics.csv`,
    );

    execSync(
      `
      sqlite3 \
        -header \
        -csv \
        ${sqlitePath} \
        '
          ATTACH '\\''${centroidsDbPath}'\\'' AS centroids;

          SELECT
              b.longitude AS o_lon,
              b.latitude  AS o_lat,
              c.longitude AS d_lon,
              c.latitude  AS d_lat,
              a.S000 AS "total number of jobs",
              a.SA01 AS "workers age 29 or younger",
              a.SA02 AS "workers age 30 to 54",
              a.SA03 AS "workers age 55 or older",
              a.SE01 AS "earnings $1250/month or less",
              a.SE02 AS "earnings $1251/month to $3333/month",
              a.SE03 AS "earnings greater than $3333/month",
              a.SI01 AS "goods producing industry sectors",
              a.SI02 AS "trade, transportation, and utilities industry sectors",
              a.SI03 AS "all other services industry sectors"
            FROM ny_od_main_jt00_2018 AS a
              INNER JOIN centroids.census_block_centroids AS b
                ON ( a.h_geocode = b.geoid20 )
              INNER JOIN centroids.census_block_centroids AS c
                ON ( a.w_geocode = b.geoid20 )
        ' \
      > ${odCsvFile} ;

      zip -9 ${odCsvFile}.zip ${odCsvFile};

      sqlite3 \
        -header \
        -csv \
        ${sqlitePath} \
        '
          ATTACH '\\''${centroidsDbPath}'\\'' AS centroids;

          SELECT
              b.longitude AS lon,
              b.latitude  AS lat,
              a.C000  AS "total number of jobs",
              a.CA01  AS "age 29 or younger",
              a.CA02  AS "age 30 to 54",
              a.CA03  AS "age 55 or older",
              a.CE01  AS "earnings $1250/month or less",
              a.CE02  AS "earnings $1251/month to $3333/month",
              a.CE03  AS "earnings greater than $3333/month",
              a.CNS01 AS "agriculture, forestry, fishing and hunting",
              a.CNS02 AS "mining, quarrying, and oil and gas extraction",
              a.CNS03 AS "utilities",
              a.CNS04 AS "construction",
              a.CNS05 AS "33 manufacturing",
              a.CNS06 AS "wholesale trade",
              a.CNS07 AS "retail trade",
              a.CNS08 AS "transportation and warehousing",
              a.CNS09 AS "information",
              a.CNS10 AS "finance and insurance",
              a.CNS11 AS "real estate and rental and leasing",
              a.CNS12 AS "professional, scientific, and technical services",
              a.CNS13 AS "management of companies and enterprises",
              a.CNS14 AS "administrative and support and waste management and remediation services",
              a.CNS15 AS "educational services",
              a.CNS16 AS "health care and social assistance",
              a.CNS17 AS "arts, entertainment, and recreation",
              a.CNS18 AS "accommodation and food services",
              a.CNS19 AS "other services [except public administration]",
              a.CNS20 AS "public administration",
              a.CR01  AS "race: white, alone",
              a.CR02  AS "race: black or african american alone",
              a.CR03  AS "race: american indian or alaska native alone",
              a.CR04  AS "race: asian alone",
              a.CR05  AS "race: native hawaiian or other pacific islander alone",
              a.CR07  AS "race: two or more race groups",
              a.CT01  AS "ethnicity: not hispanic or latino",
              a.CT02  AS "ethnicity: hispanic or latino",
              a.CD01  AS "educational attainment: less than high school",
              a.CD02  AS "educational attainment: high school or equivalent, no college",
              a.CD03  AS "educational attainment: some college or associate degree",
              a.CD04  AS "educational attainment: bachelors degree or advanced degree",
              a.CS01  AS "sex: male",
              a.CS02  AS "sex: female"
            FROM ny_rac_s000_jt00_2018 AS a
              INNER JOIN centroids.census_block_centroids AS b
                ON ( a.h_geocode = b.geoid20 )
        ' \
      > ${racCsvFile} ;

      zip -9 ${racCsvFile}.zip ${racCsvFile};

      sqlite3 \
        -header \
        -csv \
        ${sqlitePath} \
        '
          ATTACH '\\''${centroidsDbPath}'\\'' AS centroids;

          SELECT
              b.longitude AS lon,
              b.latitude  AS lat,
              a.C000  AS "total number of jobs",
              a.CA01  AS "workers age 29 or younger",
              a.CA02  AS "workers age 30 to ",
              a.CA03  AS "workers age 55 or older",
              a.CE01  AS "earnings $1250/month or less",
              a.CE02  AS "earnings $1251/month to $3333/month",
              a.CE03  AS "earnings greater than $3333/month",
              a.CNS01 AS "agriculture, forestry, fishing and hunting",
              a.CNS02 AS "mining, quarrying, and oil and gas extraction",
              a.CNS03 AS "utilities",
              a.CNS04 AS "construction",
              a.CNS05 AS "manufacturing",
              a.CNS06 AS "wholesale trade",
              a.CNS07 AS "retail trade",
              a.CNS08 AS "transportation and warehousing",
              a.CNS09 AS "information",
              a.CNS10 AS "finance and insurance",
              a.CNS11 AS "real estate and rental and leasing",
              a.CNS12 AS "professional, scientific, and technical services",
              a.CNS13 AS "management of companies and enterprises",
              a.CNS14 AS "administrative and support and waste management and remediation services",
              a.CNS15 AS "educational services",
              a.CNS16 AS "health care and social assistance",
              a.CNS17 AS "arts, entertainment, and recreation",
              a.CNS18 AS "accommodation and food services",
              a.CNS19 AS "other services [except public administration]",
              a.CNS20 AS "public administration",
              a.CR01  AS "race: white, alone",
              a.CR02  AS "race: black or african american alone",
              a.CR03  AS "race: american indian or alaska native alone",
              a.CR04  AS "race: asian alone",
              a.CR05  AS "race: native hawaiian or other pacific islander alone",
              a.CR07  AS "race: two or more race groups",
              a.CT01  AS "ethnicity: not hispanic or latino",
              a.CT02  AS "ethnicity: hispanic or latino",
              a.CD01  AS "educational attainment: less than high school",
              a.CD02  AS "educational attainment: high school or equivalent, no college",
              a.CD03  AS "educational attainment: some college or associate degree",
              a.CD04  AS "educational attainment: bachelors degree or advanced degree",
              a.CS01  AS "sex: male",
              a.CS02  AS "sex: female",
              a.CFA01 AS "firm age: 0-1 years",
              a.CFA02 AS "firm age: 2-3 years",
              a.CFA03 AS "firm age: 4-5 years",
              a.CFA04 AS "firm age: 6-10 years",
              a.CFA05 AS "firm age: 11+ years",
              a.CFS01 AS "firm size: 0-19 employees",
              a.CFS02 AS "firm size: 20-49 employees",
              a.CFS03 AS "firm size: 50-249 employees",
              a.CFS04 AS "firm size: 250-499 employees",
              a.CFS05 AS "firm size: 500+ employees"
            FROM ny_wac_s000_jt00_2018 AS a
              INNER JOIN centroids.census_block_centroids AS b
                ON ( a.w_geocode = b.geoid20 )
        ' \
      > ${wacCsvFile} ;

      zip -9 ${wacCsvFile}.zip ${wacCsvFile};

    `,
      { cwd: censusLodesDir },
    );
  }
})();
