# Build a OSGeo Docker image with FileGDB support

The ogr2ogr FileGDB driver supports writing GDBs and compression.
The OpenFileGDB driver supports only reading uncompressed GDBs.

## Instructions

```sh
docker build --build-arg GDAL_VERSION=v3.2.3 --build-arg WITH_FILEGDB=yes . &> build.$(date +%s).log
```
