import { authLimiter } from '@/middleware/security.js';
import express from 'express';
import { courseController } from './course.controller.js';
import { validate } from '@/middleware/validation.js';
import { CreateCourseSchema } from './course.validation.js';

const router = express.Router({ caseSensitive: true });

router.use(authLimiter);

router.post('/create-course', validate(CreateCourseSchema), courseController.createCourse);

export const CourseRoutes = router;
