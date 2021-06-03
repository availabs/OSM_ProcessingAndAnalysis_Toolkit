import { join } from 'path';

import NysRisDao from '.';
import { NysRisAdministrationLevel } from './domain/types';

// const p = join(__dirname, '../../etc_data/nys_ris/RoadwayInventorySystem.zip');

// NysRisDao.assimilateNysRisSource(p);

// const v = 'nys-ris-20200921';

// const dao = new NysRisDao(v);

// dao.createAdministrativeRegionExtract(
// NysRisAdministrationLevel.County,
// 'RENSSELAER',
// );

const v = 'rensselaer-county_nys-ris-20200921';

const dao = new NysRisDao(v);

dao.createGPKG();
