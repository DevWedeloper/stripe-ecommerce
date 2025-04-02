export type LocalImageItem = {
  type: 'local';
  id: string;
  url: string;
  file: File;
  order: number;
  isThumbnail: boolean;
};

export type ExistingImageItem = {
  type: 'existing';
  id: number;
  url: string;
  path: string;
  markedForDeletion: boolean;
  order: number;
  isThumbnail: boolean;
};

export type ImageItem = LocalImageItem | ExistingImageItem;
