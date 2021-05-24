//  Source: https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative
//  For nyc_consolidated, see
//    https://wiki.openstreetmap.org/wiki/United_States_admin_level#Consolidated_city-counties.2C_Independent_cities

import { AdministrationLevel } from "../domain/types";

const osmBoundaryAdministrationLevelsCodes: Record<
  AdministrationLevel,
  number
> = {
  state: 4,
  nyc_consolidated: 5,
  county: 6,
  territory: 6,
  civil_township: 7,
  municipality: 8,
  city: 8,
  town: 8,
  village: 8,
  hamlet: 8,
  ward: 9,
  neighborhood: 10,
};

export default osmBoundaryAdministrationLevelsCodes;
