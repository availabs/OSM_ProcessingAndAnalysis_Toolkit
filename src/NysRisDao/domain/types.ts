//  Source: https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative
//  For nyc_consolidated, see
//    https://wiki.openstreetmap.org/wiki/United_States_admin_level#Consolidated_city-counties.2C_Independent_cities

export enum NysRisAdministrationLevel {
  state = 'state',
  county = 'county',
  urban_area = 'urban_area',
  mpo = 'mpo',
}

export type NysRisAdministrationAreaName = string;
