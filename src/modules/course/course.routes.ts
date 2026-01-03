import { generalLimiter, instructorQueryLimiter } from '@/middleware/security.js';
import { validate } from '@/middleware/validation.js';
import express from 'express';
import multer from 'multer';
import { requireInstructor } from '../../middleware/auth.js';
import { courseController } from './course.controller.js';
import { CreateCourseSchema } from './course.validation.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024,
      files: 1
    }
});

const router = express.Router({ caseSensitive: true });

router.use(generalLimiter);

router.post(
  '/create-course',
  requireInstructor,
  validate(CreateCourseSchema),
  courseController.createCourse
);
router.get("/allCourses", requireInstructor, courseController.getAllCoursesForInstructor);
router.get('/course/:courseId', requireInstructor, courseController.getSingleCourseForInstructorView);
router.get('/getAndEditCourse/:courseId', requireInstructor, courseController.getSingleCourseForInstructorEdit);
router.get('/category', courseController.getCategories);
router.get('/slug-check/:slug', courseController.checkCourseSlugAvailability);
router.get(
  '/instructors',
  instructorQueryLimiter,
  requireInstructor,
  courseController.getCourseInstructors
);
router.get('/tags', instructorQueryLimiter, requireInstructor, courseController.getCourseTags);
router.post('/bunny-signature', requireInstructor, courseController.getBunnySignature);
router.post("/file-upload", requireInstructor, (req, res, next) => {
  upload.single('file')(req, res, next);
},courseController.createFileToBunny);

export const CourseRoutes = router;
