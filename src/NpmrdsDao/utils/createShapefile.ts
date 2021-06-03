import { execSync, spawnSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { dirname, basename } from 'path';

import chmodr from 'chmodr';

import chownr from '../../utils/chownr';

import { ogr2ogrEnabledFormats } from '../../constants/ogr2ogr';

import {
  NpmrdsAdministrationLevel,
  NpmrdsAdministrationAreaName,
} from '../domain/types';

import npmrdsAdminLevelFieldNames from '../constants/npmrdsAdminLevelFieldNames';

import {
  NpmrdsAdministrationLevel,
  NpmrdsAdministrationAreaName,
} from '../domain/types';

type NpmrdsNonStateAdministrationLevel = Omit<
  NpmrdsAdministrationLevel,
  'State'
>;

export type CreateShapefileParams = {
  gdalInputPath: string;
  gdalOutputPath: string;
  uid: number;
  gid: number;
  adminAreaFilter: {
    adminLevel: NpmrdsNonStateAdministrationLevel;
    name: NpmrdsAdministrationAreaName;
  } | null;
};

export default function createShapefile({
  gdalInputPath,
  gdalOutputPath,
  uid,
  gid,
  adminAreaFilter = null,
}: CreateFileGDBParams) {
  if (adminAreaFilter?.adminLevel === NpmrdsAdministrationLevel.State) {
    throw new Error('Cannot create a NYS RIS State level extract.');
  }

  if (existsSync(gdalOutputPath)) {
    console.warn('Shapefile already exists.');
    return;
  }

  if (!ogr2ogrEnabledFormats?.['ESRI Shapefile']) {
    throw new Error(
      "ESRI Shapefile driver not available in the host system's GDAL verion. See buildOSGeoWitFileGdbSupport.",
    );
  }

  let whereClause = '';

  if (adminAreaFilter) {
    // https://gdal.org/user/ogr_sql_dialect.html
    //   the string equality is case insensitive,
    // @ts-ignore
    const fieldName = npmrdsAdminLevelFieldNames[adminAreaFilter.adminLevel];

    whereClause = `-where "${fieldName} = '${adminAreaFilter.name}'"`;
  }

  const command = `ogr2ogr \
      -skipfailures \
      -nln npmrds_shapefile \
      -F 'ESRI Shapefile' \
      ${whereClause} \
      ${gdalOutputPath} \
      ${gdalInputPath}`;

  // NOTE: spawnSync preferred, but it created empty GPKGs. Don't know why.
  execSync(command);

  const inDocker = statSync(gdalOutputPath).uid !== uid;

  if (inDocker) {
    chownr(gdalOutputPath, uid, gid);
  }

  const d = dirname(gdalOutputPath);
  const b = basename(gdalOutputPath);

  spawnSync('zip', ['-r', '-9', `${b}.zip`, b], { cwd: d });

  if (inDocker) {
    chownr(`${gdalOutputPath}.zip`, uid, gid);
  }
}
