/* eslint-disable @typescript-eslint/no-unused-vars */
import { MailService } from '@/emails/mailService.js';
import signupWelcomeTemplate from '@/emails/templates/signupWelcome.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { authService } from './auth.service.js';

const loginUser = asyncHandler(async (req, res): Promise<void> => {
  const result = await authService.loginUser(req.body as { email: string; password: string });
  res.json({ message: 'Login successful', result });
});

const registerUser = asyncHandler(async (req, res): Promise<void> => {
  // const { email, role, ...payload } = req.body;
  // const result = await authService.registerUser({ email, role });
  // CookieService.setAuthCookies(res, result.accessToken, result.refreshToken);

  // 3. Queue welcome email
  await MailService.sendEmail(
    'zeroboolean@gmail.com',
    'Welcome to AAAloskill!',
    signupWelcomeTemplate,
    {
      name: registerUser.name,
      verificationLink: `http://localhost:5000/api/v1/auth/verify?token=123`,
    }
  );

  res.json({
    message: 'Signup successful! Please check your email to verify your account.',
  });
});

export const authController = {
  loginUser,
  registerUser,
};
