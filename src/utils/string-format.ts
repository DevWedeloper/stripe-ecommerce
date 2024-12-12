export const toTitleCase = (name: string) =>
  name
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
