# Getting the 2017-2020 NPMRDS Extended Shapefiles for the Conflation Pipeline

PROBLEM: The NPMRDS database npmrds_shapefile tables have the following schema:

```sh
npmrds_production=# \d npmrds_shapefile_2020
                           Table "ny.npmrds_shapefile_2020"
    Column    |                 Type                  | Collation | Nullable | Default
--------------+---------------------------------------+-----------+----------+---------
 ogc_fid      | integer                               |           |          |
 tmc          | character varying                     |           | not null |
 state        | character varying                     |           |          |
 wkb_geometry | public.geometry(MultiLineString,4326) |           |          |
Indexes:
    "npmrds_shapefile_2020_pkey" PRIMARY KEY, btree (tmc)
    "npmrds_shapefile_2020_geom_idx" gist (wkb_geometry) CLUSTER
Inherits: public.npmrds_shapefile_2020
```

The conflation pipeline requires the lineartmc field from the shapefile
which is not in the database tables.

Therefore, we need the original shapefiles that were used to create
the database tables.

## TODO: Compare what was is in the database and those files

### Converting the shapefiles to GeoJSON

In this directory, with the shapefiles created from the database.

```sh
find . -name 'ny*00' |
  while read f; do ogr2ogr -f GeoJSON "$f.geojson" "$f" -select 'tmc' ; done
```

In ../../data/npmrds with the files created using NpmrdsDAO.createShapefile
on the assimilated original Shapefiles that were believed to be the
source of the database tables.

```sh
find . -mindepth 2 -type d -name 'ny-npmrds-shapefile-20*' |
  while read f; do ogr2ogr -f GeoJSON "$f.geojson" "$f" -select 'tmc' ; done
```

### Comparing the geojson

```sh
./geojsons/compare
e16c8f79c4d3f68f1e7d2c87fb279e35  ./cleaned/db.2017.geojson
4918d237dd32e19b021e01d525aa852d  ./cleaned/db.2018.geojson
a0b90614ba3896d168b786532e670602  ./cleaned/db.2019.geojson
5ffe03166e0ee6ff9588dada7b18f51e  ./cleaned/db.2020.geojson
e16c8f79c4d3f68f1e7d2c87fb279e35  ./cleaned/file.2017.geojson
4918d237dd32e19b021e01d525aa852d  ./cleaned/file.2018.geojson
a0b90614ba3896d168b786532e670602  ./cleaned/file.2019.geojson
5ffe03166e0ee6ff9588dada7b18f51e  ./cleaned/file.2020.geojson
```

## QED: The shapefiles are the original sources
