import catchAsync from '@/utils/asyncHandler.js';
import ResponseHandler from '@/utils/response.js';
import { courseService } from './course.service.js';

const createCourse = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.createCourse(req);

  ResponseHandler.ok(res, 'Course Created Successfully!', result);
});

export const courseController = {
  createCourse,
};
