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

import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, statSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import _ from 'lodash';

import tar from 'tar';
import unzipper from 'unzipper';

import { ogr2ogrEnabledFormats } from '../../../constants/ogr2ogr';

import { risDataDir } from '../../../constants/nysRis';

import isDirectory from '../../../utils/isDirectory';
import isTarArchive from '../../../utils/isTarArchive';
import isZipArchive from '../../../utils/isZipArchive';

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

async function getGdalVirtualFileSystemPath(nysRisPath: string) {
  if (isTarArchive(nysRisPath)) {
    const dirs = new Set();
    tar.list({
      file: nysRisPath,
      sync: true,
      onentry: (readEntry) => {
        const { type, path } = readEntry;
        // @ts-ignore
        if (type === 'Directory') {
          dirs.add(path);
        }
      },
    });

    if (dirs.size === 0) {
      return `/vsitar/${nysRisPath}`;
    }

    if (dirs.size === 1) {
      const [dir] = [...dirs.values()];

      return `/vsitar/${nysRisPath}/${dir}`;
    }

    throw new Error('More than one subdir in tar archive');
  }

  if (isZipArchive(nysRisPath)) {
    return `/vsizip/${nysRisPath}`;
  }

  return nysRisPath;
}

async function getSourceFormat(nysRisPath: string) {
  const p = await getGdalVirtualFileSystemPath(nysRisPath);

  const { stdout, stderr, status } = spawnSync('ogrinfo', ['-al', '-so', p]);

  if (status !== 0) {
    console.error(stderr.toString());
    throw new Error('GDAL unable to open the NYS RIS source');
  }

  const gdalFormatRE = new RegExp(
    Object.keys(ogr2ogrEnabledFormats)
      .map((f) => `(${f})`)
      .join('|'),
  );

  const [format] = stdout.toString().match(gdalFormatRE);

  return format;
}

async function getLastModifiedDateTime(fpath: string) {
  let latestMtime = null;

  const handleEntryMTime = (mtime: Date) => {
    if (latestMtime === null || mtime > latestMtime) {
      latestMtime = mtime;
    }
  };

  if (isDirectory(fpath)) {
    const files = readdirSync(fpath);

    files.forEach((f) => {
      handleEntryMTime(statSync(join(fpath, f)).mtime);
    });
  } else if (isTarArchive(fpath)) {
    tar.list({
      file: fpath,
      sync: true,
      onentry: (readEntry) => {
        // @ts-ignore
        handleEntryMTime(readEntry.mtime);
      },
    });
  } else if (isZipArchive(fpath)) {
    const directory = await unzipper.Open.file(fpath);
    directory.files.forEach((f) => {
      // @ts-ignore
      handleEntryMTime(f.lastModifiedDateTime);
    });
  }

  if (!latestMtime) {
    return null;
  }

  const timestamp = latestMtime.toISOString().replace(/[^\d]/g, '').slice(0, 8);

  return timestamp;
}

const getNysRisVersionName = async (nysRisPath: string) => {
  const timestamp = await getLastModifiedDateTime(nysRisPath);

  if (timestamp === null) {
    throw new Error(
      'Unable to get a LastModifiedDateTime from the NYS RIS source.',
    );
  }

  return `nys-ris-${timestamp}`;
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

  const origSrcDir = join(dir, 'original_source');
  mkdirSync(origSrcDir, { recursive: true });

  const dest = join(origSrcDir, bname);

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

  if (isDirectory(nysRisPath)) {
    spawnSync('zip', ['-r', '-9', `${bname}.zip`, bname], { cwd: origSrcDir });
    spawnSync('rm', ['-rf', bname], { cwd: origSrcDir });
  }
}

export default async function assimilateNysRisSource(nysRisPath: string) {
  verifySourceExists(nysRisPath);
  validateNysRisSourceFormat(nysRisPath);

  const sourceFormat = await getSourceFormat(nysRisPath);
  console.log(sourceFormat);

  const nysRisVersionName = await getNysRisVersionName(nysRisPath);

  const dir = makeNysRisVersionDataDirectory(nysRisVersionName);

  copyOriginalSourceToNysRisVersionDataDir(nysRisPath, dir);
}
