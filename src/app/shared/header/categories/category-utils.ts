const convertToURLFormat = (name: string) => name.replace(/\s+/g, '-');

export const redirectToCategory = (path: string) =>
  `/products/category/${convertToURLFormat(path.toLowerCase())}`;
