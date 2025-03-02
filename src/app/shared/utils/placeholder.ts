import { encode } from 'blurhash';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const loadImage = async (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (...args) => reject(args);
    img.src = src;
  });

const getImageData = (image: HTMLImageElement): ImageData => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get 2D context');
  }

  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
};

const generatePlaceholder = async (imageUrl: string): Promise<string> => {
  const image = await loadImage(imageUrl);
  const imageData = getImageData(image);

  return encode(imageData.data, imageData.width, imageData.height, 4, 4);
};

export const fileToPlaceholder = async (file: File): Promise<string> => {
  const base64 = await fileToBase64(file);
  return generatePlaceholder(base64);
};
