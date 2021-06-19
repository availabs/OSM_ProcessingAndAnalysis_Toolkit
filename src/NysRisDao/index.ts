import { execSync } from 'child_process';
import { existsSync, chmodSync, readdirSync, mkdirSync, statSync } from 'fs';

import { join } from 'path';

import { risDataDir } from '../constants/nysRis';

import getGdalVirtualFileSystemPath from '../utils/getGdalVirtualFileSystemPath';
import isDirectory from '../utils/isDirectory';
import cleanName from '../utils/cleanName';
import chownr from '../utils/chownr';

import assimilateNysRisSource from './utils/assimilateNysRisSource';
import createFileGdb from './utils/createFileGdb';

import {
  NysRisAdministrationLevel,
  NysRisAdministrationAreaName,
  NysRisVersionExtractName,
} from './domain/types';

type NysRisNonStateAdministrationLevel = Omit<
  NysRisAdministrationLevel,
  'State'
>;

export default class NysRisDao {
  static assimilateNysRisSource = assimilateNysRisSource;
  protected static createFileGdb = createFileGdb;

  static getExtractDirectoryPath(extractName: NysRisVersionExtractName) {
    return join(risDataDir, extractName);
  }

  static getFileGdbPath(nysRisVersionName: NysRisVersionExtractName) {
    const dir = NysRisDao.getExtractDirectoryPath(nysRisVersionName);
    const fileName = `${nysRisVersionName}.gdb`;

    return join(dir, fileName);
  }

  static getAdministrativeAreaExtractNamePrefix(
    adminLevel: NysRisNonStateAdministrationLevel,
    name: string,
  ) {
    return cleanName(`${name}-${adminLevel}`);
  }

  static isValidNysRisExtractName(nysRisVersion: string) {
    return /^[a-z0-9_-]*nys-roadway-inventory-system-v\d{8}$/.test(
      nysRisVersion,
    );
  }

  static getExtractNameForAdministrativeRegion(
    adminLevel: NysRisNonStateAdministrationLevel,
    name: NysRisAdministrationAreaName,
    sourceName: NysRisVersionExtractName,
  ) {
    if (!NysRisDao.isValidNysRisExtractName(sourceName)) {
      throw new Error('Invalid sourceName');
    }

    const prefix = NysRisDao.getAdministrativeAreaExtractNamePrefix(
      adminLevel,
      name,
    );

    return `${prefix}_${sourceName}`;
  }

  readonly nysRisVersionExtractDir: string;

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

    const archives = origSrcDirFiles.filter((f) =>
      // @ts-ignore
      isDirectory(join(this.originalSourceDirectoryPath, f)),
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

  get fileGdbPath() {
    return NysRisDao.getFileGdbPath(this.nysRisVersionName);
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
      return this.fileGdbPath;
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

    if (this.fileGdbExists) {
      return this.fileGdbPath;
    }

    if (this.fileGdbZipExists) {
      return this.fileGdbZipPath;
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

    NysRisDao.createFileGdb({
      // @ts-ignore
      gdalInputPath: this.originalSourceGdalVirtualFileSystemPath,
      fileGdbPath: this.fileGdbPath,
      uid: this.ownerUid,
      gid: this.ownerGid,
    });
  }

  createAdministrativeRegionExtract(
    adminLevel: NysRisNonStateAdministrationLevel,
    name: NysRisAdministrationAreaName,
  ) {
    const extractName = NysRisDao.getExtractNameForAdministrativeRegion(
      adminLevel,
      name,
      this.nysRisVersionName,
    );

    const extractDirPath = NysRisDao.getExtractDirectoryPath(extractName);

    if (existsSync(extractDirPath)) {
      throw new Error(
        `NYS RIS Version Extract directory already exists at ${extractDirPath}`,
      );
    }

    mkdirSync(extractDirPath, { recursive: true });

    const extractFileGdbPath = NysRisDao.getFileGdbPath(extractName);
    console.log(extractName);
    console.log(extractFileGdbPath);

    const input =
      this.fileGdbGdalVirtualFileSystemPath ||
      this.originalSourceGdalVirtualFileSystemPath;

    NysRisDao.createFileGdb({
      // @ts-ignore
      gdalInputPath: input,
      fileGdbPath: extractFileGdbPath,
      uid: this.ownerUid,
      gid: this.ownerGid,
      adminAreaFilter: { adminLevel, name },
    });

    chownr(extractDirPath, this.ownerUid, this.ownerGid);
  }

  get gpkgPath() {
    const gpkgFileName = `${this.nysRisVersionName}.gpkg`;

    return join(this.nysRisVersionExtractDir, gpkgFileName);
  }

  get gpkgExists() {
    return existsSync(this.gpkgPath);
  }

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
