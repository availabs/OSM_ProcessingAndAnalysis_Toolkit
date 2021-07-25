import { spawnSync } from 'child_process';

import { totalmem } from 'os';

import {
  mkdirSync,
  writeFileSync,
  existsSync,
  chmodSync,
  rmdirSync,
  readdirSync,
  openSync,
} from 'fs';

import { join, basename } from 'path';

import prettyBytes from 'pretty-bytes';

import isValidOsmVersionExtractName from '../utils/isValidOsmVersionExtractName';

import OsmDao from '../OsmDao';

import {
  shstDataDir,
  shstBuilderJarPath,
  shstBuilderVersion,
} from '../constants/sharedstreets';

export type CreateSharedStreetsTilesetParams = {
  maximumMemoryAllocation: string;
};

const ROAD_CLASS_LEVEL = 8;

const defaultCreateTilesetMaxMem = prettyBytes(totalmem() / 4)
  .replace(/\.\d{1,}/, '')
  .replace(/ /g, '')
  .replace(/B$/, '');

export default class ShstBuilder {
  static getOsmExtractShstDir(extractName: string) {
    return join(shstDataDir, extractName);
  }

  static getExtractTilesetDirectoryPath(extractName: string) {
    return join(
      ShstBuilder.getOsmExtractShstDir(extractName),
      'shst/.shst/cache/tiles/osm/',
      extractName,
    );
  }

  protected readonly osmDao: OsmDao;

  protected readonly extractShstDir: string;
  protected readonly extractTilesetDirPath: string;

  constructor(readonly osmVersionExtractName: string) {
    if (!isValidOsmVersionExtractName(osmVersionExtractName)) {
      throw new Error(
        `Invalid osmVersionExtractName: ${osmVersionExtractName}`,
      );
    }

    this.osmDao = new OsmDao(osmVersionExtractName);

    this.extractShstDir = ShstBuilder.getOsmExtractShstDir(
      this.osmVersionExtractName,
    );

    this.extractTilesetDirPath = ShstBuilder.getExtractTilesetDirectoryPath(
      this.osmVersionExtractName,
    );
  }

  get tilesetExists() {
    if (!existsSync(this.extractTilesetDirPath)) {
      return false;
    }

    return readdirSync(this.extractTilesetDirPath).length > 0;
  }

  get haveShstBuilder() {
    return existsSync(shstBuilderJarPath);
  }

  downloadSharedStreetsBuilder() {
    if (this.haveShstBuilder) {
      return;
    }

    const downloaderScript = join(__dirname, 'downloadSharedStreetsBuilder');

    const builderVersionName = basename(shstBuilderJarPath, '.jar');
    console.log(`Downloading ${builderVersionName} from GitHub.`);

    spawnSync(downloaderScript, {
      stdio: ['inherit', 'inherit', 'inherit'],
      env: { ...process.env, SHST_BLDR_VERSION: shstBuilderVersion },
    });
  }

  createSharedStreetsTileset({
    maximumMemoryAllocation = defaultCreateTilesetMaxMem,
  } = {}) {
    if (this.tilesetExists) {
      throw new Error(
        `SharedStreets Tileset aleady exists at ${this.extractTilesetDirPath}`,
      );
    }

    if (!existsSync(this.osmDao.pbfFilePath)) {
      throw new Error(
        `Error OSM PBF File ${this.osmDao.pbfFilePath} does not exist.`,
      );
    }

    mkdirSync(this.extractShstDir, { recursive: true });
    rmdirSync(this.extractTilesetDirPath, { recursive: true });

    const logPath = join(this.extractShstDir, 'shst_tileset_build.log');
    const logFileFd = openSync(logPath, 'w');

    this.downloadSharedStreetsBuilder();

    console.log(`Creating tileset in ${this.extractShstDir}`);

    const args = [
      `-Xmx${maximumMemoryAllocation}`,
      '-jar',
      shstBuilderJarPath,
      '--roadClass',
      `${ROAD_CLASS_LEVEL}`,
      '--input',
      this.osmDao.pbfFilePath,
      '--output',
      this.extractTilesetDirPath,
    ];

    spawnSync('java', args, {
      stdio: ['inherit', logFileFd, logFileFd],
    });

    const metadataPath = join(
      this.extractShstDir,
      'shst_tileset_build_metadata.json',
    );

    writeFileSync(
      metadataPath,
      JSON.stringify(
        {
          tileset_build_timestamp: Math.floor(Date.now() / 1000),
          shst_osm_tile_source: this.osmVersionExtractName,
          shst_builder_version: shstBuilderVersion,
        },
        null,
        4,
      ),
    );

    chmodSync(logPath, '444');
    chmodSync(metadataPath, '444');
  }
}
