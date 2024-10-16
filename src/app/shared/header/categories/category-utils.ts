import { convertToURLFormat } from '../../utils';

export const redirectToCategory = (path: string) =>
  `/category/${convertToURLFormat(path)}`;
