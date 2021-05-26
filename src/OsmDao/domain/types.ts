//  Source: https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative
//  For nyc_consolidated, see
//    https://wiki.openstreetmap.org/wiki/United_States_admin_level#Consolidated_city-counties.2C_Independent_cities

export enum OsmAdministrationLevel {
  state = 'state',
  nyc_consolidated = 'nyc_consolidated',
  county = 'county',
  territory = 'territory',
  civil_township = 'civil_township',
  municipality = 'municipality',
  city = 'city',
  town = 'town',
  village = 'village',
  hamlet = 'hamlet',
  ward = 'ward',
  neighborhood = 'neighborhood',
}

export type OsmAdministrationAreaName = string;
