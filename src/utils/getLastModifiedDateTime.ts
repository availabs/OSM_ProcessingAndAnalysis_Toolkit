import { statSync, readdirSync } from 'fs';
import { join } from 'path';

import tar from 'tar';
import unzipper from 'unzipper';

import isDirectory from './isDirectory';
import isTarArchive from './isTarArchive';
import isZipArchive from './isZipArchive';

export default async function getLastModifiedDateTime(fpath: string) {
  let latestMtime = null;

  const handleEntryMTime = (mtime: Date) => {
    // @ts-ignore
    if (latestMtime === null || mtime > latestMtime) {
      // @ts-ignore
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

  // @ts-ignore
  const timestamp = latestMtime.toISOString().replace(/[^\d]/g, '').slice(0, 8);

  return timestamp;
}
