import { Request, Response } from 'express';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { ISignupService } from '../../../domain/interfaces/ISignupService';
import { IVerifyOtpService } from '../../../domain/interfaces/IVerifyOtpService';
import { ILoginService } from '../../../domain/interfaces/ILoginService';
import { toLoginUserDTO } from '../../../application/mappers/userMapper';
import {IResendOtpService} from '../../../domain/interfaces/IResendOtpService';
import { IForgetPasswordService } from '../../../domain/interfaces/IForgetPasswordService';
import { IResetPasswordService } from '../../../domain/interfaces/IResetPasswordService';
import { IGoogleAuthService } from '../../../domain/interfaces/IGoogleAuthService';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { GoogleLoginDTO,RoleSelectionDTO } from '../../../domain/dtos/googleAuth.dto';
import { INotificationPublisher } from '../../../domain/interfaces/INotificationPublisher';
import { NotifyEvents } from '../../socket/notificationPublisher';
import { logger } from '../../../utils/logger';

export class AuthController{
  constructor (
    private _signupService: ISignupService,
    private _verifyOtpService: IVerifyOtpService,
    private _loginService: ILoginService,
    private _resendOtpService:IResendOtpService,
    private _forgetPasswordService:IForgetPasswordService,
    private _resetPasswordService:IResetPasswordService,
    private _googleAuthService:IGoogleAuthService,
    private _notificationPublisher:INotificationPublisher
  ){}

  async signupUser(req:Request, res: Response){
    try {
      const {userDto,interviewerDto}=req.body;
      await this._signupService.execute(userDto,interviewerDto)

      // Notify admins about a new registration
      this._notificationPublisher.toAdmin(NotifyEvents.NewRegistration, {
        role: userDto.role,
        email: userDto.email,
        name: userDto.name,
        timestamp: new Date().toISOString(),
      })

      res.status(HttpStatusCode.CREATED).json({message:"User created successfully"})
    } catch (error) {
      if(error instanceof AppError){
        res.status(error.status).json({
          error: error.message,
          code: error.code,
          status: error.status
        })
      }else{
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: error instanceof Error ? error.message : "An unexpected error occurred.",
          code:  ErrorCode.UNKNOWN_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        })
      }
    }
  }

  async verifyOtp(req:Request, res: Response){
    try {
      const result = await this._verifyOtpService.execute(req.body);
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      if(error instanceof AppError){
        res.status(error.status).json({
          error: error.message,
          code: error.code,
          status: error.status
        })
      }else{
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: error instanceof Error ? error.message : "An unexpected error occurred.",
          code:  ErrorCode.UNKNOWN_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        })
      }
    }
  }

  async resendOtp(req:Request,res:Response){
    try {
      const {email}=req.body;
      await this._resendOtpService.execute(email);
      res.status(HttpStatusCode.OK).json({message:"Otp sent successfully"});
    } catch (error) {
      if(error instanceof AppError){
        res.status(error.status).json({
          error: error.message,
          code: error.code,
          status: error.status
        })
      }else{
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: error instanceof Error ? error.message : "An unexpected error occurred.",
          code:  ErrorCode.UNKNOWN_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        })
      }
    }
  }

  async forgetPassword(req:Request, res:Response){
    try {
      logger.info("BODY RECEIVED:", req.body); 
      const {email} = req.body;
      await this._forgetPasswordService.execute({email});
      res.status(HttpStatusCode.OK).json({message:"OTP sent to your email successfully"});
    } catch (error) {
      if(error instanceof AppError){
        res.status(error.status).json({
          error: error.message,
          code: error.code,
          status: error.status
        })
      }else{
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: error instanceof Error ? error.message : "An unexpected error occurred.",
          code:  ErrorCode.UNKNOWN_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        })
      }
    }
  }
    
  async resetPassword(req:Request, res:Response){
    try {
      const {email, otp, newPassword} = req.body;
      await this._resetPasswordService.execute({email, otp, newPassword});
      res.status(HttpStatusCode.OK).json({message:"Password reset successfully"});
    } catch (error) {
      if(error instanceof AppError){
        res.status(error.status).json({
          error: error.message,
          code: error.code,
          status: error.status
      })
      }else{
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: error instanceof Error ? error.message : "An unexpected error occurred.",
          code:  ErrorCode.UNKNOWN_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        })
      }
    }
  }
    

  async login(req:Request, res:Response){
    try {
      const loginDto=toLoginUserDTO(req.body);
      const result=await this._loginService.execute(loginDto);

      const jwt=require('jsonwebtoken')
      const payload={
        id:result.user.id,
        email:result.user.email,
        role:result.user.role,
        isBlocked:result.user.isBlocked || false
      }

      const accessToken=jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{expiresIn:'15m'})
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/'
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      res.status(HttpStatusCode.OK).json({
        user: result.user,
        message: 'Login successful'
      });     
    } catch (error) {
      if(error instanceof AppError){
        res.status(error.status).json({
          error:error.message,
          code:error.code,
          status:error.status
        })
      }else{
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error:error instanceof Error?error.message:"An unexpected error occurred.",
          code:ErrorCode.UNKNOWN_ERROR,
          status:HttpStatusCode.BAD_REQUEST
        })
      }
    }
  }

  async refreshToken(req:Request,res:Response){
    try {
      const refreshToken=req.cookies.refresh_token

      if(!refreshToken){
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          error:"Refresh token not found"
        })
      }

      const jwt=require('jsonwebtoken')
      const decoded=jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET) as any;

      if (decoded.isBlocked) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ 
          error: 'User is blocked' 
        });
      }

      const newAccessToken = jwt.sign(
        {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          isBlocked: decoded.isBlocked
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      // Return user data
      res.status(HttpStatusCode.OK).json({
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          isBlocked: decoded.isBlocked
        },
        accessToken: newAccessToken
      });

    } catch (error) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.status(HttpStatusCode.UNAUTHORIZED).json({ 
        error: 'Invalid refresh token' 
      });
    }
  }

  async logout(req:Request,res:Response){
    try {
      
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.clearCookie('auth_user');
      res.clearCookie('auth_interviewer');
      res.clearCookie('auth_admin');
      res.clearCookie('temp_auth');
      
      res.status(HttpStatusCode.OK).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER).json({
        error: 'Logout failed',
        code: ErrorCode.UNKNOWN_ERROR,
        status: HttpStatusCode.INTERNAL_SERVER
      });
    }
  }

  async googleLogin(req:Request,res:Response):Promise<void>{
    try {
      logger.info('Google login request body:', req.body);
      const googleData: GoogleLoginDTO = req.body;

      // Validate required fields
      if (!googleData.email || !googleData.name || !googleData.googleId) {

        logger.warn('Google login validation failed', { 
          email: !!googleData.email, 
          name: !!googleData.name, 
          googleId: !!googleData.googleId 
        });
        
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: 'Missing required fields: email, name, and googleId are required',
          code: ErrorCode.VALIDATION_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        });
        return;
      }

      const result = await this._googleAuthService.googleLogin(googleData);

      if (!result.needsRoleSelection) {
        const jwt=require('jsonwebtoken')
        const payload={
          id:result.user.id,
          email:result.user.email,
          role:result.user.role,
          isBlocked: false
        }
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000, // 15 minutes
          path: '/'
        });

        res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/'
        });
  
      } else {
        // Set temporary cookie for role selection
        res.cookie('temp_auth', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000, // 15 minutes - temporary
          path: '/'
        });
      }

      res.status(HttpStatusCode.OK).json({
        user: result.user,
        needsRoleSelection: result.needsRoleSelection,
        message: 'Google authentication successful'
      });
    } catch (error) {
        if(error instanceof AppError){
        res.status(error.status).json({
          error: error.message,
          code: error.code,
          status: error.status
        })
      }else{
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: error instanceof Error ? error.message : 'Google authentication failed',
          code: ErrorCode.UNKNOWN_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        })
      }

    }
  }

  async selectRole(req: Request, res: Response): Promise<void> {
    try {
      logger.debug?.('=== SELECT ROLE DEBUG ===');
      logger.debug?.('Request cookies:', req.cookies);
      logger.debug?.('Request user:', (req as any).user);

     const roleData: RoleSelectionDTO = req.body;
      const userId = (req as any).user?.id; // Assuming you have auth middleware that sets req.user

      logger.debug?.('Extracted userId:', userId);
      logger.debug?.('Role data:', roleData);

      if (!userId) {
        logger.warn('No userId found - returning 401');
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          error: 'User not authenticated',
          code: ErrorCode.UNAUTHORIZED,
          status: HttpStatusCode.UNAUTHORIZED
        });
        return;
      }

      if (!roleData.role || !['user', 'interviewer'].includes(roleData.role)) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: 'Invalid role. Must be either "user" or "interviewer"',
          code: ErrorCode.VALIDATION_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        });
        return;
      }

      const result = await this._googleAuthService.selectRole(userId, roleData);
      res.clearCookie('temp_auth');

       const jwt = require('jsonwebtoken');
      const payload = {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      };

      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/'
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });


      res.status(HttpStatusCode.OK).json({
        user: result.user,
        message: 'Role selection successful'
      });
    } catch (error) {
      if(error instanceof AppError){
        res.status(error.status).json({
          error: error.message,
          code: error.code,
          status: error.status
        })
      }else{
        res.status(HttpStatusCode.BAD_REQUEST).json({
          error: error instanceof Error ? error.message : 'Role selection failed',
          code: ErrorCode.UNKNOWN_ERROR,
          status: HttpStatusCode.BAD_REQUEST
        })
      }
    }
  }
}
