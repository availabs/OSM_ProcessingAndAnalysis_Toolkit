import isValidOsmVersionNumber from './isValidOsmVersionNumber';
import isValidExtractAreaName from './isValidExtractAreaName';

export default function (osmVersionExtractName: string) {
  const osmVersionNumberMatch = osmVersionExtractName.match(/\d{6}$/);
  const osmVersionNumber = osmVersionNumberMatch && osmVersionNumberMatch[0];

  // must end with 6-digit OSM version number
  if (!(osmVersionNumber && isValidOsmVersionNumber(osmVersionNumber))) {
    return false;
  }

  // Dash must preceed OSM version number
  if (!/-\d{6}$/.test(osmVersionExtractName)) {
    return null;
  }

  const extractAreas = osmVersionExtractName.replace(/-\d{6}/, '').split(/_/);

  return extractAreas.every((e) => isValidExtractAreaName(e));
}
