/*
  Steps:
      1. Verify GDAL can open the RIS Source
      2. Get last modified date
          a. Preferably from internal last modified
          b. Else from latest file modification timestamp
      3. Copy to a canonical directory for version
          a. If dir already exists, throw
          b. If dir does not already exists
            i.  put npmrdsShpSourceFile in an original-source directory
*/

import { spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import _ from 'lodash';

import { npmrdsDataDir } from '../../constants/npmrds';

import isDirectory from '../../utils/isDirectory';
import isTarArchive from '../../utils/isTarArchive';
import isZipArchive from '../../utils/isZipArchive';

import getLastModifiedDateTime from '../../utils/getLastModifiedDateTime';

function verifySourceExists(npmrdsShpPath: string) {
  if (!existsSync(npmrdsShpPath)) {
    throw new Error(`NYS RIS source file does not exists: ${npmrdsShpPath}`);
  }
}

function validateNpmrdsSourceFormat(npmrdsShpPath: string) {
  if (
    !(
      isDirectory(npmrdsShpPath) ||
      isTarArchive(npmrdsShpPath) ||
      isZipArchive(npmrdsShpPath)
    )
  ) {
    throw new Error(
      'ERROR: The NYS RIS source must be a directory, tar archive, or zip archive.',
    );
  }
}

const getNpmrdsVersionName = async (
  state: string,
  year: number,
  npmrdsShpPath: string,
) => {
  if (!/^[a-z]{2}$/i.test(state)) {
    throw new Error('State must be the two character abbreviation.');
  }

  if (!/^\d{4}$/.test(`${year}`)) {
    throw new Error('Year must be a 4 digit number.');
  }

  const timestamp = await getLastModifiedDateTime(npmrdsShpPath);

  if (timestamp === null) {
    throw new Error(
      'Unable to get a LastModifiedDateTime from the NYS RIS source.',
    );
  }

  return `${state.toLowerCase()}-npmrds-shapefile-${year}-${timestamp}`;
};

function makeNpmrdsVersionDataDirectory(npmrdsShpVersionName: string) {
  const dir = join(npmrdsDataDir, npmrdsShpVersionName);

  if (existsSync(dir)) {
    throw new Error(`ERROR: directory already exists ${dir}`);
  }

  mkdirSync(dir, { recursive: true });

  return dir;
}

function copyOriginalSourceToNpmrdsVersionDataDir(
  npmrdsShpPath: string,
  dir: string,
) {
  const bname = basename(npmrdsShpPath);

  const assimilatedDir = join(dir, 'original_source');
  mkdirSync(assimilatedDir, { recursive: true });

  const dest = join(assimilatedDir, bname);

  const { stderr, status } = spawnSync('cp', [
    '-r',
    '--preserve',
    npmrdsShpPath,
    dest,
  ]);

  if (status !== 0) {
    console.error(stderr);
    throw new Error('Unable to copy the NYS RIS source');
  }

  if (isDirectory(npmrdsShpPath)) {
    spawnSync('zip', ['-r', '-9', `${bname}.zip`, bname], {
      cwd: assimilatedDir,
    });
    spawnSync('rm', ['-rf', bname], { cwd: assimilatedDir });
  }
}

export default async function assimilateSourceNpmrdsShapefile(
  state: string,
  year: number,
  npmrdsShpPath: string,
) {
  verifySourceExists(npmrdsShpPath);
  validateNpmrdsSourceFormat(npmrdsShpPath);

  const npmrdsShpVersionName = await getNpmrdsVersionName(
    state,
    year,
    npmrdsShpPath,
  );

  const dir = makeNpmrdsVersionDataDirectory(npmrdsShpVersionName);

  // FIXME: Need to preserve ownership in case called in Docker.
  copyOriginalSourceToNpmrdsVersionDataDir(npmrdsShpPath, dir);
}
