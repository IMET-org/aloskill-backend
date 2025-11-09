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
    googleId: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']),
    avatarUrl: z.string().optional(),
    bio: z.string().max(150, 'Bio must be less than 150 characters').optional(),
    phoneNumber: z.string().max(14, 'Phone Number must be less than 14 characters').optional(),
  }),
});

export const InstructorProfileSchema = z.object({
  displayName: z.string().min(3, 'Display name must be at least 3 characters long.').regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed for display name.'),
  DOB: z.coerce
    .date({
      error: 'Date of Birth is required.',
    })
    .max(new Date(), 'DOB cannot be in the future.')
    .refine(date => {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      return date <= eighteenYearsAgo;
    }, 'Instructor must be at least 18 years old.'),
  gender: z.enum(['MALE', 'FEMALE']),
  nationality: z.string().min(2, 'Nationality is required.').regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed for nationality.'),
  // == Contact Info
  phoneNumber: z.string().min(11, 'Phone data is required.'),
  address: z
    .string()
    .min(5, 'Address is required.')
    .max(255, `Address cannot exceed 255 characters.`),
  city: z.string().min(2, 'City is required.').max(20, `City cannot exceed 20 characters.`),
  // == Professional Info
  qualifications: z.string().min(5, 'Qualifications details are required.'),
  experience: z.number().min(0).max(50).default(0),
  expertise: z.string().min(3).optional().nullable(),
  currentOrg: z.string().min(3).optional().nullable(),
  // == Course Info
  proposedCourse: z.string().min(5, 'Proposed course title is required.'),
  courseLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  courseType: z.enum(['LIVE', 'PRE_RECORDED', 'HYBRID', 'SELF_STUDY']),
  courseInfo: z.string().min(20, 'Detailed course information is required.'),
  duration: z.string().min(5, "Course duration is required (e.g., '10 weeks', '40 hours')."),
  proposedPrice: z.number().min(0, 'Proposed price must be positive.').max(9999.99),
  // == Content & Teaching Skills
  teachingExperience: z.number().min(0).max(50).optional().default(0),
  prevTeachingApproach: z.enum([
    'ACTIVITY_BASED',
    'LECTURE_BASED',
    'FLIPPED_CLASSROOM',
    'PROJECT_BASED',
  ]),
  language: z.string().min(2, 'Teaching language is required.'),
  demoVideo: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: 'Demo video must be a valid URL (including https protocol).',
    })
    .optional()
    .nullable(),
  // == Others Info
  bio: z.string().min(10).optional().nullable(),
  skills: z
    .array(
      z
        .string({ error: 'Skills must be an array of strings' })
        .min(3, 'Each skill must have at least 3 characters')
    )
    .optional(),
  website: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: 'Website must be a valid URL (including https protocol).',
    })
    .optional()
    .nullable(),
  socialAccount: z
    .array(
      z.object({
        platform: z.string().min(1, 'Social platform name is required.'),
        url: z.url({
          protocol: /^https?$/,
          hostname: z.regexes.domain,
          error: 'Social URL must be a valid URL (including https protocol).',
        }),
      })
    )
    .optional(),
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
