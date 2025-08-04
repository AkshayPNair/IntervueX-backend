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
import { HttpStatusCode } from '../../../utils/HttpStatusCode';

export class AuthController{
  constructor (
    private _signupService: ISignupService,
    private _verifyOtpService: IVerifyOtpService,
    private _loginService: ILoginService,
    private _resendOtpService:IResendOtpService,
    private _forgetPasswordService:IForgetPasswordService,
    private _resetPasswordService:IResetPasswordService
  ){}

  async signupUser(req:Request, res: Response){
    try {
      const {userDto,interviewerDto}=req.body;
      await this._signupService.execute(userDto,interviewerDto)
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
      console.log("BODY RECEIVED:", req.body); 
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

      // Set secure cookie based on role
      const cookieName = `auth_${result.user.role}`;
      res.cookie(cookieName, result.token, {
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

  async me(req:any, res:Response){
    if(!req.user){
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ error: 'Not authenticated' });
    }
    res.status(HttpStatusCode.OK).json({ user: req.user });
  }

  async logout(req:Request,res:Response){
    try {
      const token = req.cookies.auth_user || req.cookies.auth_interviewer || req.cookies.auth_admin;
      
      if (token) {
        const decoded = require('jsonwebtoken').decode(token);
        const userRole = decoded?.role;
        
        // Clear only the specific role's cookie
        switch(userRole) {
          case 'user':
            res.clearCookie('auth_user');
            break;
          case 'interviewer':
            res.clearCookie('auth_interviewer');
            break;
          case 'admin':
            res.clearCookie('auth_admin');
            break;
          default:
            // Fallback: clear all if role is unknown
            res.clearCookie('auth_user');
            res.clearCookie('auth_interviewer');
            res.clearCookie('auth_admin');
        }
      }    
      res.status(HttpStatusCode.OK).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER).json({
        error: 'Logout failed',
        code: ErrorCode.UNKNOWN_ERROR,
        status: HttpStatusCode.INTERNAL_SERVER
      });
    }
  }
}
