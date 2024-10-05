const convertToURLFormat = (name: string) => name.replace(/\s+/g, '-');

export const redirectToCategory = (path: string) =>
  `/category/${convertToURLFormat(path.toLowerCase())}`;
