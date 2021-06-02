export default function isZipArchive(fpath: string) {
  return /\.zip$/.test(fpath);
}
