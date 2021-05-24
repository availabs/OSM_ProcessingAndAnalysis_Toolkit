//  Source: https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative
//  For nyc_consolidated, see
//    https://wiki.openstreetmap.org/wiki/United_States_admin_level#Consolidated_city-counties.2C_Independent_cities

import { AdministrationLevel } from '../domain/types';

const osmBoundaryAdministrationLevelsCodes: Record<
  AdministrationLevel,
  number
> = {
  [AdministrationLevel.state]: 4,
  [AdministrationLevel.nyc_consolidated]: 5,
  [AdministrationLevel.county]: 6,
  [AdministrationLevel.territory]: 6,
  [AdministrationLevel.civil_township]: 7,
  [AdministrationLevel.municipality]: 8,
  [AdministrationLevel.city]: 8,
  [AdministrationLevel.town]: 8,
  [AdministrationLevel.village]: 8,
  [AdministrationLevel.hamlet]: 8,
  [AdministrationLevel.ward]: 9,
  [AdministrationLevel.neighborhood]: 10,
};

export default osmBoundaryAdministrationLevelsCodes;
