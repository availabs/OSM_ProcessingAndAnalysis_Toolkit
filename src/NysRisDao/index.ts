import { execSync, spawnSync } from 'child_process';
import { existsSync, chmodSync, readdirSync, statSync } from 'fs';

import { join } from 'path';
import gdal from 'gdal-next';
import chmodr from 'chmodr';

import { ogr2ogrEnabledFormats } from '../constants/ogr2ogr';
import { risDataDir } from '../constants/nysRis';

import getGdalVirtualFileSystemPath from '../utils/getGdalVirtualFileSystemPath';
import isTarArchive from '../utils/isTarArchive';
import isZipArchive from '../utils/isZipArchive';

import assimilateNysRisSource from './utils/assimilateNysRisSource';
import chownr from '../utils/chownr';

import {
  NysRisAdministrationLevel,
  NysRisAdministrationAreaName,
} from './domain/types';

gdal.verbose();

export type NysRisAdministrationAreaQueryObj = Record<string, string | number>;

export default class NysRisDao {
  static async assimilateNysRisSource(nysRisSourceFilePath: string) {
    await assimilateNysRisSource(nysRisSourceFilePath);
  }

  static getExtractDirectoryPath(extractName: string) {
    return join(risDataDir, extractName);
  }

  static cleanNysRisAdminLevelName(name: string): NysRisAdministrationAreaName {
    return name.replace(/[^a-z0-9_-]{1,}/g, '-').replace(/-{1,}/, '-');
  }

  static getAdministrativeAreaExtractNamePrefix(
    name: string,
    adminLevel: NysRisAdministrationLevel,
  ) {
    let n = name.toLowerCase();

    if (n.endsWith(adminLevel)) {
      n = n.replace(new RegExp(`${adminLevel}$`, 'i'), '');
    }

    n = NysRisDao.cleanNysRisAdminLevelName(`${n}-${adminLevel}`);

    return n;
  }

  static isValidNysRisExtractName(nysRisVersion: string) {
    return /^[a-z0-9_-]*nys-ris-\d{8}$/.test(nysRisVersion);
  }

  readonly nysRisVersionExtractDir: string;

  protected _gpkgDataset?: gdal.Dataset;

  protected _originalSourceFilePath?: string | null;

  constructor(readonly nysRisVersionName: string) {
    // ABSOLUTELY MUST sanitize because used in execSync below.
    if (!NysRisDao.isValidNysRisExtractName(this.nysRisVersionName)) {
      throw new Error(
        `Invalid NYS RIS version name: ${this.nysRisVersionName}`,
      );
    }

    this.nysRisVersionExtractDir = NysRisDao.getExtractDirectoryPath(
      this.nysRisVersionName,
    );

    if (!existsSync(this.nysRisVersionExtractDir)) {
      throw new Error(
        `Error directory ${this.nysRisVersionExtractDir} does not exist.`,
      );
    }
  }

  get originalSourceDirectoryPath() {
    const d = join(this.nysRisVersionExtractDir, 'original_source');

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
      origSrcDirFiles[0],
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

  get fileGdbPath() {
    const fileName = `${this.nysRisVersionName}.gdb`;

    return join(this.nysRisVersionExtractDir, fileName);
  }

  get fileGdbExists() {
    return existsSync(this.fileGdbPath);
  }

  get fileGdbZipPath() {
    return `${this.fileGdbPath}.zip`;
  }

  get fileGdbZipExists() {
    return existsSync(this.fileGdbZipPath);
  }

  get fileGdbGdalVirtualFileSystemPath() {
    if (this.fileGdbExists) {
      return getGdalVirtualFileSystemPath(this.fileGdbPath);
    }

    if (this.fileGdbZipExists) {
      return getGdalVirtualFileSystemPath(this.fileGdbZipPath);
    }

    return null;
  }

  protected get baseFilePath(): string {
    if (this.originalSourceFileExists) {
      // @ts-ignore
      return this.originalSourceFilePath;
    }

    if (this.fileGdbZipExists) {
      return this.fileGdbZipPath;
    }

    if (this.fileGdbExists) {
      return this.fileGdbPath;
    }

    throw new Error('Cannot find an original source NYS RIS or a FileGDB');
  }

  get ownerUid() {
    return statSync(this.baseFilePath).uid;
  }

  get ownerGid() {
    return statSync(this.baseFilePath).gid;
  }

  createFileGDB() {
    if (this.fileGdbExists) {
      console.warn('FileGDB already exists.');
      return;
    }

    if (!this.originalSourceFileExists) {
      throw new Error(
        'FileGDB must be created from an original source file or by extracting from another NYS RIS version.',
      );
    }

    if (!ogr2ogrEnabledFormats?.FileGDB) {
      throw new Error(
        "FileGDB driver not available in the host system's GDAL verion. See buildOSGeoWitFileGdbSupport.",
      );
    }

    const command = `ogr2ogr \
      -skipfailures \
      -nln roadway_inventory_system \
      -F FileGDB \
      ${this.fileGdbPath} \
      ${this.originalSourceGdalVirtualFileSystemPath}`;

    // NOTE: spawnSync preferred, but it created empty GPKGs. Don't know why.
    execSync(command);

    const inDocker = statSync(this.fileGdbPath).uid !== this.ownerUid;

    if (inDocker) {
      chownr(this.fileGdbPath, this.ownerUid, this.ownerGid);
    }

    // Make the FileGDB readonly
    chmodr.sync(this.fileGdbPath, '444');

    spawnSync('zip', ['-r', '-9', `${this.fileGdbPath}.zip`, this.fileGdbPath]);

    if (inDocker) {
      chownr(`${this.fileGdbPath}.zip`, this.ownerUid, this.ownerGid);
    }
  }

  get gpkgPath() {
    const gpkgFileName = `${this.nysRisVersionName}.gpkg`;

    return join(this.nysRisVersionExtractDir, gpkgFileName);
  }

  get gpkgExists() {
    return existsSync(this.gpkgPath);
  }

  // Because executeSQL fails with "Too many features have accumulated in points layer" error,
  //   we create a GPKG so we can get administrative boundaries with executeSQL.
  // See https://gdal.org/drivers/vector/osm.html#interleaved-reading
  createGPKG() {
    if (this.gpkgExists) {
      console.warn('GPKG already exists.');
      return;
    }

    console.log('creating GPKG');

    const input =
      this.fileGdbGdalVirtualFileSystemPath ||
      this.originalSourceGdalVirtualFileSystemPath;

    const command = `ogr2ogr \
      -skipfailures \
      -nln roadway_inventory_system \
      -F GPKG  \
      ${this.gpkgPath} \
      ${input}`;

    // NOTE: spawnSync preferred, but it created empty GPKGs. Don't know why.
    execSync(command);

    if (statSync(this.gpkgPath).uid !== this.ownerUid) {
      statSync(this.fileGdbPath).uid !== this.ownerUid;
    }

    // Make the GPKG readonly.
    chmodSync(this.gpkgPath, '444');
  }
}
