async function getSourceFormat(npmrdsShpPath: string) {
  const p = await getGdalVirtualFileSystemPath(npmrdsShpPath);

  const { stdout, stderr, status } = spawnSync('ogrinfo', ['-al', '-so', p]);

  if (status !== 0) {
    console.error(stderr.toString());
    throw new Error('GDAL unable to open the NYS RIS source');
  }

  const gdalFormatRE = new RegExp(
    Object.keys(ogr2ogrEnabledFormats)
      .map((f) => `(${f})`)
      .join('|'),
  );

  // @ts-ignore
  const [format] = stdout.toString().match(gdalFormatRE);

  return format;
}
