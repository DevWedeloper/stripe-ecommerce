import { convertToURLFormat } from '../../../utils/url';

export const redirectToCategory = (path: string) =>
  `/category/${convertToURLFormat(path)}`;
