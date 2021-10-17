import { execSync } from 'child_process';
import { join } from 'path';

const censusLodesDir = join(__dirname, './data/census_lodes');

const rawLodesDir = join(censusLodesDir, 'raw_data');

const rawOdFilePath = join(rawLodesDir, 'ny_od_main_JT00_2018.csv.gz');
const rawRacFilePath = join(rawLodesDir, 'ny_rac_S000_JT00_2018.csv.gz');
const rawWacFilePath = join(rawLodesDir, 'ny_wac_S000_JT00_2018.csv.gz');

const sqlitePath = join(censusLodesDir, 'census_lodes_2018.sqlite3');

execSync(`
  rm -f ${sqlitePath} ;

  sqlite3 ${sqlitePath} '
    CREATE TABLE ny_od_main_jt00_2018 (
      w_geocode   TEXT NOT NULL,
      h_geocode   TEXT NOT NULL,
      S000        INTEGER,
      SA01        INTEGER,
      SA02        INTEGER,
      SA03        INTEGER,
      SE01        INTEGER,
      SE02        INTEGER,
      SE03        INTEGER,
      SI01        INTEGER,
      SI02        INTEGER,
      SI03        INTEGER,
      createdate  TEXT,
      PRIMARY     KEY (w_geocode, h_geocode)
    ) WITHOUT ROWID ;

    CREATE VIEW origin_destinations
      AS
        SELECT
            w_geocode,
            h_geocode,
            S000 AS "total number of jobs",
            SA01 AS "workers age 29 or younger",
            SA02 AS "workers age 30 to 54",
            SA03 AS "workers age 55 or older",
            SE01 AS "earnings $1250/month or less",
            SE02 AS "earnings $1251/month to $3333/month",
            SE03 AS "earnings greater than $3333/month",
            SI01 AS "goods producing industry sectors",
            SI02 AS "trade, transportation, and utilities industry sectors",
            SI03 AS "all other services industry sectors"
          FROM ny_od_main_jt00_2018
    ;

    CREATE TABLE ny_rac_s000_jt00_2018 (
      h_geocode   TEXT PRIMARY KEY,
      C000        INTEGER,
      CA01        INTEGER,
      CA02        INTEGER,
      CA03        INTEGER,
      CE01        INTEGER,
      CE02        INTEGER,
      CE03        INTEGER,
      CNS01       INTEGER,
      CNS02       INTEGER,
      CNS03       INTEGER,
      CNS04       INTEGER,
      CNS05       INTEGER,
      CNS06       INTEGER,
      CNS07       INTEGER,
      CNS08       INTEGER,
      CNS09       INTEGER,
      CNS10       INTEGER,
      CNS11       INTEGER,
      CNS12       INTEGER,
      CNS13       INTEGER,
      CNS14       INTEGER,
      CNS15       INTEGER,
      CNS16       INTEGER,
      CNS17       INTEGER,
      CNS18       INTEGER,
      CNS19       INTEGER,
      CNS20       INTEGER,
      CR01        INTEGER,
      CR02        INTEGER,
      CR03        INTEGER,
      CR04        INTEGER,
      CR05        INTEGER,
      CR07        INTEGER,
      CT01        INTEGER,
      CT02        INTEGER,
      CD01        INTEGER,
      CD02        INTEGER,
      CD03        INTEGER,
      CD04        INTEGER,
      CS01        INTEGER,
      CS02        INTEGER,
      createdate  TEXT
    ) WITHOUT ROWID ;


    CREATE VIEW residence_area_characteristics
      AS
        SELECT
            h_geocode,
            C000  AS "total number of jobs",
            CA01  AS "age 29 or younger",
            CA02  AS "age 30 to 54",
            CA03  AS "age 55 or older",
            CE01  AS "earnings $1250/month or less",
            CE02  AS "earnings $1251/month to $3333/month",
            CE03  AS "earnings greater than $3333/month",
            CNS01 AS "agriculture, forestry, fishing and hunting",
            CNS02 AS "mining, quarrying, and oil and gas extraction",
            CNS03 AS "utilities",
            CNS04 AS "construction",
            CNS05 AS "33 manufacturing",
            CNS06 AS "wholesale trade",
            CNS07 AS "retail trade",
            CNS08 AS "transportation and warehousing",
            CNS09 AS "information",
            CNS10 AS "finance and insurance",
            CNS11 AS "real estate and rental and leasing",
            CNS12 AS "professional, scientific, and technical services",
            CNS13 AS "management of companies and enterprises",
            CNS14 AS "administrative and support and waste management and remediation services",
            CNS15 AS "educational services",
            CNS16 AS "health care and social assistance",
            CNS17 AS "arts, entertainment, and recreation",
            CNS18 AS "accommodation and food services",
            CNS19 AS "other services [except public administration]",
            CNS20 AS "public administration",
            CR01  AS "race: white, alone",
            CR02  AS "race: black or african american alone",
            CR03  AS "race: american indian or alaska native alone",
            CR04  AS "race: asian alone",
            CR05  AS "race: native hawaiian or other pacific islander alone",
            CR07  AS "race: two or more race groups",
            CT01  AS "ethnicity: not hispanic or latino",
            CT02  AS "ethnicity: hispanic or latino",
            CD01  AS "educational attainment: less than high school",
            CD02  AS "educational attainment: high school or equivalent, no college",
            CD03  AS "educational attainment: some college or associate degree",
            CD04  AS "educational attainment: bachelors degree or advanced degree",
            CS01  AS "sex: male",
            CS02  AS "sex: female"
          FROM ny_rac_s000_jt00_2018
    ;

    CREATE TABLE ny_wac_s000_jt00_2018 (
      w_geocode   TEXT PRIMARY KEY,
      C000        INTEGER,
      CA01        INTEGER,
      CA02        INTEGER,
      CA03        INTEGER,
      CE01        INTEGER,
      CE02        INTEGER,
      CE03        INTEGER,
      CNS01       INTEGER,
      CNS02       INTEGER,
      CNS03       INTEGER,
      CNS04       INTEGER,
      CNS05       INTEGER,
      CNS06       INTEGER,
      CNS07       INTEGER,
      CNS08       INTEGER,
      CNS09       INTEGER,
      CNS10       INTEGER,
      CNS11       INTEGER,
      CNS12       INTEGER,
      CNS13       INTEGER,
      CNS14       INTEGER,
      CNS15       INTEGER,
      CNS16       INTEGER,
      CNS17       INTEGER,
      CNS18       INTEGER,
      CNS19       INTEGER,
      CNS20       INTEGER,
      CR01        INTEGER,
      CR02        INTEGER,
      CR03        INTEGER,
      CR04        INTEGER,
      CR05        INTEGER,
      CR07        INTEGER,
      CT01        INTEGER,
      CT02        INTEGER,
      CD01        INTEGER,
      CD02        INTEGER,
      CD03        INTEGER,
      CD04        INTEGER,
      CS01        INTEGER,
      CS02        INTEGER,
      CFA01       INTEGER,
      CFA02       INTEGER,
      CFA03       INTEGER,
      CFA04       INTEGER,
      CFA05       INTEGER,
      CFS01       INTEGER,
      CFS02       INTEGER,
      CFS03       INTEGER,
      CFS04       INTEGER,
      CFS05       INTEGER,
      createdate  TEXT
    ) WITHOUT ROWID ;

    CREATE VIEW workplace_area_characteristics
      AS
        SELECT
            w_geocode,
            C000  AS "total number of jobs",
            CA01  AS "workers age 29 or younger",
            CA02  AS "workers age 30 to ",
            CA03  AS "workers age 55 or older",
            CE01  AS "earnings $1250/month or less",
            CE02  AS "earnings $1251/month to $3333/month",
            CE03  AS "earnings greater than $3333/month",
            CNS01 AS "agriculture, forestry, fishing and hunting",
            CNS02 AS "mining, quarrying, and oil and gas extraction",
            CNS03 AS "utilities",
            CNS04 AS "construction",
            CNS05 AS "manufacturing",
            CNS06 AS "wholesale trade",
            CNS07 AS "retail trade",
            CNS08 AS "transportation and warehousing",
            CNS09 AS "information",
            CNS10 AS "finance and insurance",
            CNS11 AS "real estate and rental and leasing",
            CNS12 AS "professional, scientific, and technical services",
            CNS13 AS "management of companies and enterprises",
            CNS14 AS "administrative and support and waste management and remediation services",
            CNS15 AS "educational services",
            CNS16 AS "health care and social assistance",
            CNS17 AS "arts, entertainment, and recreation",
            CNS18 AS "accommodation and food services",
            CNS19 AS "other services [except public administration]",
            CNS20 AS "public administration",
            CR01  AS "race: white, alone",
            CR02  AS "race: black or african american alone",
            CR03  AS "race: american indian or alaska native alone",
            CR04  AS "race: asian alone",
            CR05  AS "race: native hawaiian or other pacific islander alone",
            CR07  AS "race: two or more race groups",
            CT01  AS "ethnicity: not hispanic or latino",
            CT02  AS "ethnicity: hispanic or latino",
            CD01  AS "educational attainment: less than high school",
            CD02  AS "educational attainment: high school or equivalent, no college",
            CD03  AS "educational attainment: some college or associate degree",
            CD04  AS "educational attainment: bachelors degree or advanced degree",
            CS01  AS "sex: male",
            CS02  AS "sex: female",
            CFA01 AS "firm age: 0-1 years",
            CFA02 AS "firm age: 2-3 years",
            CFA03 AS "firm age: 4-5 years",
            CFA04 AS "firm age: 6-10 years",
            CFA05 AS "firm age: 11+ years",
            CFS01 AS "firm size: 0-19 employees",
            CFS02 AS "firm size: 20-49 employees",
            CFS03 AS "firm size: 50-249 employees",
            CFS04 AS "firm size: 250-499 employees",
            CFS05 AS "firm size: 500+ employees"
          FROM ny_wac_s000_jt00_2018
    ';

    zcat ${rawOdFilePath} \
      | sqlite3 -csv ${sqlitePath} ".import '|cat -' ny_od_main_jt00_2018" ;

    zcat ${rawRacFilePath} \
      | sqlite3 -csv ${sqlitePath} ".import '|cat -' ny_rac_S000_JT00_2018" ;

    zcat ${rawWacFilePath} \
      | sqlite3 -csv ${sqlitePath} ".import '|cat -' ny_wac_S000_JT00_2018"
`);
