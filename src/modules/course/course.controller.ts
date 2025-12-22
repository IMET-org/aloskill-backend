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

const getCourseInstructors = catchAsync(async (req, res): Promise<void> => {
  const result = (await courseService.getCourseInstructors(req)) as
    | {
        id: string;
        displayName: string;
        user: {
          avatarUrl?: string;
        };
      }[]
    | [];
  ResponseHandler.ok(
    res,
    'Course instructors fetched successfully',
    result.map(user => {
      return {
        userId: user.id,
        displayName: user.displayName,
        avatarUrl: user.user.avatarUrl,
      };
    })
  );
});

const getCourseTags = catchAsync(async (req, res): Promise<void> => {
  const result = (await courseService.getCourseTags(req)) as
    | {
        id: string;
        name: string;
        _count: {
          courses: number;
        };
      }[]
    | [];
  ResponseHandler.ok(
    res,
    'Course instructors fetched successfully',
    result.map(tag => {
      return {
        id: tag.id,
        name: tag.name,
        totalCourses: tag._count.courses,
      };
    })
  );
});

const getBunnySignature = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.getBunnySignature(req);
  ResponseHandler.ok(res, 'Bunny signature generated', result);
});

export const courseController = {
  getBunnySignature,
  createCourse,
  getCategories,
  checkCourseSlugAvailability,
  getCourseInstructors,
  getCourseTags,
};
