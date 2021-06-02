//  Source: https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative
//  For nyc_consolidated, see
//    https://wiki.openstreetmap.org/wiki/United_States_admin_level#Consolidated_city-counties.2C_Independent_cities

export enum NysRisAdministrationLevel {
  State = 'state',
  County = 'county',
  UrbanArea = 'urban-area',
  MPO = 'mpo',
}

export type NysRisAdministrationAreaName = string;

export type NysRisVersionExtractName = string;
