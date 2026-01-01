import { AuthRoutes } from '@/modules/auth/auth.routes.js';
import { CourseRoutes } from '@/modules/course/course.routes.js';
import { UserRoutes } from '@/modules/user/user.routes.js';
import express from 'express';

const router = express.Router({ caseSensitive: true });

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/user', route: UserRoutes },
  { path: '/course', route: CourseRoutes },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
