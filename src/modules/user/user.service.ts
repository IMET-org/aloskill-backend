/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { executeDbOperation } from '@/config/database.js';
import { type Request } from 'express';

const LOGIN_USER_SELECT = {
  id: true,
  email: true,
  avatarUrl: true,
  assignedRole: {
    select: {
      role: true,
    },
  },
  studentProfile: {
    select: {
      displayName: true,
    },
  },
  instructorProfile: {
    select: {
      displayName: true,
    },
  },
};

const buildUserProfile = (user: {
  id: string;
  email: string;
  avatarUrl: string | null;
  assignedRole: { role: string }[];
  studentProfile?: { displayName: string } | null;
  instructorProfile?: { displayName: string } | null;
  emailVerificationTokenHash?: string | null;
  passwordResetTokenHash?: string | null;
}) => ({
  id: user.id,
  email: user.email,
  role: user.assignedRole.map(data => data.role),
  displayName: user.studentProfile?.displayName ?? user.instructorProfile?.displayName,
  profilePicture: user.avatarUrl,
  emailVerificationToken: user.emailVerificationTokenHash,
  passwordResetToken: user.passwordResetTokenHash,
});

const getSingleUser = async (req: Request) => {
  const data = req.params;
  if (!data.email) {
    throw new Error('Email Not provided');
  }

  const user = await executeDbOperation(async prisma => {
    return await prisma.user.findUnique({
      where: { email: data.email },
      select: LOGIN_USER_SELECT,
    });
  });

  if (!user) {
    throw new Error('User does not exist');
  }

  if (user.instructorProfile) {
    throw new Error('Instructor Profile already exists');
  }

  return {
    canProceed: true,
  };
};

export const userService = {
  getSingleUser,
};
