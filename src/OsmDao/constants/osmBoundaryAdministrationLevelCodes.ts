//  Source: https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative
//  For nyc_consolidated, see
//    https://wiki.openstreetmap.org/wiki/United_States_admin_level#Consolidated_city-counties.2C_Independent_cities

import { OsmAdministrationLevel } from '../domain/types';

const osmBoundaryAdministrationLevelsCodes: Record<
  OsmAdministrationLevel,
  number
> = {
  [OsmAdministrationLevel.state]: 4,
  [OsmAdministrationLevel.nyc_consolidated]: 5,
  [OsmAdministrationLevel.county]: 6,
  [OsmAdministrationLevel.territory]: 6,
  [OsmAdministrationLevel.civil_township]: 7,
  [OsmAdministrationLevel.municipality]: 8,
  [OsmAdministrationLevel.city]: 8,
  [OsmAdministrationLevel.town]: 8,
  [OsmAdministrationLevel.village]: 8,
  [OsmAdministrationLevel.hamlet]: 8,
  [OsmAdministrationLevel.ward]: 9,
  [OsmAdministrationLevel.neighborhood]: 10,
};

export default osmBoundaryAdministrationLevelsCodes;
