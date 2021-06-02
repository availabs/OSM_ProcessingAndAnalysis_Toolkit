import assimilateNysRisSource from '.';

const nysRisPath =
  '/home/paul/AVAIL/avail-map-conflation-platform/data/ris/RISDuplicate.2019.gdb';
// '/home/paul/AVAIL/avail-map-conflation-platform/data/ris/RISDuplicate.2019.gdb.zip';
// '/home/paul/AVAIL/avail-map-conflation-platform/data/ris/RISDuplicate.2019.gdb.tgz';
// '/home/paul/AVAIL/avail-map-conflation-platform/data/npmrds/2019/npmrds_shapefile.2019';
// '/home/paul/AVAIL/avail-map-conflation-platform/data/npmrds/2019/npmrds_shapefile.2019.tgz';

assimilateNysRisSource(nysRisPath);
