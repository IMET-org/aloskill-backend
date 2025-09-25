import catchAsync from '@/utils/asyncHandler.js';
import CookieService from '@/utils/cookies.js';
import JwtService from '@/utils/jwt.js';
import { authService } from './auth.service.js';
import { MailService } from '@/emails/mailService.js';
import signupWelcomeTemplate from '@/emails/templates/signupWelcome.js';

const loginUser = catchAsync(async (req, res): Promise<void> => {
  const result = await authService.loginUser(req);

  if (Array.isArray(result)) {
    const [user, refreshToken] = result as [{ email: string; role: string }, { token: string }];

    const accessToken = JwtService.generateToken(
      { email: user.email, role: user.role },
      { expiresIn: '1h', type: 'ACCESS' }
    );
    CookieService.setAuthCookies(res, accessToken, refreshToken.token);

    res.json({ message: 'Login successful', result: user });
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

  res.json({ message: 'Login successful', result });
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
    res.json({ message: 'Register successful', result: user });
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
  res.json({ message: 'Register successful', result });
});

export const authController = {
  loginUser,
  registerUser,
};
