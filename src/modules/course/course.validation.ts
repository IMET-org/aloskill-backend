import { CourseStatus } from '@prisma/client';
import { z } from 'zod';

const courseLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'LessonTitle must be at least 5 characters long')
    .max(150, 'LessonTitle cannot exceed 150 characters')
    .regex(
      /^[\w\s\p{P}&\-]+$/u,
      'LessonTitle contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed.'
    ),
  content: z
    .string()
    .trim()
    .min(5, 'Content must be at least 5 characters long')
    .max(150, 'Title cannot exceed 150 characters')
    .regex(
      /^[\w\s\p{P}&\-]+$/u,
      'Contant contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed.'
    ),
  type: z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'ASSIGNMENT']),
  contentUrl: z
    .url('Content url Must be a valid URL format (e.g., starting with http:// or https://)')
    .optional()
    .nullable(),
  duration: z
    .number('Duration must be a number')
    .int('Duration Must be a int value')
    .positive('Duration Must be positive')
    .optional()
    .nullable(),
  position: z.number('Position must be an integer').int().positive(),
});

const courseModuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters long')
    .max(150, 'Title cannot exceed 150 characters')
    .regex(
      /^[\w\s\p{P}&\-]+$/u,
      'Title contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed.'
    ),
  position: z.number('Position must be an integer').int().positive(),
  lessons: z.array(courseLessonSchema).nonempty('At least one lesson is required'),
});

const courseInstructorsSchema = z.object({
  instructorId: z.uuid({ message: 'Invalid Instructor Id' }),
  role: z.enum(['PRIMARY', 'CO_INSTRUCTOR']),
});

export const CreateCourseSchema = z.object({
  body: z
    .object({
      createdById: z.uuid({ message: 'Invalid User Id' }),
      categoryId: z.uuid({ message: 'Invalid Category Id' }),
      title: z
        .string()
        .trim()
        .min(5, 'Title must be at least 5 characters long')
        .max(150, 'Title cannot exceed 150 characters')
        .regex(
          /^[\w\s\p{P}&\-]+$/u,
          'Title contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed.'
        ),
      slug: z
        .string()
        .min(3, 'Slug must be at least 3 characters long')
        .max(100, 'Slug cannot exceed 100 characters')
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'Slug must be lowercase, use hyphens instead of spaces, and contain no special characters.'
        ),
      shortDesc: z
        .string()
        .trim()
        .min(10, 'Short description must be at least 10 characters long')
        .max(500, 'Short description cannot exceed 500 characters')
        .regex(/^[^<>]*$/, 'shortDesc must not contain any opening or closing HTML tags'),
      description: z
        .string()
        .trim()
        .min(10, 'Description must be at least 10 characters long')
        .regex(/^[^<>]*$/, 'Description must not contain any opening or closing HTML tags'),
      originalPrice: z
        .number()
        .multipleOf(0.01)
        .min(0, 'Original price must be non-negative')
        .max(9999.99, 'Price cannot exceed 9999.99'),
      discountPercent: z.number().int().min(0).max(100).default(0).optional(),
      discountPrice: z
        .number()
        .multipleOf(0.01)
        .min(0, 'Discount price must be non-negative')
        .max(9999.99, 'Discount Price cannot exceed 9999.99')
        .optional()
        .nullable(),
      discountEndDate: z
        .date()
        .min(new Date(), { message: 'Discount end date must be in the future or present.' })
        .optional()
        .nullable(),
      isDiscountActive: z.boolean().default(false),
      currency: z.enum(['BDT', 'USD']).default('BDT'),
      status: z.enum(CourseStatus).default(CourseStatus.DRAFT),
      language: z.enum(['ENGLISH', 'BANGLA']).default('ENGLISH').optional(),
      thumbnailUrl: z
        .url('Must be a valid URL format (e.g., starting with http:// or https://)')
        .max(500)
        .regex(
          /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
          'URL format is invalid or contains prohibited characters.'
        )
        .optional()
        .nullable(),
      modules: z.array(courseModuleSchema).nonempty('At least one module is required'),
      courseInstructors: z.array(courseInstructorsSchema).optional(),
    })
    .superRefine(({ discountPercent, discountPrice, originalPrice }, ctx) => {
      if (
        (discountPercent === undefined) !==
        (discountPrice === null || discountPrice === undefined)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Both "discountPercent" and "discountPrice" should either be provided together or neither should be provided.',
          path: [],
        });
      }
      if (discountPrice && discountPrice >= originalPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Discount price must be strictly less than the original price.',
          path: ['discountPrice'],
        });
      }
    }),
});

export type CreateCoursePayload = z.infer<typeof CreateCourseSchema>;
