import { authLimiter } from '@/middleware/security.js';
import { validate } from '@/middleware/validation.js';
import {
  forgotSchema,
  loginSchema,
  logoutAllDevicesSchema,
  registerSchema,
  resetSchema,
  verifyUserSchema,
} from '@/validations/auth.js';
import express from 'express';
import { authController } from './auth.controller.js';

const router = express.Router({ caseSensitive: true });

//middleware
router.use(authLimiter);

//routes
router.post('/login', validate(loginSchema), authController.loginUser);
router.post('/register', validate(registerSchema), authController.registerUser);
router.post('/verify-user', validate(verifyUserSchema), authController.verifyUser);
router.post('/resend-verification', authController.resendVerificationEmail);
router.post('/forgot-password', validate(forgotSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetSchema), authController.resetPassword);
router.post('/logout', authController.logoutCurrentDevice);
router.post('/logout-all', validate(logoutAllDevicesSchema), authController.logoutAllDevices);
router.post('/refresh', authController.refreshAccessToken);

//named export
export const AuthRoutes = router;
