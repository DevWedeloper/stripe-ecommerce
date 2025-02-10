import { encode } from 'blurhash';
import { createCanvas, Image } from 'canvas';

const loadImage = async (src: string): Promise<Image> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (...args) => reject(args);
    img.src = src;
  });

const getImageData = (image: Image): ImageData => {
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get 2D context');
  }

  context.drawImage(image, 0, 0);

  return context.getImageData(
    0,
    0,
    image.width,
    image.height,
  ) as unknown as ImageData;
};

export const generatePlaceholder = async (
  imageUrl: string,
): Promise<string> => {
  const image = await loadImage(imageUrl);
  const imageData = getImageData(image);

  return encode(imageData.data, imageData.width, imageData.height, 4, 4);
};
