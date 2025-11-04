import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
    password: z.string().optional(),
    googleId: z.string().optional(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    displayName: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .optional(),
    role: z.enum(['STUDENT', 'INSTRUCTOR']),
    googleId: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']),
    avatarUrl: z.string().optional(),
    bio: z.string().max(150, 'Bio must be less than 150 characters').optional(),
    phoneNumber: z.string().max(14, 'Phone Number must be less than 14 characters').optional(),
  }),
});

export const verifyUserSchema = z.object({
  body: z.object({
    id: z.string('ID is required'),
    token: z.string('Token is required'),
  }),
});

export const resendVerificationEmailSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
  }),
});

export const forgotSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
  }),
});

export const resetSchema = z.object({
  body: z
    .object({
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
      confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    })
    .refine(data => data.password === data.confirmPassword, { message: "Passwords don't match" }),
  query: z.object({
    id: z.string('ID is required'),
    token: z.string('Token is required'),
  }),
});

