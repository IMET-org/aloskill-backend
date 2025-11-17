import catchAsync from '@/utils/asyncHandler.js';
import ResponseHandler from '@/utils/response.js';
import { courseService } from './course.service.js';

const createCourse = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.createCourse(req);

  ResponseHandler.ok(res, 'Course Created Successfully!', result);
});

const getCategories = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.getCategories();
  ResponseHandler.ok(res, 'Categories fetched successfully!', result);
});

const checkCourseSlugAvailability = catchAsync(async (req, res): Promise<void> => {
  const { slug } = req.params;
  const isAvailable = await courseService.isCourseSlugAvailable(slug);

  if (isAvailable) {
    ResponseHandler.ok(res, 'Course slug is available');
  } else {
    ResponseHandler.badRequest(res, 'Course slug is already taken');
  }
});

export const courseController = {
  createCourse,
  getCategories,
  checkCourseSlugAvailability,
};
