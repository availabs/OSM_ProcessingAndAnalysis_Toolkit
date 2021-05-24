export default (extractRegionName: string) =>
  /^[a-z0-9-]{1,}$/.test(extractRegionName);
