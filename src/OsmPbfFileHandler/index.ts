// TODO: Should verify that GPKG's modified timestamp > PBF's.

import { execSync } from 'child_process';
import { writeFileSync, existsSync, chmodSync } from 'fs';
import { join } from 'path';
import gdal, { Dataset } from 'gdal-next';
import * as turf from '@turf/turf';

import osmDir from '../constants/osmDataDir';
import osmBoundaryAdministrationLevelCodes from '../constants/osmBoundaryAdministrationLevelCodes';

import isValidOsmVersionExtractName from '../utils/isValidOsmVersionExtractName';
import getOsmosisExtractFilter from '../utils/getOsmosisExtractFilter';
import getExtractName from '../utils/getExtractName';

import { AdministrationLevel } from '../domain/types';

gdal.verbose();

export default class OsmPbfFileHandler {
  readonly osmVersionExtractName: string;
  readonly osmVersionExtractDir: string;
  readonly pbfFileName: string;
  readonly gpkgFileName: string;
  readonly pbfFilePath: string;
  readonly gpkgFilePath: string;
  protected _pbfDataset: Dataset | null;
  protected _gpkgDataset: Dataset | null;

  constructor(osmVersionExtractName: string) {
    // ABSOLUTELY MUST sanitize because used in execSync below.
    if (!isValidOsmVersionExtractName(osmVersionExtractName)) {
      throw new Error(
        `Invalid osmVersionExtractName: ${osmVersionExtractName}`,
      );
    }

    this.osmVersionExtractName = osmVersionExtractName;
    this.osmVersionExtractDir = join(osmDir, this.osmVersionExtractName);

    if (!existsSync(this.osmVersionExtractDir)) {
      throw new Error(
        `Error directory ${this.osmVersionExtractDir} does not exist.`,
      );
    }

    this.pbfFileName = join(`${this.osmVersionExtractName}.osm.pbf`);
    this.gpkgFileName = join(`${this.osmVersionExtractName}.osm.gpkg`);

    this.pbfFilePath = join(
      this.osmVersionExtractDir,
      `${this.osmVersionExtractName}.osm.pbf`,
    );

    this.gpkgFilePath = join(
      this.osmVersionExtractDir,
      `${this.osmVersionExtractName}.osm.gpkg`,
    );

    this._pbfDataset = null;
    this._gpkgDataset = null;
  }

  protected get pbfDataset() {
    this._pbfDataset =
      this._pbfDataset || gdal.open(this.pbfFilePath, 'r', 'OSM');
    return this._pbfDataset;
  }

  protected get gpkgExists() {
    return existsSync(this.gpkgFilePath);
  }

  // Because executeSQL fails with "Too many features have accumulated in points layer" error,
  //   we create a GPKG so we can get administrative boundaries with executeSQL.
  // See https://gdal.org/drivers/vector/osm.html#interleaved-reading
  createGkpg() {
    if (this.gpkgExists) {
      throw new Error('GPKG already exists.');
    }

    console.log('creating GPKG');

    // Using ogr2ogr to create the GPKG because doing everything in node-gdal
    //   is more complicated and error prone. Also, eventual FileGDB support important.
    const command = `ogr2ogr -F GPKG ${this.gpkgFileName} ${this.pbfFileName}`;

    // NOTE: spawnSync preferred, but it created empty GPKGs. Don't know why.
    execSync(command, { cwd: this.osmVersionExtractDir });

    // Make the GPKG readonly.
    chmodSync(this.gpkgFilePath, '444');
  }

  protected get gpkgDataset() {
    if (!this.gpkgExists) {
      this.createGkpg();
    }

    this._gpkgDataset =
      this._gpkgDataset || gdal.open(this.gpkgFilePath, 'r', 'GPKG');
    return this._gpkgDataset;
  }

  get layers() {
    return this.gpkgDataset.layers.map((l) => l.name);
  }

  getMultiPolygon(query: Record<string, string | number>) {
    try {
      const whereClause = Object.keys(query)
        .map((k) => `( ${k} = '${query[k]}' )`)
        .join(' AND ');

      const sql = `
        SELECT
            *
          FROM multipolygons
          WHERE ( ${whereClause} )
      `;

      console.log(sql);
      const result = this.gpkgDataset.executeSQL(sql, undefined, 'SQLITE');

      if (result.features.count(true) === 0) {
        throw new Error('No results');
      }

      if (result.features.count(true) > 1) {
        throw new Error('More than 1 result');
      }

      const feature = result.features.first();

      const properties = feature.fields.toObject();

      // @ts-ignore
      const { coordinates } = feature.getGeometry().toObject();

      // @ts-ignore
      const multiPolygon = turf.multiPolygon(coordinates, properties);

      return multiPolygon;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  getOsmosisFilterPoly(name: string, query: Record<string, number | string>) {
    const geojsonPoly = this.getMultiPolygon(query);

    if (geojsonPoly === null) {
      throw new Error('Unable to create MultiPolygon');
    }

    const polyfileData = getOsmosisExtractFilter(geojsonPoly, name);

    // const polyfileName = name + '.poly';
    const polyfileName = `${name}.poly`;

    writeFileSync(polyfileName, polyfileData);

    return polyfileData;
  }

  getMultiPolygonQueryForAdminRegion(
    adminLevel: AdministrationLevel,
    name: string,
  ) {
    return {
      type: 'boundary',
      boundary: 'administrative',
      admin_level: osmBoundaryAdministrationLevelCodes[adminLevel],
      name,
    };
  }

  getAdministrativeBoundaryPolygon(
    adminLevel: AdministrationLevel,
    name: string,
  ) {
    const q = this.getMultiPolygonQueryForAdminRegion(adminLevel, name);

    return this.getMultiPolygon(q);
  }

  getAdministrativeBoundaryOsmosisFilterPoly(
    adminLevel: AdministrationLevel,
    name: string,
  ) {
    const cleanedName = getExtractName(name, adminLevel);

    const extractName = `${cleanedName}-${this.osmVersionExtractName}`;

    const q = this.getMultiPolygonQueryForAdminRegion(adminLevel, name);

    return this.getOsmosisFilterPoly(extractName, q);
  }
}
