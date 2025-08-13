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
  const token = req.cookies.access_token || req.cookies.temp_auth;

  if (!token) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Access token required', 401);
  }

  try {

    let verified: JwtPayload;
    if (req.cookies.access_token) {
      verified = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    } else if(req.cookies.temp_auth){
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded || !decoded.role) {
        throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token', HttpStatusCode.UNAUTHORIZED);
      }
      const role = decoded.role as 'user' | 'interviewer' | 'admin';
      verified = verifyJwt(token, role) as JwtPayload;
    }else{
      throw new AppError(ErrorCode.UNAUTHORIZED, 'No valid token found', HttpStatusCode.UNAUTHORIZED);
    }

    // Check if user is blocked
    if (verified.isBlocked) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.clearCookie('temp_auth');
      throw new AppError(ErrorCode.UNAUTHORIZED, 'User is blocked', HttpStatusCode.UNAUTHORIZED);
    }

    req.user = {
      id: verified.id || verified.userId,
      email: verified.email,
      role: verified.role,
      isBlocked: verified.isBlocked,
    };

    next();
  } catch (error) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token', HttpStatusCode.UNAUTHORIZED);
  }
};
