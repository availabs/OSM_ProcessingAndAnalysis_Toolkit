import { execSync, spawnSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { dirname, basename } from 'path';

import chmodr from 'chmodr';

import chownr from '../../utils/chownr';

import { ogr2ogrEnabledFormats } from '../../constants/ogr2ogr';

import nysRisAdminLevelFieldNames from '../constants/nysRisAdminLevelFieldNames';

import {
  NysRisAdministrationLevel,
  NysRisAdministrationAreaName,
} from '../domain/types';

type NysRisNonStateAdministrationLevel = Omit<
  NysRisAdministrationLevel,
  'State'
>;

export type CreateFileGDBParams = {
  gdalInputPath: string;
  fileGdbPath: string;
  uid: number;
  gid: number;
  adminAreaFilter: {
    adminLevel: NysRisNonStateAdministrationLevel;
    name: NysRisAdministrationAreaName;
  } | null;
};

export default function _createFileGDB({
  gdalInputPath,
  fileGdbPath,
  uid,
  gid,
  adminAreaFilter = null,
}: CreateFileGDBParams) {
  if (adminAreaFilter?.adminLevel === NysRisAdministrationLevel.State) {
    throw new Error('Cannot create a NYS RIS State level extract.');
  }

  if (existsSync(fileGdbPath)) {
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
    // https://gdal.org/user/ogr_sql_dialect.html
    //   Most of the operators are self explanatory, but it is worth noting
    //   that != is the same as <>, the string equality is case insensitive,
    //   but the <, >, <= and >= operators are case sensitive.

    // @ts-ignore
    const fieldName = nysRisAdminLevelFieldNames[adminAreaFilter.adminLevel];

    whereClause = `-where "${fieldName} = '${adminAreaFilter.name}'"`;
  }

  const command = `ogr2ogr \
      -skipfailures \
      -t_srs 'EPSG:4326' \
      -nln roadway_inventory_system \
      -F FileGDB \
      ${whereClause} \
      ${fileGdbPath} \
      ${gdalInputPath}`;

  // NOTE: spawnSync preferred, but it created empty GPKGs. Don't know why.
  execSync(command);

  const inDocker = statSync(fileGdbPath).uid !== uid;

  if (inDocker) {
    chownr(fileGdbPath, uid, gid);
  }

  // Make the FileGDB readonly
  chmodr.sync(fileGdbPath, '444');

  const d = dirname(fileGdbPath);
  const b = basename(fileGdbPath);

  spawnSync('zip', ['-r', '-9', `${b}.zip`, b], { cwd: d });

  if (inDocker) {
    chownr(`${fileGdbPath}.zip`, uid, gid);
  }
}
