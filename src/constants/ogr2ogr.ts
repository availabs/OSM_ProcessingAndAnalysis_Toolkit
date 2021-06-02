import { execSync } from 'child_process';

import hasbin from 'hasbin';

const ogr2ogrIsInstalled = hasbin.sync('ogr2ogr');

export const ogr2ogrVersion = ogr2ogrIsInstalled
  ? // @ts-ignore
    execSync('ogr2ogr --version', { stdio: ['ignore'] })
      .toString()
      .match(/\d{1,}\.\d{1,}\.\d{1,}/)[0]
  : null;

const dataFormatRE = /(-raster)|(-vector)/;

export const ogr2ogrEnabledFormats: Record<string, string> = ogr2ogrIsInstalled
  ? execSync('ogr2ogr --formats', { stdio: ['ignore'] })
      .toString()
      .split(/\n/)
      .filter((f) => dataFormatRE.test(f))
      .reduce((acc, format) => {
        const driver = format.replace(/ -.*/g, '').trim();
        const descr = format.replace(/^.*\):/, '').trim();

        acc[driver] = descr;

        return acc;
      }, {})
  : {};
