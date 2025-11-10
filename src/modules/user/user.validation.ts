import { z } from 'zod';

export const getSingleUserSchema = z.object({
  params: z.object({
    email: z.email('Invalid email address'),
  }),
});
