import { z, ZodIssueCode } from 'zod';

export const imageSchema = z
  .instanceof(File)
  .superRefine((file, ctx) => {
    if (!file.type.startsWith('image/')) {
      const extension = file.name.split('.').pop() || '';
      const fileType = file.type || extension;

      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `File type "${fileType}" is not supported. Only image files are allowed.`,
      });
    }
  })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: 'File exceeds 5MB.',
  });
