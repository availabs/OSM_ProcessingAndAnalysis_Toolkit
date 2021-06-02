export default (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9_-]{1,}/g, '-')
    .replace(/-{1,}/, '-');
