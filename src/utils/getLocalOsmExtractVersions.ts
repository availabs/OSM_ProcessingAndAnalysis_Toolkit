import {readdirSync} from 'fs';

import osmDir from '../constants/osmDataDir';
import isValidOsmVersionExtractName from './isValidOsmVersionExtractName';

const issuedWarning: Set<string> = new Set();

export default function getLocalOsmExtractVersions() {
  const osmDirEntries = readdirSync(osmDir, {withFileTypes: true});

  const validNamedOsmVersionExtracts = osmDirEntries.filter(dirent => {
    const {name: dirName} = dirent;

    if (!dirent.isDirectory()) {
      if (!issuedWarning.has(dirName)) {
        console.warn(
          'data/osm SHOULD contain ONLY OSM Extract Version directories. File', dirName, 'does not belong there.'
        );
        issuedWarning.add(dirName);
      }
      return false;
    }

    if (isValidOsmVersionExtractName(dirName)) {
      return true;
    }

    if (!issuedWarning.has(dirName)) {
      console.warn(
        dirName, 'is not a valid OSM Extract Version dirName.'
      );
      issuedWarning.add(dirName);
    }

    return false;
  }).sort();

  return validNamedOsmVersionExtracts;
}
