import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
<<<<<<< HEAD
    email: z.email('Invalid email address').includes('@gmail.com'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
=======
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    googleId: z.string().optional(),
>>>>>>> 9336b8479e039cf93f88af490909248d1d57f515
  }),
});

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(3, 'firstName must be at least 3 characters'),
    lastName: z.string().min(3, 'lastName must be at least 3 characters'),
    email: z.email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .optional(),
    role: z.enum(['STUDENT', 'INSTRUCTOR']).optional(),
    googleId: z.string().optional(),
    profilePicture: z.string().optional(),
    bio: z.string().max(150, 'Bio must be less than 150 characters').optional(),
    phoneNumber: z.string().max(14, 'Phone Number must be less than 14 characters').optional(),
  }),
});
