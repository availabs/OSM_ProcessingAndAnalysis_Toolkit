import { AdministrationLevel } from '../domain/types';

export default function getExtractName(
  name: string,
  adminLevel: AdministrationLevel,
) {
  const n = name
    .toLowerCase()
    .replace(new RegExp(adminLevel, 'i'), '')
    .replace(/[^a-z0-9_-]{1,}/g, '_')
    .replace(/_{1,}/, '_');

  return `${n}-${adminLevel}`;
}
