import express from 'express';
import { UserRepository } from '../../infrastructure/database/repositories/userRepository';
import { SignupUserUseCase } from '../../application/use-cases/auth/signupUserUseCase';
import { AuthController } from '../controllers/auth/auth.controller';
import { VerifyOtpUseCase } from '../../application/use-cases/auth/verifyOtpUseCase';
import { InterviewerRepository } from '../../infrastructure/database/repositories/interviewerRepository';
import { LoginUseCase} from '../../application/use-cases/auth/loginUseCase';
import { authenticateToken } from '../middleware/authMiddleware';
import { ResendOtpUseCase } from '../../application/use-cases/auth/resendOtpUseCase';
import {EmailService} from '../../infrastructure/external/services/emailService';
import { ForgetPasswordUseCase } from '../../application/use-cases/auth/forgetPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/auth/resetPasswordUseCase';
import { GoogleAuthUseCase } from '../../application/use-cases/auth/googleAuthUseCase';

const router=express.Router();
const emailService = new EmailService();

const userRepository=new UserRepository()
const interviewerRepository=new InterviewerRepository()

const signupUserUseCase=new SignupUserUseCase(userRepository,interviewerRepository,emailService)
const verifyOtpUseCase=new VerifyOtpUseCase(userRepository)
const loginUseCase=new LoginUseCase(userRepository)
const resendOtpUseCase=new ResendOtpUseCase(userRepository,emailService)
const forgetPasswordUseCase=new ForgetPasswordUseCase(userRepository,emailService)
const resetPasswordUseCase=new ResetPasswordUseCase(userRepository)
const googleAuthUseCase=new GoogleAuthUseCase(userRepository,interviewerRepository)
const authController=new AuthController(signupUserUseCase, verifyOtpUseCase,loginUseCase,resendOtpUseCase,forgetPasswordUseCase,resetPasswordUseCase,googleAuthUseCase)

router.post('/refresh',(req,res)=>authController.refreshToken(req,res))
router.post('/signup',(req,res)=> authController.signupUser(req,res))
router.post('/verify-otp',(req,res)=> authController.verifyOtp(req,res))
router.post('/resend-otp',(req,res)=> authController.resendOtp(req,res))
router.post('/login',(req,res)=> authController.login(req,res))
router.post('/forgot-password',(req,res)=>authController.forgetPassword(req,res))
router.post('/reset-password',(req,res)=>authController.resetPassword(req,res))
router.post('/logout',(req,res)=> authController.logout(req,res))
router.post('/google',(req,res)=>{
    console.log('Google route hit, body:', req.body);
    authController.googleLogin(req,res)
})
router.post('/google/select-role',authenticateToken,(req,res)=> authController.selectRole(req,res))

export default router