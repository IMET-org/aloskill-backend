/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable require-await */

import { executeDbOperation } from '@/config/database.js';
import getClientInfo from '@/utils/getClientInfo.js';
import { hash, verifyHash } from '@/utils/hashing.js';
import { UserStatus } from '@prisma/client';
import crypto from 'crypto';
import type { Request } from 'express';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

const LOGIN_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  profilePicture: true,
};

const buildUserProfile = (user: {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  profilePicture: user.profilePicture,
});

const generateRefreshToken = () => {
  const token = crypto.randomBytes(64).toString('hex');

  return {
    token,
    hashedToken: crypto.createHash('sha256').update(token).digest('hex'),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
  };
};

const hashRefreshToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const loginUser = async (req: Request) => {
  const data = req.body;
  const { userAgent, ipAddress } = getClientInfo(req);
  const { token: refreshToken, hashedToken, expiresAt } = generateRefreshToken();

  // Validate login method
  if (data.password && data.googleId) {
    throw new Error('Cannot use both password and Google ID');
  }
  if (!data.password && !data.googleId) {
    throw new Error('Invalid Login Method');
  }

  const user = await executeDbOperation(async prisma => {
    return prisma.user.findUnique({
      where: { email: data.email },
      include: { refreshTokens: true },
    });
  });

  // -------- GOOGLE LOGIN FLOW --------
  if (data.googleId) {
    if (user) {
      // Verify Google ID matches if already exists
      if (user.googleId && user.googleId !== data.googleId) {
        throw new Error('Google ID mismatch for existing user');
      }

      // Update lastLogin and store Google ID if missing
      const updatedUser = await executeDbOperation(async prisma => {
        return prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: user.googleId ?? data.googleId,
              lastLogin: new Date(),
              lastLoginIP: ipAddress,
            },
            select: LOGIN_USER_SELECT,
          }),
          prisma.refreshToken.upsert({
            where: { userId_userAgent_ipAddress: { userId: user.id, userAgent, ipAddress } },
            update: { token: hashedToken, expiresAt },
            create: { userId: user.id, userAgent, ipAddress, token: hashedToken, expiresAt },
          }),
        ]);
      }, 'Update Google ID User');

      const [updatedProfile] = updatedUser;

      return {
        user: buildUserProfile(updatedProfile),
        refreshToken,
      };
    }
    // User does not exist → create new Google user
    const newGoogleUser = await executeDbOperation(async prisma => {
      return prisma.user.create({
        data: {
          ...data,
          googleId: data.googleId,
          isEmailVerified: true,
          status: UserStatus.ACTIVE,
          lastLogin: new Date(),
          lastLoginIP: ipAddress,
          refreshTokens: {
            create: { token: hashedToken, expiresAt, userAgent, ipAddress },
          },
        },
        select: {
          ...LOGIN_USER_SELECT,
          refreshTokens: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
    }, 'Create Google User');

    return {
      user: buildUserProfile(newGoogleUser),
      refreshToken,
    };
  }

  // -------- PASSWORD LOGIN FLOW --------
  if (data.password) {
    if (!user) {
      throw new Error('User does not exist');
    }
    if (!user.password) {
      throw new Error('Invalid login method');
    }
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email');
    }
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new Error(`Account locked. Try again after ${user.lockUntil.toLocaleTimeString()}`);
    }

    const isPasswordValid = await verifyHash(data.password, user.password);
    if (!isPasswordValid) {
      const failedAttempt = await executeDbOperation(async prisma => {
        return prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: { increment: 1 },
            ...(user.loginAttempts + 1 >= 5 && {
              lockUntil: new Date(Date.now() + 30 * 60 * 1000),
            }),
          },
        });
      }, 'Update failed login attempts');

      throw new Error(
        failedAttempt.lockUntil
          ? `Account locked. Try again after ${failedAttempt.lockUntil.toLocaleTimeString()}`
          : 'Incorrect password'
      );
    }

    // Device limit check
    if (user.refreshTokens.length >= 3) {
      throw new Error('Device limit exceeded');
    }

    const updatedUser = await executeDbOperation(async prisma => {
      return prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date(), lastLoginIP: ipAddress, loginAttempts: 0 },
          select: LOGIN_USER_SELECT,
        }),
        prisma.refreshToken.upsert({
          where: { userId_userAgent_ipAddress: { userId: user.id, userAgent, ipAddress } },
          update: { token: hashedToken, expiresAt },
          create: { userId: user.id, userAgent, ipAddress, token: hashedToken, expiresAt },
        }),
      ]);
    }, 'Update Password User');

    const [updatedProfile] = updatedUser;

    return {
      user: buildUserProfile(updatedProfile),
      refreshToken,
    };
  }

  throw new Error('Invalid login payload');
};

const registerUser = async (req: Request) => {
  const data = req.body;
  const { password, googleId } = data;
  if (!password && !googleId) {
    throw new Error('Password or Google ID must be provided');
  }
  if (password && googleId) {
    throw new Error('Cannot use both password and Google ID');
  }

  const { token: refreshToken, hashedToken, expiresAt } = generateRefreshToken();
  const userInfo = getClientInfo(req);

  const existingUser = await executeDbOperation(async prisma => {
    return prisma.user.findUnique({
      where: {
        // OR: [{ email: data.email ?? '' }, { googleId: data.googleId ?? '' }],
        email: data.email,
      },
      include: {
        refreshTokens: true,
      },
    });
  }, 'User Exist');

  if (!existingUser) {
    if (password) {
      const hashedPassword = await hash(password as string);
      data.password = hashedPassword;
      data.emailVerificationToken = crypto.randomBytes(64).toString('hex');
      data.emailVerificationExpires = new Date(Date.now() + 6 * 60 * 60 * 1000);
    }
    if (googleId) {
      data.isEmailVerified = true;
      data.status = UserStatus.ACTIVE;
    }

    const user = await executeDbOperation(async prisma => {
      return prisma.user.create({
        data: {
          ...data,
          lastLogin: new Date(),
          lastLoginIP: userInfo.ipAddress,
          refreshTokens: {
            create: {
              token: hashedToken,
              expiresAt,
              ...userInfo,
            },
          },
        },
        select: LOGIN_USER_SELECT,
      });
    }, 'create user');
    return {
      user: buildUserProfile(user),
      refreshToken,
    };
  }

  if (password) {
    if (existingUser.password) {
      throw new Error('User already exists');
    }
    const updateUserWithPassword = await executeDbOperation(async prisma => {
      return prisma.$transaction([
        prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            password: await hash(password as string),
          },
          select: LOGIN_USER_SELECT,
        }),
        prisma.refreshToken.upsert({
          where: {
            userId_userAgent_ipAddress: {
              userId: existingUser.id,
              userAgent: userInfo.userAgent,
              ipAddress: userInfo.ipAddress,
            },
          },
          update: {
            token: hashedToken,
            expiresAt,
          },
          create: {
            userId: existingUser.id,
            userAgent: userInfo.userAgent,
            ipAddress: userInfo.ipAddress,
            token: hashedToken,
            expiresAt,
          },
        }),
      ]);
    }, 'Update Password User');

    const [updatedProfile] = updateUserWithPassword;

    return {
      user: buildUserProfile(updatedProfile),
      refreshToken,
    };
  }

  if (googleId) {
    if (existingUser.googleId) {
      throw new Error('User already exists');
    }

    // CHANGED: ensure we use hashedToken when saving refresh token (previously used raw refreshToken)
    const updateUserWithGoogleID = await executeDbOperation(async prisma => {
      return prisma.$transaction([
        prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            googleId: googleId as string,
            emailVerificationToken: null,
            emailVerificationExpires: null,
            isEmailVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: LOGIN_USER_SELECT,
        }),
        prisma.refreshToken.upsert({
          where: {
            userId_userAgent_ipAddress: {
              userId: existingUser.id,
              userAgent: userInfo.userAgent,
              ipAddress: userInfo.ipAddress,
            },
          },
          update: {
            token: hashedToken, // CHANGED: was refreshToken (raw) before — now hashed
            expiresAt,
          },
          create: {
            userId: existingUser.id,
            userAgent: userInfo.userAgent,
            ipAddress: userInfo.ipAddress,
            token: hashedToken, // CHANGED: was refreshToken (raw) before — now hashed
            expiresAt,
          },
        }),
      ]);
    }, 'Update Google ID User');

    // CHANGED: return same shape as other branches (profile + raw refreshToken)
    const [updatedProfile] = updateUserWithGoogleID;
    return {
      user: buildUserProfile(updatedProfile),
      refreshToken,
    };
  }
};

const verifyUser = async (req: Request) => {
  const { id, token } = req.body;

  if (!id || typeof id !== 'string') {
    throw new Error('Invalid User');
  }

  if (!token || typeof token !== 'string') {
    throw new Error('Invalid Token');
  }

  const user = await executeDbOperation(async prisma => {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  });

  if (!user) {
    throw new Error('User Does Not Exist');
  } else {
    if (user.emailVerificationToken !== token) {
      throw new Error('Invalid Verification Link');
    } else {
      if (new Date(user.emailVerificationExpires as unknown as number) < new Date()) {
        throw new Error('Link Expired');
      } else {
        const updateUser = await executeDbOperation(async prisma => {
          return prisma.user.update({
            where: {
              id,
            },
            data: {
              isEmailVerified: true,
              status: UserStatus.ACTIVE,
              emailVerificationToken: null,
              emailVerificationExpires: null,
            },
          });
        }, 'Verify Email');
        return updateUser;
      }
    }
  }
};

const resendVerificationEmail = async (req: Request) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email address');
  }

  const user = await executeDbOperation(async prisma => {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isEmailVerified) {
    throw new Error('Email is already verified');
  }

  const verificationToken = crypto.randomUUID();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const updatedUser = await executeDbOperation(async prisma => {
    return prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        status: UserStatus.PENDING_VERIFICATION,
      },
    });
  }, 'Resend Verification Email');

  return updatedUser;
};

const forgotPassword = async (req: Request) => {
  const { email } = req.body;

  const user = await executeDbOperation(async prisma => {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }, 'find User in forgot password');

  if (!user) {
    throw new Error('User Does Not Exist');
  } else {
    if (!user.password) {
      throw new Error('User not registered');
    } else if (!user.isEmailVerified) {
      throw new Error('Please Verify Your Email first');
    } else {
      const refreshToken = crypto.randomBytes(64).toString('hex');

      const forgotPasswordUser = await executeDbOperation(async prisma => {
        return prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            passwordResetToken: refreshToken,
            passwordResetExpires: new Date(Date.now() + 6 * 60 * 60 * 1000),
          },
        });
      }, 'Forgot Password');
      return forgotPasswordUser;
    }
  }
};

const resetPassword = async (req: Request) => {
  const { confirmPassword } = req.body;
  const { id, token } = req.query;

  const user = await executeDbOperation(async prisma => {
    return prisma.user.findUnique({
      where: {
        id: id as string,
      },
    });
  }, 'find User in Reset Password');

  if (!user) {
    throw new Error('User Not Found');
  }
  if (user.passwordResetToken !== token) {
    throw new Error('Invalid Reset Token');
  } else {
    if (new Date(user.passwordResetExpires as unknown as number) < new Date()) {
      throw new Error('Password Reset Link Expired');
    } else {
      const hashedConfirmPassword = await hash(confirmPassword as string);
      const updatedUser = await executeDbOperation(async prisma => {
        return prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: hashedConfirmPassword,
            passwordChangedAt: new Date(),
            passwordResetToken: null,
            passwordResetExpires: null,
          },
        });
      }, 'updatedUser in Reset Password');
      return updatedUser;
    }
  }
};
const changePassword = async (req: Request) => {
  const { id, token, oldPassword, newPassword } = req.body;

  const user = await executeDbOperation(async prisma => {
    return prisma.user.findUnique({
      where: {
        id: id as string,
      },
    });
  }, 'find User in Reset Password');

  if (!user) {
    throw new Error('User Not Found');
  }
  if (user.passwordResetToken !== token) {
    throw new Error('Invalid Reset Token');
  } else {
    if (new Date(user.passwordResetExpires as unknown as number) < new Date()) {
      throw new Error('Password Reset Link Expired');
    } else {
      const isOldPasswordValid = await verifyHash(oldPassword as string, user.password as string);
      if (!isOldPasswordValid) {
        throw new Error('Invalid Old Password');
      } else {
        const hashedNewPassword = await hash(newPassword as string);
        const updatedUser = await executeDbOperation(async prisma => {
          return prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              password: hashedNewPassword,
              passwordChangedAt: new Date(),
              passwordResetToken: null,
              passwordResetExpires: null,
            },
          });
        }, 'updatedUser in Reset Password');
        return updatedUser;
      }
    }
  }
};
// === Logout from current device ===
const logoutCurrentDevice = async (req: Request) => {
  const refreshToken = req.cookies?.refreshToken;
  console.log('refresh from service hit logout', refreshToken);
  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new Error('Invalid refresh token');
  }

  // CHANGED: Hash the incoming raw refresh token before looking it up in DB.
  // Stored tokens in DB are hashed (we save hashedToken on creation).
  const hashed = hashRefreshToken(refreshToken); // ADDED

  const tokenRecord = await executeDbOperation(async prisma => {
    return prisma.refreshToken.findFirst({
      where: { token: hashed }, // CHANGED: compare hashed token
    });
  }, 'Find Refresh Token');

  if (!tokenRecord) {
    // Already logged out (nothing to remove).
    return { alreadyLoggedOut: true };
  }

  // ADDED: If token exists but expired, delete it and return alreadyLoggedOut true.
  if (tokenRecord.expiresAt && new Date(tokenRecord.expiresAt) < new Date()) {
    await executeDbOperation(async prisma => {
      return prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
    }, 'Delete Expired Refresh Token');

    return { alreadyLoggedOut: true };
  }

  await executeDbOperation(async prisma => {
    return prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });
  }, 'Delete Refresh Token');

  return { alreadyLoggedOut: false };
};

// === Logout from all devices ===
const logoutAllDevices = async (req: Request) => {
  const { email } = req.body; // ✅ populated by auth middleware
  const user = await executeDbOperation(async prisma => {
    return prisma.user.findUnique({
      where: { email },
    });
  }, 'Find User in Logout All Devices');
  if (!user) {
    throw new Error('User not found');
  }

  const deletedRefreshTokens = await executeDbOperation(async prisma => {
    return prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });
  }, 'Delete All Refresh Tokens');

  return deletedRefreshTokens;
};

export const authService = {
  loginUser,
  registerUser,
  verifyUser,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  logoutCurrentDevice,
  logoutAllDevices,
  changePassword,
};
