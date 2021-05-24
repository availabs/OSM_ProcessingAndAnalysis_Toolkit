import * as turf from "@turf/turf";

export default function getOsmosisExtractFilter(
  geojsonPoly: turf.Feature<turf.MultiPolygon>,
  name: string
) {
  const sections = geojsonPoly?.geometry.coordinates
    .map((ring, i) => {
      const polygon = turf.polygon([ring[0]]);
      const buffered = turf.buffer(polygon, 0.001, {
        units: "kilometers",
        steps: 1000,
      });

      const polycoordRows = buffered.geometry.coordinates[0]
        .map(
          ([lon, lat]) => `\t${lon.toExponential()}\t${lat.toExponential()}\n`
        )
        .join("");

      return `exterior_ring_${i + 1}\n${polycoordRows}\nEND`;
    })
    .join("\n");

  const polyfileName = `${name}.poly`;
  const polyfileData = `${polyfileName}\n${sections}\nEND`;

  return polyfileData;
}
