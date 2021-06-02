import RisDao from '.';
import { NysRisAdministrationLevel } from './domain/types';

const v = 'nys-ris-20190524';
// const v = 'albany-county_nys-ris-20190524';

const dao = new RisDao(v);

// dao.createFileGDB();
// dao.createGPKG();

dao.createAdministrativeRegionExtract(NysRisAdministrationLevel.MPO, 'CDTC');
