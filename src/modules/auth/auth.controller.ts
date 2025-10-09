/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { MailService } from '@/emails/mailService.js';
import resetPasswordTemplate from '@/emails/templates/resetPassword.js';
import signupWelcomeTemplate from '@/emails/templates/signupWelcome.js';
import catchAsync from '@/utils/asyncHandler.js';
import CookieService from '@/utils/cookies.js';
import JwtService from '@/utils/jwt.js';
import ResponseHandler from '@/utils/response.js';
import { authService } from './auth.service.js';

const loginUser = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.loginUser(req);
  console.log('our result is here', result);

  // if (Array.isArray(result)) {
  //   const [user, refreshToken] = result as [
  //     {
  //       email: string;
  //       role: string;
  //       id: string;
  //       firstName: string;
  //       lastName: string;
  //       profilePicture: string;
  //     },
  //     { token: string },
  //   ];

  //   const accessToken = JwtService.generateToken(
  //     { email: user.email, role: user.role },
  //     { expiresIn: '1h', type: 'ACCESS' }
  //   );
  //   CookieService.setRefreshCookie(res, refreshToken.token);

  //   ResponseHandler.ok(res, 'Login Successful', {
  //     id: user.id,
  //     email: user.email,
  //     role: user.role,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     profilePicture: user.profilePicture,
  //     accessToken,
  //   });
  //   return;
  // }

  if (!result) {
    throw new Error('Login failed');
  }
  const { user, refreshToken } = result as {
    user: {
      email: string;
      role: string;
      id: string;
      firstName: string;
      lastName: string;
      profilePicture: string;
    };
    refreshToken: string;
  };

  const accessToken = JwtService.generateToken(
    { email: user.email, role: user.role },
    { expiresIn: '1h', type: 'ACCESS' }
  );
  CookieService.setRefreshCookie(res, refreshToken);
  // console.log('Reach to the end of login function.', refreshToken);
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  // res.setHeader('Access-Control-Allow-Credentials', 'true');
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: false,
  //   secure: false,
  //   sameSite: 'strict',
  //   path: '/',
  //   maxAge: 604800000,
  //   domain: undefined,
  // });

  ResponseHandler.ok(res, 'Login Successful', {
    ...user,
    accessToken,
  });
});

const registerUser = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.registerUser(req);

  if (!result) {
    throw new Error('Registration failed');
  }
  const { user, refreshToken } = result as {
    user: {
      email: string;
      role: string;
      id: string;
      firstName: string;
      lastName: string;
      profilePicture: string;
      emailVerificationToken: string;
    };
    refreshToken: string;
  };

  const accessToken = JwtService.generateToken(
    { email: user.email, role: user.role },
    { expiresIn: '1h', type: 'ACCESS' }
  );
  CookieService.setRefreshCookie(res, refreshToken);
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: false,
  //   secure: false,
  //   sameSite: 'strict',
  //   path: '/',
  //   maxAge: 604800000,
  //   domain: undefined,
  // });
  const { emailVerificationToken, ...separateUser } = user;

  if (user.email && emailVerificationToken) {
    await MailService.sendEmail(user.email, 'Welcome to Aloskill!', signupWelcomeTemplate, {
      name: 'Sumaiya Ahmed',
      verificationLink: `http://localhost:3000/auth/verify-user?id=${user?.id}&token=${emailVerificationToken}`,
    });
  }

  ResponseHandler.ok(res, 'Register Successful', {
    ...separateUser,
    accessToken,
  });
});

const verifyUser = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.verifyUser(req);
  ResponseHandler.ok(res, 'User Verified Successfully', result);
  //
});

const resendVerificationEmail = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.resendVerificationEmail(req);

  if (!result) {
    throw new Error('Failed to resend verification email');
  }

  const { email, firstName, emailVerificationToken, id } = result as {
    email: string;
    firstName: string;
    emailVerificationToken: string;
    id: string;
  };

  // Send new verification email
  await MailService.sendEmail(email, 'Verify your email address', signupWelcomeTemplate, {
    name: firstName,
    verificationLink: `http://localhost:3000/auth/verify-user?id=${id}&token=${emailVerificationToken}`,
  });

  ResponseHandler.ok(res, 'Verification email sent successfully', {
    email,
    id,
  });
});

const forgotPassword = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.forgotPassword(req);
  if (result) {
    await MailService.sendEmail(
      result.email,
      'click here to reset your password',
      resetPasswordTemplate,
      {
        name: 'Sumaiya Ahmed',
        resetLink: `http://localhost:3000/auth/reset-password?id=${result?.id}&token=${result?.passwordResetToken}`,
      }
    );
  }
  ResponseHandler.ok(res, 'Check your email for password reset link', result);
});

const resetPassword = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.resetPassword(req);
  ResponseHandler.ok(res, 'Password Reseted Successfully', result);
});

// === Logout current device ===
const logoutCurrentDevice = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.logoutCurrentDevice(req);

  if (!result) {
    throw new Error('Logout failed');
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: 'strict',
  });

  if (result.alreadyLoggedOut) {
    ResponseHandler.ok(res, 'Already logged out');
  } else {
    ResponseHandler.ok(res, 'Logged out from current device');
  }
});

// === Logout all devices ===
const logoutAllDevices = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.logoutAllDevices(req);
  CookieService.clearAuthCookies(res);
  ResponseHandler.ok(res, 'Logged out from all devices', result);
});

// === Refresh access token controller ===
const refreshAccessToken = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.refreshAccessToken(req);

  if (!result) {
    throw new Error('Refresh token failed');
  }

  const { user, refreshToken } = result as {
    user: {
      email: string;
      role: string;
      id: string;
      firstName: string;
      lastName: string;
      profilePicture: string;
    };
    refreshToken: string;
  };
  const accessToken = JwtService.generateToken(
    { email: user.email, role: user.role },
    { expiresIn: '15m', type: 'ACCESS' }
  );
  // Set new refresh token cookie
  CookieService.setRefreshCookie(res, refreshToken);

  ResponseHandler.ok(res, 'Token refreshed', {
    ...user,
    accessToken,
  });
});

export const authController = {
  loginUser,
  registerUser,
  verifyUser,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  logoutCurrentDevice,
  logoutAllDevices,
  refreshAccessToken,
};
