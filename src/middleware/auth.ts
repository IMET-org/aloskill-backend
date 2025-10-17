/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { JwtPayload } from '@/types/jwt.types.js';
import { HttpStatus } from '@/types/shared.js';
import JwtService from '@/utils/jwt.js';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import CookieService from '../utils/cookies.js';
import { InsufficientPermissionsError, JwtError } from './errorHandler.js';

// Extended Request interface with user property
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Role checking function type
type RoleCheck = (userRole: string, requiredRoles: string[]) => boolean;

// Role checking strategies
export const roleStrategies: Record<string, RoleCheck> = {
  // User must have ALL required roles
  all: (userRole, requiredRoles) => requiredRoles.every(role => userRole === role),

  // User must have ANY of the required roles
  any: (userRole, requiredRoles) => requiredRoles.includes(userRole),

  // User must have EXACTLY the required role (single role)
  exact: (userRole, requiredRoles) => userRole === requiredRoles[0],
};

// Middleware options
interface AuthOptions {
  roles?: string[];
  strategy?: keyof typeof roleStrategies;
  allowPublic?: boolean;
}

/**
 * Main authentication middleware
 */
export const authenticate = (options: AuthOptions = {}): RequestHandler => {
  const { roles = [], strategy = 'any', allowPublic = false } = options;

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Get token from cookies or headers
      const token = CookieService.getAccessToken(req);

      if (!token) {
        if (allowPublic) {
          return next();
        }
        throw new JwtError('Authentication required', 'AUTH_REQUIRED', HttpStatus.UNAUTHORIZED);
      }

      // Verify token
      const decoded = JwtService.verifyToken(token, 'ACCESS');
      req.user = decoded;

      // Role-based authorization
      if (roles.length > 0) {
        const hasPermission = roleStrategies[strategy](decoded.role, roles);

        if (!hasPermission) {
          throw new InsufficientPermissionsError(
            `Required roles: ${roles.join(', ')}. Your role: ${decoded.role}`
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
  console.log('Extracted token:', token);
  try {
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, config.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };
    console.log('Decoded token:', decoded);
    (req as any).user = decoded; // Attach decoded user info to the request
    console.log('User after decoding:', (req as any).user);
    next(); // Proceed to the next handler
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Convenience middleware for common role patterns
export const requireAuth = authenticate();

export const requireAdmin = authenticate({
  roles: ['admin', 'superadmin'],
  strategy: 'any',
});

export const requireSuperAdmin = authenticate({
  roles: ['superadmin'],
  strategy: 'exact',
});

export const requireInstructor = authenticate({
  roles: ['instructor', 'admin', 'superadmin'],
  strategy: 'any',
});

export const requireStudent = authenticate({
  roles: ['student', 'instructor', 'admin', 'superadmin'],
  strategy: 'any',
});

export const optionalAuth = authenticate({ allowPublic: true });
