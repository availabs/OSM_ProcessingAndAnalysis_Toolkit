import { join } from 'path';

import * as turf from '@turf/turf';

import GtfsDao from '../GtfsDao';
import OsmExtractDao from '.';

const gtfsAgency = 'centro';

const osmBase = `new-york-210101`;

const extractName = `${gtfsAgency}-15mi-buffer_${osmBase}`;

const gtfsFeedZipPath = join(__dirname, `../GtfsDao/${gtfsAgency}.gtfs.zip`);

async function main() {
  const gtfsDao = new GtfsDao(gtfsFeedZipPath);
  const poly = await gtfsDao.getBoundingPolygon();

  const multipoly = turf.multiPolygon([turf.getCoords(poly)]);

  const osmDao = new OsmExtractDao(osmBase);

  osmDao.createPolygonExtract(extractName, multipoly);
}

main();
