import { lstatSync } from 'fs';

export default function isDirectory(fpath: string) {
  return lstatSync(fpath).isDirectory();
}
