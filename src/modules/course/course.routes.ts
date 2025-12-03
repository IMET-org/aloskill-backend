import { generalLimiter } from '@/middleware/security.js';
import { validate } from '@/middleware/validation.js';
import express from 'express';
import { courseController } from './course.controller.js';
import { CreateCourseSchema } from './course.validation.js';

const router = express.Router({ caseSensitive: true });

router.use(generalLimiter);

router.post('/create-course', validate(CreateCourseSchema), courseController.createCourse);
router.get('/category', courseController.getCategories);
router.get('/slug-check/:slug', courseController.checkCourseSlugAvailability);

export const CourseRoutes = router;
