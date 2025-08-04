import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../../infrastructure/external/services/jwtService';
import { AppError } from '../../application/error/AppError';
import { ErrorCode } from '../../application/error/ErrorCode';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { HttpStatusCode } from '../../utils/HttpStatusCode';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isBlocked: boolean;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies.auth_user ||
    req.cookies.auth_interviewer ||
    req.cookies.auth_admin;

  if (!token) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Access token required', 401);
  }

  try {
    const decoded = jwt.decode(token) as JwtPayload | null;

    if (!decoded || !decoded.role) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token', HttpStatusCode.UNAUTHORIZED);
    }

    const role = decoded.role as 'user' | 'interviewer' | 'admin';

    const verified = verifyJwt(token, role) as JwtPayload;

    // Check if user is blocked
    if (verified.isBlocked) {
      switch (role) {
        case 'user':
          res.clearCookie('auth_user');
          break;
        case 'interviewer':
          res.clearCookie('auth_interviewer');
          break;
        case 'admin':
          res.clearCookie('auth_admin');
          break;
      }
      throw new AppError(ErrorCode.UNAUTHORIZED, 'User is blocked', HttpStatusCode.UNAUTHORIZED);
    }

    req.user = {
      id: verified.id,
      email: verified.email,
      role: verified.role,
      isBlocked: verified.isBlocked,
    };

    next();
  } catch (error) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token', HttpStatusCode.UNAUTHORIZED);
  }
};
