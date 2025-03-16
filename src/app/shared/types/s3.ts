export type FileBase = { name: string };
export type SignedFile = FileBase & {
  token: string;
  file: File | Blob | Buffer;
};
