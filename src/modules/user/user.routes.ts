import { authLimiter } from '@/middleware/security.js';
import express from 'express';
import { userController } from './user.controller.js';
import { validate } from '@/middleware/validation.js';
import { getSingleUserSchema } from './user.validation.js';

const router = express.Router({ caseSensitive: true });

router.use(authLimiter);

router.get('/:email', validate(getSingleUserSchema), userController.getUserByEmail);

export const UserRoutes = router;
