import tar from 'tar';

import isTarArchive from './isTarArchive';
import isZipArchive from './isZipArchive';

export default function getGdalVirtualFileSystemPath(nysRisPath: string) {
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
