# Build a OSGeo Docker image with FileGDB support

The ogr2ogr FileGDB driver supports writing GDBs and compression.
The OpenFileGDB driver supports only reading uncompressed GDBs.

## Instructions

```sh
docker \
  build \
    --tag avail/avail-gis-toolkit:3.4.0.0 \
    --build-arg WITH_FILEGDB=yes \
  . \
&> build.$(date +%s).log
```
