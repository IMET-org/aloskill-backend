/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import catchAsync from '@/utils/asyncHandler.js';
import CookieService from '@/utils/cookies.js';
import JwtService from '@/utils/jwt.js';
import { authService } from './auth.service.js';
import { MailService } from '@/emails/mailService.js';
import signupWelcomeTemplate from '@/emails/templates/signupWelcome.js';
import ResponseHandler from '@/utils/response.js';

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
    const [user, refreshToken] = result as [{ email: string; role: string }, { token: string }];

    const accessToken = JwtService.generateToken(
      { email: user.email, role: user.role },
      { expiresIn: '1h', type: 'ACCESS' }
    );
    CookieService.setAuthCookies(res, accessToken, refreshToken.token);

    await MailService.sendEmail(
      'mdarifulislam0238@gmail.com',
      'Welcome to Aloskill!',
      signupWelcomeTemplate,
      {
        name: 'Ariful islam',
        verificationLink: `http://localhost:5000/api/v1/auth/verify?token=123`,
      }
    );
    ResponseHandler.ok(res, 'Register Successful', user);
    return;
  }

  if (!result) {
    throw new Error('Registration failed');
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

  await MailService.sendEmail(
    'mdarifulislam0238@gmail.com',
    'Welcome to Aloskill!',
    signupWelcomeTemplate,
    {
      name: 'Ariful islam',
      verificationLink: `http://localhost:5000/api/v1/auth/verify?token=123`,
    }
  );
  ResponseHandler.ok(res, 'Register Successful', result);
});

const verifyUser = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.verifyUser(req);
  ResponseHandler.ok(res, 'User Verified Successfully', result);
});

export const authController = {
  loginUser,
  registerUser,
  verifyUser,
};
