import { z } from 'zod';

export const positiveIntSchema = z.number().int().positive();
