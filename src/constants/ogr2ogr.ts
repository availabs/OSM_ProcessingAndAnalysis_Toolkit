import { execSync } from 'child_process';

import hasbin from 'hasbin';

const ogr2ogrIsInstalled = hasbin.sync('ogr2ogr');

export const ogr2ogrVersion = ogr2ogrIsInstalled
  ? execSync('ogr2ogr --version', { stdio: ['ignore'] })
      .toString()
      .match(/\d{1,}\.\d{1,}\.\d{1,}/)[0]
  : null;
