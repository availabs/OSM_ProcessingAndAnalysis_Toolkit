import OsmExtractDao from '.';

const v = 'ualbany-uptown-campus_albany-county-new-york-200910';

const dao = new OsmExtractDao(v);

console.log(dao.layers);
dao.createShapefile();
