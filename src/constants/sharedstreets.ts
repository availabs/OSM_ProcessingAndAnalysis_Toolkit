import { join } from 'path';

export const shstBuilderVersion = '0.3.2';

export const shstDataDir = join(__dirname, '../../data/shst');

export const shstBuilderJarPath = join(
  __dirname,
  `../../lib/sharedstreets-builder/sharedstreets-builder-${shstBuilderVersion}.jar`,
);
