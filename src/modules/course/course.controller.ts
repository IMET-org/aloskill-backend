import catchAsync from '@/utils/asyncHandler.js';
import ResponseHandler from '@/utils/response.js';
import { courseService } from './course.service.js';

const createCourse = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.createCourse(req);

  ResponseHandler.ok(res, 'Course Created Successfully!', result);
});

const getAllCoursesForInstructor = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.getAllCoursesForInstructor(req);
  ResponseHandler.ok(res, 'All Courses Fetched Successfully!', result);
});

const getSingleCourseForInstructorView = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.getSingleCourseForInstructorView(req);
  ResponseHandler.ok(res, 'Course fetched successfully!', result);
});

const getSingleCourseForInstructorEdit = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.getSingleCourseForInstructorEdit(req);
  ResponseHandler.ok(res, 'Course fetched successfully!', result);
});

const getCategories = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.getCategories();
  ResponseHandler.ok(res, 'Categories fetched successfully!', result);
});

const checkCourseSlugAvailability = catchAsync(async (req, res): Promise<void> => {
  const { slug } = req.params;
  const isAvailable = await courseService.isCourseSlugAvailable(slug);

  if (isAvailable) {
    ResponseHandler.ok(res, 'Course slug is available', {canProceed: true});
  } else {
    ResponseHandler.ok(res, 'Course slug is already taken', {canProceed: false});
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

const createFileToBunny = catchAsync(async (req, res): Promise<void> => {
  const result = await courseService.createFileToBunny(req);
  ResponseHandler.ok(res, 'File created in bunny storage', result);
});

export const courseController = {
  getBunnySignature,
  createCourse,
  getAllCoursesForInstructor,
  getCategories,
  checkCourseSlugAvailability,
  getCourseInstructors,
  getCourseTags,
  createFileToBunny,
  getSingleCourseForInstructorView,
  getSingleCourseForInstructorEdit
};
