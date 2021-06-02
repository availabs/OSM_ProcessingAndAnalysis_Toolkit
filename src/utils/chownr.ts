import { statSync, readdirSync, chownSync } from 'fs';
import { join } from 'path';

const chownrDirectory = (path: string, uid: number, gid: number) => {
  readdirSync(path).forEach((f) => {
    const p = join(path, f);
    chownSync(p, uid, gid);
  });

  chownSync(path, uid, gid);
};

export default function chownr(path: string, uid: number, gid: number) {
  if (statSync(path).isDirectory()) {
    return chownrDirectory(path, uid, gid);
  }

  chownSync(path, uid, gid);
}
