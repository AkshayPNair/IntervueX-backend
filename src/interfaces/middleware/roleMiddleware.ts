import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { AppError } from '../../application/error/AppError';
import { ErrorCode } from '../../application/error/ErrorCode';
import { HttpStatusCode } from '../../utils/HttpStatusCode';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', HttpStatusCode.UNAUTHORIZED);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Insufficient permissions', HttpStatusCode.FORBIDDEN);
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireInterviewer = requireRole(['interviewer']);
export const requireUser = requireRole(['user']);
export const requireInterviewerOrAdmin = requireRole(['interviewer', 'admin']);