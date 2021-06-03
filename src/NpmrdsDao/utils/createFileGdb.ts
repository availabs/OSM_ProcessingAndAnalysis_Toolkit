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

import npmrdsShpAdminLevelFieldNames from '../constants/npmrdsAdminLevelFieldNames';

type NpmrdsNonStateAdministrationLevel = Omit<
  NpmrdsAdministrationLevel,
  'State'
>;

type CreateFileGDBParams = {
  gdalInputPath: string;
  gdalOutputPath: string;
  uid: number;
  gid: number;
  adminAreaFilter?: {
    adminLevel: NpmrdsNonStateAdministrationLevel;
    name: NpmrdsAdministrationAreaName;
  } | null;
};

export default function createFileGDB({
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
    console.warn('FileGDB already exists.');
    return;
  }

  if (!ogr2ogrEnabledFormats?.FileGDB) {
    throw new Error(
      "FileGDB driver not available in the host system's GDAL verion. See buildOSGeoWitFileGdbSupport.",
    );
  }

  let whereClause = '';

  if (adminAreaFilter) {
    const fieldName =
      // @ts-ignore
      npmrdsShpAdminLevelFieldNames[adminAreaFilter.adminLevel];

    // https://gdal.org/user/ogr_sql_dialect.html
    //   Most of the operators are self explanatory, but it is worth noting
    //   that != is the same as <>, the string equality is case insensitive,
    //   but the <, >, <= and >= operators are case sensitive.
    whereClause = `-where "${fieldName} = '${adminAreaFilter.name}'"`;
  }

  const command = `ogr2ogr \
      -skipfailures \
      -nln npmrds_shapefile \
      -F FileGDB \
      ${whereClause} \
      ${gdalOutputPath} \
      ${gdalInputPath}`;

  // NOTE: spawnSync preferred, but it created empty GPKGs. Don't know why.
  execSync(command);

  const inDocker = statSync(gdalOutputPath).uid !== uid;

  if (inDocker) {
    chownr(gdalOutputPath, uid, gid);
  }

  // Make the FileGDB readonly
  chmodr.sync(gdalOutputPath, '444');

  const d = dirname(gdalOutputPath);
  const b = basename(gdalOutputPath);

  spawnSync('zip', ['-r', '-9', `${b}.zip`, b], { cwd: d });

  if (inDocker) {
    chownr(`${gdalOutputPath}.zip`, uid, gid);
  }
}
