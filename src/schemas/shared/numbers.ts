import { z } from 'zod';

export const intSchema = z.number().int();
export const positiveIntSchema = z.number().int().positive();
