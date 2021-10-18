# Transit Agency Bundles for Conveyal Analysis

GIS file bundles were created for CDTA and Centro.
These bundle files can be directly loaded into the
[Conveyal Analysis Tool](https://docs.conveyal.com/),
except for the ZIPed LODES CSVs which will need to be decompressed before loading.

## Bundle Files

Transit agency names prefix all file names. The below listed files are for CDTA.

Transit Agency regions represent a [convex hull](https://en.wikipedia.org/wiki/Convex_hull)
created around all points within 15 miles of a bus route.

### File Descriptions

- cdta.gtfs.zip: The CDTA GTFS Feed data.

- cdta-15mi-buffer_new-york-210101.osm.pbf: All OSM roads within 15 miles of any
  all the transit agency route.

- cdta_lodes_residence_area_characteristics.freeform.csv.zip:
  [Freeform](https://docs.conveyal.com/prepare-inputs/upload-spatial-data#freeform-non-grid-points)
  CDTA region extract of the Census LODES Residence Area Characteristics file.

  - Columns: (NOTE: h_geocode is the ID)

    - "h_geocode"
    - "lon"
    - "lat"
    - "total number of jobs"
    - "age 29 or younger"
    - "age 30 to 54"
    - "age 55 or older"
    - "earnings $1250/month or less"
    - "earnings $1251/month to $3333/month"
    - "earnings greater than $3333/month"
    - "agriculture, forestry, fishing and hunting"
    - "mining, quarrying, and oil and gas extraction"
    - "utilities"
    - "construction"
    - "33 manufacturing"
    - "wholesale trade"
    - "retail trade"
    - "transportation and warehousing"
    - "information"
    - "finance and insurance"
    - "real estate and rental and leasing"
    - "professional, scientific, and technical services"
    - "management of companies and enterprises"
    - "administrative and support and waste management and remediation services"
    - "educational services"
    - "health care and social assistance"
    - "arts, entertainment, and recreation"
    - "accommodation and food services"
    - "other services [except public administration]"
    - "public administration"
    - "race: white, alone"
    - "race: black or african american alone"
    - "race: american indian or alaska native alone"
    - "race: asian alone"
    - "race: native hawaiian or other pacific islander alone"
    - "race: two or more race groups"
    - "ethnicity: not hispanic or latino"
    - "ethnicity: hispanic or latino"
    - "educational attainment: less than high school"
    - "educational attainment: high school or equivalent no college"
    - "educational attainment: some college or associate degree"
    - "educational attainment: bachelors degree or advanced degree"
    - "sex: male"
    - "sex: female"

- cdta_lodes_workplace_area_characteristics.freeform.csv.zip:
  [Freeform](https://docs.conveyal.com/prepare-inputs/upload-spatial-data#freeform-non-grid-points)
  CDTA region extract of the Census LODES Workplace Area Characteristics file.

  - Columns: (NOTE: w_geocode is the ID)

    - "w_geocode"
    - "lon"
    - "lat"
    - "total number of jobs"
    - "workers age 29 or younger"
    - "workers age 30 to "
    - "workers age 55 or older"
    - "earnings $1250/month or less"
    - "earnings $1251/month to $3333/month"
    - "earnings greater than $3333/month"
    - "agriculture, forestry, fishing and hunting"
    - "mining, quarrying, and oil and gas extraction"
    - "utilities"
    - "construction"
    - "manufacturing"
    - "wholesale trade"
    - "retail trade"
    - "transportation and warehousing"
    - "information"
    - "finance and insurance"
    - "real estate and rental and leasing"
    - "professional, scientific, and technical services"
    - "management of companies and enterprises"
    - "administrative and support and waste management and remediation services"
    - "educational services"
    - "health care and social assistance"
    - "arts, entertainment, and recreation"
    - "accommodation and food services"
    - "other services [except public administration]"
    - "public administration"
    - "race: white, alone"
    - "race: black or african american alone"
    - "race: american indian or alaska native alone"
    - "race: asian alone"
    - "race: native hawaiian or other pacific islander alone"
    - "race: two or more race groups"
    - "ethnicity: not hispanic or latino"
    - "ethnicity: hispanic or latino"
    - "educational attainment: less than high school"
    - "educational attainment: high school or equivalent, no college"
    - "educational attainment: some college or associate degree"
    - "educational attainment: bachelors degree or advanced degree"
    - "sex: male"
    - "sex: female"
    - "firm age: 0-1 years"
    - "firm age: 2-3 years"
    - "firm age: 4-5 years"
    - "firm age: 6-10 years"
    - "firm age: 11+ years"
    - "firm size: 0-19 employees"
    - "firm size: 20-49 employees"
    - "firm size: 50-249 employees"
    - "firm size: 250-499 employees"
    - "firm size: 500+ employees"

- cdta_lodes_residence_area_characteristics.grid.csv.zip:
  [Non-freeform](https://docs.conveyal.com/prepare-inputs/upload-spatial-data#freeform-non-grid-points)
  CDTA region extract of the Census LODES Residence Area Characteristics file.

  - Columns are the same as the freeform file with the omission of `h_geocode`.

- cdta_lodes_workplace_area_characteristics.grid.csv.zip:
  [Non-freeform](https://docs.conveyal.com/prepare-inputs/upload-spatial-data#freeform-non-grid-points)
  CDTA region extract of the Census LODES Workplace Area Characteristics file.

  - Columns are the same as the freeform file with the omission of `w_geocode`.

- cdta_lodes_origin_destination.csv.zip: CDTA region extract of the Census
  LODES Origin-Destination file.

- cdta_lodes_wac.csv: Legacy LODES Workplace Area Characteristics file. Same
  structure as files generated before October 15, 2021.

- cdta_park_and_rides.csv: All park and ride lots within walking distance to
  bus routes. The file was created using 511mobility's [Park & Ride Lot Profile
  Pages](https://maps.511mobility.org/parkAndRideProfile/list?offset=0&max=1000).
