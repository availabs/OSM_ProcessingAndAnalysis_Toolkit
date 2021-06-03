import tar from 'tar';

import isTarArchive from './isTarArchive';
import isZipArchive from './isZipArchive';

export default function getGdalVirtualFileSystemPath(gdalInputPath: string) {
  if (isTarArchive(gdalInputPath)) {
    const dirs = new Set();
    tar.list({
      file: gdalInputPath,
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
      return `/vsitar/${gdalInputPath}`;
    }

    if (dirs.size === 1) {
      const [dir] = [...dirs.values()];

      return `/vsitar/${gdalInputPath}/${dir}`;
    }

    throw new Error('More than one subdir in tar archive');
  }

  if (isZipArchive(gdalInputPath)) {
    // I could not find a npm library to get the ZIP archive contents synchronously.
    // This will do it if the need arises:
    //   zipinfo cdtc-mpo_nys-ris-20190524.gdb.zip | grep -e '^d.*\/$' | awk '{ print $(NF) }'
    return `/vsizip/${gdalInputPath}`;
  }

  return gdalInputPath;
}
