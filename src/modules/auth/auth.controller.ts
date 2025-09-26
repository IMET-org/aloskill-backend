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

  if (Array.isArray(result)) {
    const [user, refreshToken] = result as [{ email: string; role: string }, { token: string }];

    const accessToken = JwtService.generateToken(
      { email: user.email, role: user.role },
      { expiresIn: '1h', type: 'ACCESS' }
    );
    CookieService.setAuthCookies(res, accessToken, refreshToken.token);

    ResponseHandler.ok(res, 'Login Successful', user);
    return;
  }

  if (!result) {
    throw new Error('Login failed');
  }

  const { email, role, refreshTokens } = result as {
    email: string;
    role: string;
    refreshTokens: { token: string }[];
  };

  const accessToken = JwtService.generateToken(
    { email, role },
    { expiresIn: '1h', type: 'ACCESS' }
  );
  CookieService.setAuthCookies(res, accessToken, refreshTokens[0].token);

  ResponseHandler.ok(res, 'Login Successful', result);
});

const registerUser = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.registerUser(req);

  if (Array.isArray(result)) {
    const [user, refreshToken] = result as [
      { email: string; role: string; emailVerificationToken: string },
      { token: string },
    ];

    const accessToken = JwtService.generateToken(
      { email: user.email, role: user.role },
      { expiresIn: '1h', type: 'ACCESS' }
    );
    CookieService.setAuthCookies(res, accessToken, refreshToken.token);

    if (user.email && user.emailVerificationToken) {
      await MailService.sendEmail(user.email, 'Welcome to Aloskill!', signupWelcomeTemplate, {
        name: 'Sumaiya Ahmed',
        verificationLink: `http://localhost:5000/api/v1/auth/verify-user?id=${user?.id}&token=${user?.emailVerificationToken}`,
      });
    }
    ResponseHandler.ok(res, 'Register Successful', user);
    return;
  }

  if (!result) {
    throw new Error('Registration failed');
  }

  const { email, role, refreshTokens } = result as {
    email: string;
    role: string;
    emailVerificationToken: string;
    refreshTokens: { token: string }[];
  };

  const accessToken = JwtService.generateToken(
    { email, role },
    { expiresIn: '1h', type: 'ACCESS' }
  );
  CookieService.setAuthCookies(res, accessToken, refreshTokens[0].token);

  if (result.email && result.emailVerificationToken) {
    await MailService.sendEmail(result.email, 'Welcome to Aloskill!', signupWelcomeTemplate, {
      name: 'Sumaiya Ahmed',
      verificationLink: `http://localhost:5000/api/v1/auth/verify-user?id=${result?.id}&token=${result?.emailVerificationToken}`,
    });
  }

  ResponseHandler.ok(res, 'Register Successful', result);
});

const verifyUser = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.verifyUser(req);
  ResponseHandler.ok(res, 'User Verified Successfully', result);
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
        resetLink: `http://localhost:5000/api/v1/auth/verify-user?id=${result?.id}&token=${result?.passwordResetToken}`,
      }
    );
  }
  ResponseHandler.ok(res, 'Check your email for password reset link', result);
});

const resetPassword = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.resetPassword(req);
  ResponseHandler.ok(res, 'Password Reseted Successfully', result);
});

export const authController = {
  loginUser,
  registerUser,
  verifyUser,
  forgotPassword,
  resetPassword,
};
