/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { executeDbOperation } from '@/config/database.js';
import { ApplicationStatus, UserStatus } from '@prisma/client';
import { type Request } from 'express';
import type { CreateCoursePayload } from './course.validation.js';

const createCourse = async (req: Request) => {
  const { body: data } = req.body as CreateCoursePayload;
  const instructor = req.user;

  if (!Array.isArray(data.modules)) {
    throw new Error('Modules not provided for Course Creation');
  }
  if (!Array.isArray(data.modules[0].lessons)) {
    throw new Error('Lessons not provided for Course Creation');
  }
  if (!data.createdById) {
    throw new Error('Instructor ID not provided for Course Creation');
  }

  const instructorExists = await executeDbOperation(async prisma => {
    return await prisma.user.findUnique({
      where: {
        email: instructor.email,
        status: UserStatus.ACTIVE,
        instructorProfile: {
          status: ApplicationStatus.APPROVED,
        },
      },
      select: {
        id: true,
        instructorProfile: {
          select: {
            displayName: true,
          },
        },
      },
    });
  });

  if (!instructorExists) {
    throw new Error(`Instructor with email ${instructor.email} does not exist Or not approved yet`);
  }

  if (instructorExists.id !== data.createdById) {
    throw new Error('You are not authorized to create this course');
  }

  const { modules, courseInstructors, ...restData } = data;

  const course = await executeDbOperation(async prisma => {
    return await prisma.course.create({
      data: {
        ...restData,
        modules: {
          create: modules.map(moduleData => ({
            ...moduleData,
            lessons: {
              createMany: {
                data: moduleData.lessons,
                skipDuplicates: true,
              },
            },
          })),
        },
        courseInstructors: {
          createMany: {
            data: courseInstructors ?? [],
            skipDuplicates: true,
          },
        },
      },
      select: {
        id: true,
        title: true,
        modules: {
          select: {
            title: true,
            lessons: {
              select: {
                title: true,
                duration: true,
              },
            },
          },
        },
      },
    });
  });

  return course;
};

export const courseService = {
  createCourse,
};
