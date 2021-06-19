import { join } from 'path';

import NysRisDao from '.';
import { NysRisAdministrationLevel } from './domain/types';

(async () => {
  // const years = [2016, 2017, 2018, 2019];
  const years = [2019];

  for (const year of years) {
    const tstamp = `${year}0000`;

    const p = join(
      __dirname,
      `../../unassimilated_data/NysRoadwayInventorySystem/nys-roadway-inventory-system-v${tstamp}.gdb.zip`,
    );

    await NysRisDao.assimilateNysRisSource(p, tstamp);

    const v = `nys-roadway-inventory-system-v${tstamp}`;

    const dao = new NysRisDao(v);

    dao.createAdministrativeRegionExtract(
      NysRisAdministrationLevel.County,
      'YATES',
    );
    dao.createFileGDB();
  }
})();
