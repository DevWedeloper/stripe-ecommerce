export const convertToURLFormat = (name: string) =>
  name.replace(/\s+/g, '-').toLowerCase();
