export const AVATAR_SIZES = {
  original: { width: 250, height: 250 },
  icon: { width: 48, height: 48 },
} as const;

export const getAvatarPath = (
  path: string,
  size: keyof typeof AVATAR_SIZES = 'original',
) => {
  return `${size}/${path}`;
};
