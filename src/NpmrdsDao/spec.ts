// import { join } from 'path';

import NpmrdsDao from '.';
import { NpmrdsAdministrationLevel } from './domain/types';

// const origShpPath = join(
// __dirname,
// '../../etc_data/npmrds/npmrds_shapefile.2019.tgz',
// );

// NpmrdsDao.assimilateSourceNpmrdsShapefile('ny', 2019, origShpPath);

// const v = 'ny-npmrds-shapefile-2019-20190628';

// const dao = new NpmrdsDao(v);

// dao.createAdministrativeRegionExtract(
// NpmrdsAdministrationLevel.County,
// 'Albany',
// );

const v = 'albany-county_ny-npmrds-shapefile-2019-20190628';

const dao = new NpmrdsDao(v);

// dao.createFileGDB();
dao.createGPKG();
