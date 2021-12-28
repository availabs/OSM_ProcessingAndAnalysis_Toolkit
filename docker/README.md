# Building OSGeo GDAL Docker Images

## TL;DR

```sh
./buildDockerImage
```

## Purpose

It is used to create a Docker image with the ESRI File Geodatabase
[(FileGDB)](https://gdal.org/drivers/vector/filegdb.html) driver built-in.
The standard distribution of GDAL does not include this driver as it requires ESRI's
[FileGDB API SDK](http://www.esri.com/apps/products/download/#File_Geodatabase_API_1.3).
OpenFileGDB (the default GDB driver) sometimes cannot open the NYSDOT RIS GDBs.

## Updating

Clone the [OSGeo GDAL](https://github.com/OSGeo/gdal) project repository
in this directory.

```sh
git clone https://github.com/OSGeo/gdal.git
```

--NOTE: The sample commands below were for GDAL version 3.4.0. Modify accordingly.

Checkout the hash corresponding to the GDAL version.

```sh
git checkout d699b38a744301368070ef780f797340da4a9c3c
```

Copy the OSGeo GDAL Docker build code.

```sh
cp -r gdal/gdal/docker/ubuntu-full ./versions/3.4.0
cp -r gdal/gdal/docker/util.sh ./versions/3.4.0
```

Modify the VERSION variable atop the _./build_ script.

```sh
./build
```
