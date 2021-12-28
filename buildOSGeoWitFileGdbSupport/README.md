# Building OSGeo GDAL Docker Images

## TL;DR

```sh
./buildDockerImage
```

## Purpose

This directory should contain a clone of the
[OSGeo GDAL](https://github.com/OSGeo/gdal) project repository.

The repository directory is ignored by the avail-gis-toolkit's Git repository.
You can obtain the GDAL repository with the following command.

```sh
git clone https://github.com/OSGeo/gdal.git
```

The _versions/_ directory contains the respective the _docker/_ subdirectory
of the GDAL repository.

It is used to create a Docker image with the ESRI File Geodatabase
[(FileGDB)](https://gdal.org/drivers/vector/filegdb.html) driver built-in.
The standard distribution of GDAL does not include this driver as it requires ESRI's
[FileGDB API SDK](http://www.esri.com/apps/products/download/#File_Geodatabase_API_1.3).
