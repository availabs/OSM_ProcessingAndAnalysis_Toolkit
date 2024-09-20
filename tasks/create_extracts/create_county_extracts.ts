import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { gunzipSync } from 'zlib';
import turf from 'turf';

import OsmExtractDao from '../../src/OsmDao';

const OSM_VERSION = 'new-york-240101';

const in_dir = path.join(__dirname, './county_geojson')

const files =
  readdirSync(in_dir)
   .filter(p => !/^county-36001/.test(p))
   .sort();


async function main() {
  const dao = new OsmExtractDao(OSM_VERSION);

  for (const f of files) {
    const area_name = f.replace(/\.geojson\.gz$/, '');
    const extract_name = dao.getExtractName(area_name)

    console.log(extract_name)

    const fpath = path.join(in_dir, f)
    const gz_buff = readFileSync(fpath)
    const geojson_str = gunzipSync(gz_buff).toString()

    let geojson = JSON.parse(geojson_str)

    if (geojson.geometry.type === 'Polygon') {
      geojson = turf.multiPolygon(
        [geojson.geometry.coordinates],
        geojson.properties
      )
    }

    await dao.createPolygonExtract(extract_name, geojson);
  }
}

main()
