// Note: Currently only supports positive polygons, or the convave hull of the polygon.
//       If negative regions (holes) eventually required, see
//         https://wiki.openstreetmap.org/wiki/Osmosis/Polygon_Filter_File_Format
//           > The polygon section name may optionally be prefixed with "!" to subtract the polygon.
//         https://geojson.org/geojson-spec.html#polygon
//           > For Polygons with multiple rings, the first must be the exterior ring
//           > and any others must be interior rings or holes.

import * as turf from '@turf/turf';

export default function getOsmosisExtractFilter(
  geojsonPoly: turf.Feature<turf.MultiPolygon>,
  extractName: string,
) {
  const sections = geojsonPoly?.geometry.coordinates
    .map((ring, i) => {
      const polygon = turf.polygon([ring[0]]);
      const buffered = turf.buffer(polygon, 0.001, {
        units: 'kilometers',
        steps: 1000,
      });

      const polycoordRows = buffered.geometry.coordinates[0]
        .map(
          ([lon, lat]) => `\t${lon.toExponential()}\t${lat.toExponential()}\n`,
        )
        .join('');

      return `${extractName}_ring_${i + 1}\n${polycoordRows}\nEND`;
    })
    .join('\n');

  const polyfileName = `${extractName}.poly`;
  const polyfileData = `${polyfileName}\n${sections}\nEND`;

  return polyfileData;
}
