export type CropperData = {
  image: File;
  width: number;
  height: number;
};

export type CropperResult = {
  blob: Blob;
  imageUrl: string;
};
