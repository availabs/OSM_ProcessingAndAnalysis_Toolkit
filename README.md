<!-- markdownlint-disable MD013 -->

# AVAIL GIS Toolkit

This repository is intended to facilitate cross-project GIS dataset consistency
and simplified data provenance archiving by standardizing and centralizing
the processing, versioning, and analysis of GIS datasets.

## OSM Naming Conventions

The following rules are intended to promote cross-project consistency and facilitate archiving:

- Currently, all processing MUST start with an OSM PBF, and not XML, files.

  - XML files can be created from the PBF.

- The OSM version PBF file MUST be in data/osm/

  - TODO: Document the data/ directory conventions

- OSM version names and extract names MUST match the following naming convention.

  - Extract names are lowercase with dashes, followed by the OSM version.

    For example: new-york-210520, albany-county-210520

    "latest" is not an accepted OSM version because it is unsuitable for version tracking.

## Resources

### OpenStreetMap

- [about](https://www.openstreetmap.org/about)
- [wiki](https://wiki.openstreetmap.org/wiki/Main_Page)
- [useful resources](https://labs.mapbox.com/mapping/becoming-a-power-mapper/useful-osm-resources/)
- [Geofabrik region extracts](http://download.geofabrik.de/openstreetmap/)

- [TIGER to OSM Attribute Map](https://wiki.openstreetmap.org/wiki/TIGER_to_OSM_Attribute_Map)

### Open Source Geospatial Foundation _(OSGeo)_ Geospatial Data Abstraction Library _(GDAL)_

- [Main site](https://www.gdal.org)
- [GitHub](https://github.com/OSGeo/gdal)
- [Configuration file for OSM import](https://github.com/OSGeo/gdal/blob/master/gdal/data/osmconf.ini)

To build a Docker image with OSGeo GDAL with FileGDB support, see
[this](https://github.com/availabs/NYS_RIS_ProcessingAndAnalysis_Toolkit/tree/main/buildOSGeoWitFileGdbSupport/versions/3.2.3/ubuntu_full).

### Osmosis

- [OSM wiki](https://wiki.openstreetmap.org/wiki/Osmosis)
- [github](https://github.com/openstreetmap/osmosis)
  - [releases](https://github.com/openstreetmap/osmosis/releases)

May need to use this to fine tune what is included/excluded in an OSM Version Extract: See
[Data Manipulation Tasks](https://wiki.openstreetmap.org/wiki/Osmosis/Detailed_Usage_0.48#--tag-filter_.28--tf.29)

## Node GDAL-Next

We are using [node-gdal-next](https://github.com/contra/node-gdal-next)
(a fork of [node-gdal](https://github.com/naturalatlas/node-gdal)) because we currently need
[SQLite and GPKG support](https://github.com/naturalatlas/node-gdal/pull/260#issuecomment-597697047).

With some work, we could use [node-gdal](https://github.com/naturalatlas/node-gdal) instead.
