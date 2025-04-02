import { moveItemInArray } from '@angular/cdk/drag-drop';
import { WritableSignal } from '@angular/core';
import { getS3ImageUrl } from 'src/app/shared/utils/image-object';
import { ImageObjectWithThumbnail } from 'src/db/data-access/product/get-user-product-by-id';
import { environment } from 'src/environments/environment';
import { z } from 'zod';
import { imageSchema } from '../schema/file';
import { ExistingImageItem, ImageItem, LocalImageItem } from '../types/image';
import { createName } from '../../../../../shared/utils/name';

export const mapImageObjectsToExistingImages = (
  images: ImageObjectWithThumbnail[],
): ExistingImageItem[] =>
  images
    .sort((a, b) => a.order - b.order)
    .map((image) => ({
      type: 'existing',
      id: image.id,
      url: getS3ImageUrl({
        path: image.imagePath,
        bucketName: environment.productImagesS3Bucket,
      }),
      path: image.imagePath,
      markedForDeletion: false,
      isThumbnail: image.isThumbnail,
      order: image.order,
    }));

export const mapFilesToLocalImages = (files: File[]): LocalImageItem[] =>
  files.map((file) => ({
    type: 'local',
    id: createName(file),
    url: URL.createObjectURL(file),
    file,
    order: 0,
    isThumbnail: false,
  }));

export const sortItems = <T>(
  itemsSignal: WritableSignal<T[]>,
  previousIndex: number,
  currentIndex: number,
) => {
  itemsSignal.update((currentItems) => {
    moveItemInArray(currentItems, previousIndex, currentIndex);
    return [...currentItems];
  });
};

export const setThumbnail = <
  T extends { id: string | number; isThumbnail: boolean },
>(
  itemsSignal: WritableSignal<T[]>,
  id: string | number,
) => {
  itemsSignal.update((currentItems) =>
    currentItems.map((item) => ({
      ...item,
      isThumbnail: item.id === id,
    })),
  );
};

export const addFiles = (
  files: File[],
  imageItemsSignal: WritableSignal<ImageItem[]>,
  selectedFilesErrorSignal: WritableSignal<string | null>,
  filterFn?: (item: ImageItem) => boolean,
): void => {
  const { success, data, error } = z.array(imageSchema).safeParse(files);

  if (!success) {
    selectedFilesErrorSignal.set(error.issues[0].message);
    return;
  }

  const currentImageItems = filterFn
    ? imageItemsSignal().filter(filterFn)
    : imageItemsSignal();

  if (currentImageItems.length + data.length > 10) {
    selectedFilesErrorSignal.set(`You can only upload up to 10 images.`);
    return;
  }

  selectedFilesErrorSignal.set(null);

  const modifiedImageItems = mapFilesToLocalImages(data);

  imageItemsSignal.update((current) => [...current, ...modifiedImageItems]);
};

export const deleteItem = <T extends { id: string | number; url: string }>(
  itemsSignal: WritableSignal<T[]>,
  item: T,
): void => {
  itemsSignal.update((current) =>
    current.filter((image) => image.id !== item.id),
  );
  URL.revokeObjectURL(item.url);
};
