/*
  Steps:
      1. Verify GDAL can open the RIS Source
      2. Get last modified date
          a. Preferably from internal last modified
          b. Else from latest file modification timestamp
      3. Copy to a canonical directory for version
          a. If dir already exists, throw
          b. If dir does not already exists
            i.  put nysRisSourceFile in an original-source directory
*/

import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import _ from 'lodash';

import { risDataDir } from '../../constants/nysRis';

import isDirectory from '../../utils/isDirectory';
import isTarArchive from '../../utils/isTarArchive';
import isZipArchive from '../../utils/isZipArchive';

import getLastModifiedDateTime from '../../utils/getLastModifiedDateTime';

function verifySourceExists(nysRisPath: string) {
  if (!existsSync(nysRisPath)) {
    throw new Error(`NYS RIS source file does not exists: ${nysRisPath}`);
  }
}

function validateNysRisSourceFormat(nysRisPath: string) {
  if (
    !(
      isDirectory(nysRisPath) ||
      isTarArchive(nysRisPath) ||
      isZipArchive(nysRisPath)
    )
  ) {
    throw new Error(
      'ERROR: The NYS RIS source must be a directory, tar archive, or zip archive.',
    );
  }
}

function validateProvidedNysRisVersionTimestamp(
  nysRisVersionTimestamp: string,
) {
  if (!/\d{8}/.test(nysRisVersionTimestamp)) {
    throw new Error(
      `The provided NYS RIS version timestamp ${nysRisVersionTimestamp} does not follow the YYYYMMDD format`,
    );
  }
}

const getNysRisVersionName = async (
  nysRisPath: string,
  nysRisVersionTimestamp: string | null = null,
) => {
  const timestamp =
    nysRisVersionTimestamp || (await getLastModifiedDateTime(nysRisPath));

  if (timestamp === null) {
    throw new Error(
      'Unable to get a LastModifiedDateTime from the NYS RIS source.',
    );
  }

  return `nys-roadway-inventory-system-v${timestamp}`;
};

function makeNysRisVersionDataDirectory(nysRisVersionName: string) {
  const dir = join(risDataDir, nysRisVersionName);

  if (existsSync(dir)) {
    throw new Error(`ERROR: directory already exists ${dir}`);
  }

  mkdirSync(dir, { recursive: true });

  return dir;
}

function copyOriginalSourceToNysRisVersionDataDir(
  nysRisPath: string,
  dir: string,
) {
  const bname = basename(nysRisPath);

  const assimilatedDir = join(dir, 'original_source');
  mkdirSync(assimilatedDir, { recursive: true });

  const dest = join(assimilatedDir, bname);

  const { stderr, status } = spawnSync('cp', [
    '-r',
    '--preserve',
    nysRisPath,
    dest,
  ]);

  if (status !== 0) {
    console.error(stderr);
    throw new Error('Unable to copy the NYS RIS source');
  }

  // The GDAL FileGDB driver does not support virtual file systems.
  //   https://gdal.org/user/virtual_file_systems.html#drivers-supporting-virtual-file-systems
  //   We need the uncompressed directory.
  //   TODO: Should test if ogr2ogr can open before uncompressing.
  if (isDirectory(nysRisPath)) {
    spawnSync('zip', ['-r', '-9', `${bname}.zip`, bname], {
      cwd: assimilatedDir,
    });
  } else if (isTarArchive(nysRisPath)) {
    spawnSync('tar', ['-zxf', bname], {
      cwd: assimilatedDir,
    });
  } else if (isZipArchive(nysRisPath)) {
    spawnSync('unzip', [bname], {
      cwd: assimilatedDir,
    });
  }
}

export default async function assimilateNysRisSource(
  nysRisPath: string,
  nysRisVersionTimestamp: string | null = null,
) {
  verifySourceExists(nysRisPath);
  validateNysRisSourceFormat(nysRisPath);

  if (nysRisVersionTimestamp) {
    validateProvidedNysRisVersionTimestamp(nysRisVersionTimestamp);
  }

  const nysRisVersionName = await getNysRisVersionName(
    nysRisPath,
    nysRisVersionTimestamp,
  );

  const dir = makeNysRisVersionDataDirectory(nysRisVersionName);

  copyOriginalSourceToNysRisVersionDataDir(nysRisPath, dir);
}
