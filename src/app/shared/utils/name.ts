export const createName = (
  input: File | Blob,
) => {
  const getExtension = () => {
    switch (true) {
      case input instanceof File:
        return input.type.split('/')[1];

      case input instanceof Blob && !!input.type:
        return input.type.split('/')[1] || 'bin';

      default:
        console.warn('File has no type or format.');
        return 'bin';
    }
  };

  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${getExtension()}`;
};
