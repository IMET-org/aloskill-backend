import { generalLimiter } from '@/middleware/security.js';
import { validate } from '@/middleware/validation.js';
import express from 'express';
import { userController } from './user.controller.js';
import { getSingleUserSchema } from './user.validation.js';

const router = express.Router({ caseSensitive: true });

router.use(generalLimiter);

router.get('/:email', validate(getSingleUserSchema), userController.getUserByEmail);

export const UserRoutes = router;
