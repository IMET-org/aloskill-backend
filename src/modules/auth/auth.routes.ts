import express from 'express';
import { authController } from './auth.controller.js';
import { authLimiter } from '@/middleware/security.js';
import { validate } from '@/middleware/validation.js';
import {
  forgotSchema,
  loginSchema,
  registerSchema,
  resetSchema,
  verifyUserSchema,
} from '@/validations/auth.js';

const router = express.Router({ caseSensitive: true });

//middleware
router.use(authLimiter);

//routes
router.post('/login', validate(loginSchema), authController.loginUser);
router.post('/register', validate(registerSchema), authController.registerUser);
router.post('/verify-user', validate(verifyUserSchema), authController.verifyUser);
router.post('/forgot-password', validate(forgotSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetSchema), authController.resetPassword);

//named export
export const AuthRoutes = router;
