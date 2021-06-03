import { execSync } from 'child_process';
import { existsSync, chmodSync, readdirSync, mkdirSync, statSync } from 'fs';

import { join } from 'path';

import { npmrdsDataDir } from '../constants/npmrds';

import getGdalVirtualFileSystemPath from '../utils/getGdalVirtualFileSystemPath';
import isTarArchive from '../utils/isTarArchive';
import isZipArchive from '../utils/isZipArchive';
import cleanName from '../utils/cleanName';
import chownr from '../utils/chownr';

import assimilateSourceNpmrdsShapefile from './utils/assimilateSourceNpmrdsShapefile';
import createFileGdb from './utils/createFileGdb';
import createShapefile from './utils/createShapefile';

import {
  NpmrdsAdministrationLevel,
  NpmrdsAdministrationAreaName,
  NpmrdsVersionExtractName,
} from './domain/types';

type NpmrdsNonStateAdministrationLevel = Omit<
  NpmrdsAdministrationLevel,
  'State'
>;

export default class NpmrdsDao {
  static assimilateSourceNpmrdsShapefile = assimilateSourceNpmrdsShapefile;
  protected static createFileGdb = createFileGdb;
  protected static createShapefile = createShapefile;

  static getExtractDirectoryPath(extractName: NpmrdsVersionExtractName) {
    return join(npmrdsDataDir, extractName);
  }

  static getShapefilePath(npmrdsShpVersionName: NpmrdsVersionExtractName) {
    const dir = NpmrdsDao.getExtractDirectoryPath(npmrdsShpVersionName);

    return join(dir, npmrdsShpVersionName);
  }

  static getFileGdbPath(npmrdsShpVersionName: NpmrdsVersionExtractName) {
    const dir = NpmrdsDao.getExtractDirectoryPath(npmrdsShpVersionName);
    const fileName = `${npmrdsShpVersionName}.gdb`;

    return join(dir, fileName);
  }

  static getAdministrativeAreaExtractNamePrefix(
    adminLevel: NpmrdsNonStateAdministrationLevel,
    name: string,
  ) {
    return cleanName(`${name}-${adminLevel}`);
  }

  static isValidNpmrdsExtractName(npmrdsShpVersionName: string) {
    return /^[a-z0-9_-]*[a-z]{2}-npmrds-shapefile-\d{4}-\d{8}$/.test(
      npmrdsShpVersionName,
    );
  }

  static getExtractNameForAdministrativeRegion(
    adminLevel: NpmrdsNonStateAdministrationLevel,
    name: NpmrdsAdministrationAreaName,
    npmrdsShpVersionName: NpmrdsVersionExtractName,
  ) {
    if (!NpmrdsDao.isValidNpmrdsExtractName(npmrdsShpVersionName)) {
      throw new Error('Invalid sourceName');
    }

    const prefix = NpmrdsDao.getAdministrativeAreaExtractNamePrefix(
      adminLevel,
      name,
    );

    return `${prefix}_${npmrdsShpVersionName}`;
  }

  readonly npmrdsShpVersionDir: string;

  protected _originalSourceFilePath?: string | null;

  constructor(readonly npmrdsShpVersionName: string) {
    // ABSOLUTELY MUST sanitize because used in execSync below.
    if (!NpmrdsDao.isValidNpmrdsExtractName(this.npmrdsShpVersionName)) {
      throw new Error(
        `Invalid NYS RIS version name: ${this.npmrdsShpVersionName}`,
      );
    }

    this.npmrdsShpVersionDir = NpmrdsDao.getExtractDirectoryPath(
      this.npmrdsShpVersionName,
    );

    if (!existsSync(this.npmrdsShpVersionDir)) {
      throw new Error(
        `Error directory ${this.npmrdsShpVersionDir} does not exist.`,
      );
    }
  }

  get originalSourceDirectoryPath() {
    const d = join(this.npmrdsShpVersionDir, 'original_source');

    return existsSync(d) ? d : null;
  }

  get originalSourceFilePath() {
    if (this._originalSourceFilePath !== undefined) {
      return this._originalSourceFilePath;
    }

    if (!this.originalSourceDirectoryPath) {
      return null;
    }

    const origSrcDirFiles = this.originalSourceDirectoryPath
      ? readdirSync(this.originalSourceDirectoryPath)
      : [];

    const archives = origSrcDirFiles.filter(
      (f) => isTarArchive(f) || isZipArchive(f),
    );

    if (archives.length < 1) {
      throw new Error(
        `Error: ${this.originalSourceDirectoryPath} does not contain a TAR or ZIP archive.`,
      );
    }

    if (archives.length > 1) {
      throw new Error(
        `Error: ${this.originalSourceDirectoryPath} contains more that one TAR/ZIP archive.`,
      );
    }

    this._originalSourceFilePath = join(
      this.originalSourceDirectoryPath,
      archives[0],
    );

    return this._originalSourceFilePath;
  }

  get originalSourceFileExists() {
    return this.originalSourceFilePath !== null;
  }

  get originalSourceGdalVirtualFileSystemPath() {
    return (
      this.originalSourceFilePath &&
      getGdalVirtualFileSystemPath(this.originalSourceFilePath)
    );
  }

  get shapefilePath() {
    return NpmrdsDao.getShapefilePath(this.npmrdsShpVersionName);
  }
  get shapefileExists() {
    return existsSync(this.shapefilePath);
  }

  get shapefileZipPath() {
    return `${this.shapefilePath}.zip`;
  }
  get shapefileZipExists() {
    return existsSync(this.shapefileZipPath);
  }

  get shapefileGdalVirtualFileSystemPath() {
    if (this.shapefileExists) {
      return getGdalVirtualFileSystemPath(this.shapefilePath);
    }

    if (this.shapefileZipExists) {
      return getGdalVirtualFileSystemPath(this.shapefileZipPath);
    }

    return null;
  }

  get gdalOutputPath() {
    return NpmrdsDao.getFileGdbPath(this.npmrdsShpVersionName);
  }

  get fileGdbExists() {
    return existsSync(this.gdalOutputPath);
  }

  get fileGdbZipPath() {
    return `${this.gdalOutputPath}.zip`;
  }

  get fileGdbZipExists() {
    return existsSync(this.fileGdbZipPath);
  }

  get fileGdbGdalVirtualFileSystemPath() {
    if (this.fileGdbExists) {
      return this.gdalOutputPath;
    }

    if (this.fileGdbZipExists) {
      return getGdalVirtualFileSystemPath(this.fileGdbZipPath);
    }

    return null;
  }

  protected get baseFilePath(): string {
    if (this.shapefileExists) {
      return this.shapefilePath;
    }

    if (this.shapefileZipExists) {
      return this.shapefileZipPath;
    }

    if (this.originalSourceFileExists) {
      // @ts-ignore
      return this.originalSourceFilePath;
    }

    throw new Error('Cannot find an NPMRDS Shapefile.');
  }

  protected get gdalInputPath() {
    const shapefileVsi = this.shapefileGdalVirtualFileSystemPath;

    if (shapefileVsi !== null) {
      return shapefileVsi;
    }

    const origVsi = this.originalSourceGdalVirtualFileSystemPath;

    if (origVsi !== null) {
      return origVsi;
    }

    throw new Error('No input shapefile found for GDAL.');
  }

  get ownerUid() {
    return statSync(this.baseFilePath).uid;
  }

  get ownerGid() {
    return statSync(this.baseFilePath).gid;
  }

  createShapefile() {
    if (this.shapefileExists) {
      console.warn('Shapefile already exists.');
      return;
    }

    NpmrdsDao.createShapefile({
      // @ts-ignore
      gdalInputPath: this.gdalInputPath,
      gdalOutputPath: this.gdalOutputPath,
      uid: this.ownerUid,
      gid: this.ownerGid,
    });
  }

  createFileGDB() {
    if (this.fileGdbExists) {
      console.warn('FileGDB already exists.');
      return;
    }

    NpmrdsDao.createFileGdb({
      // @ts-ignore
      gdalInputPath: this.gdalInputPath,
      gdalOutputPath: this.gdalOutputPath,
      uid: this.ownerUid,
      gid: this.ownerGid,
    });
  }

  createAdministrativeRegionExtract(
    adminLevel: NpmrdsNonStateAdministrationLevel,
    name: NpmrdsAdministrationAreaName,
  ) {
    const extractName = NpmrdsDao.getExtractNameForAdministrativeRegion(
      adminLevel,
      name,
      this.npmrdsShpVersionName,
    );

    const extractDirPath = NpmrdsDao.getExtractDirectoryPath(extractName);

    if (existsSync(extractDirPath)) {
      throw new Error(
        `NPMRDS Version Extract directory already exists at ${extractDirPath}`,
      );
    }

    mkdirSync(extractDirPath, { recursive: true });

    const extractShpPath = NpmrdsDao.getShapefilePath(extractName);

    NpmrdsDao.createShapefile({
      // @ts-ignore
      gdalInputPath: this.gdalInputPath,
      gdalOutputPath: extractShpPath,
      uid: this.ownerUid,
      gid: this.ownerGid,
      adminAreaFilter: { adminLevel, name },
    });

    chownr(extractDirPath, this.ownerUid, this.ownerGid);
  }

  get gpkgPath() {
    const gpkgFileName = `${this.npmrdsShpVersionName}.gpkg`;

    return join(this.npmrdsShpVersionDir, gpkgFileName);
  }

  get gpkgExists() {
    return existsSync(this.gpkgPath);
  }

  createGPKG() {
    if (this.gpkgExists) {
      console.warn('GPKG already exists.');
      return;
    }

    const command = `ogr2ogr \
      -skipfailures \
      -nln npmrds_shapefile \
      -nlt MULTILINESTRING \
      -F GPKG  \
      ${this.gpkgPath} \
      ${this.gdalInputPath}`;

    // NOTE: spawnSync preferred, but it created empty GPKGs. Don't know why.
    execSync(command);

    if (statSync(this.gpkgPath).uid !== this.ownerUid) {
      chownr(this.gpkgPath, this.ownerUid, this.ownerGid);
    }

    // Make the GPKG readonly.
    chmodSync(this.gpkgPath, '444');
  }
}
