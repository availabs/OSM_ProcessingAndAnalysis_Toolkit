export default function isTarArchive(fpath: string) {
  return /(\.tar$)|(\.tgz$)|(\.tar\.gz$)/.test(fpath);
}
