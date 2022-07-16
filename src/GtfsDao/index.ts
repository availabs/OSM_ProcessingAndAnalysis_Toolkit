import EventEmitter from 'events';
import { createReadStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

import * as turf from '@turf/turf';
import unzipper from 'unzipper';
import * as csv from 'fast-csv';
import through from 'through2';
import pEvent from 'p-event';

import { getGeometriesConvexHullAsync } from '../utils/hulls';

const pipelineAsync = promisify(pipeline);

export default class GtfsDao {
  constructor(readonly gtfsFeedZipPath: string) {}

  async getFeedDateRange() {
    let feedStartDate: string = '9';
    let feedEndDate: string = '0';

    await pipelineAsync(
      createReadStream(this.gtfsFeedZipPath),
      unzipper.ParseOne(/^calendar.txt$/),
      csv.parse({ headers: true }),
      through.obj(function fn({ start_date, end_date }, _$, cb) {
        if (start_date < feedStartDate) {
          feedStartDate = start_date;
        }

        if (end_date > feedEndDate) {
          feedEndDate = end_date;
        }

        cb();
      }),
    );

    if (feedStartDate === '9' || feedEndDate === '0') {
      return null;
    }

    return [feedStartDate, feedEndDate];
  }

  makeShapeLineStringsAsyncGenerator() {
    let curShapeId = null;

    // @ts-ignore
    let curCoords: [[number, number, number]] = [];

    const geomEmitter = new EventEmitter();

    // @ts-ignore
    const geomAsyncIterator: AsyncGenerator<turf.Feature<turf.Polygon>> =
      pEvent.iterator(geomEmitter, 'data', {
        resolutionEvents: ['done'],
      });

    const emitGeom = () => {
      const coords = curCoords
        .sort((a, b) => a[2] - b[2])
        .map(([lon, lat]) => [lon, lat]);

      // console.log(JSON.stringify({ curCoords, coords }, null, 4));

      if (coords.length >= 2) {
        const lineString = turf.lineString(coords);

        geomEmitter.emit('data', lineString);
      } else {
        console.warn('shape omitted because coords.length < 2');
      }
    };

    // Create Generator for getGeometriesConvexHull

    pipeline(
      createReadStream(this.gtfsFeedZipPath),
      unzipper.ParseOne(/^shapes.txt$/),
      csv.parse({ headers: true }),
      through.obj(
        function fn(
          { shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence },
          _$,
          cb,
        ) {
          if (curShapeId !== shape_id && curCoords.length) {
            emitGeom();

            // @ts-ignore
            curCoords = [];
          }

          curShapeId = shape_id;
          curCoords.push([+shape_pt_lon, +shape_pt_lat, +shape_pt_sequence]);

          cb();
        },
        function flush(cb) {
          if (curCoords.length) {
            emitGeom();
            cb();
          }

          geomEmitter.emit('done');
        },
      ),
      (err) => {
        if (err) {
          console.error(err);
        }
      },
    );

    return geomAsyncIterator;
  }

  async getBoundingPolygon(bufferMi: number = 15) {
    const linesAsyncGen = this.makeShapeLineStringsAsyncGenerator();

    async function* makePolyGenerator() {
      for await (const line of linesAsyncGen) {
        const poly = turf.buffer(line, bufferMi, { units: 'miles' });
        yield poly;
      }
    }

    const polyGenerator = makePolyGenerator();

    const hull = await getGeometriesConvexHullAsync(polyGenerator);

    return hull;
  }
}
