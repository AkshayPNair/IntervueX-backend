import { SignupUserDTO } from '../../../domain/dtos/user.dto';
import { SignupInterviewerDTO } from '../../../domain/dtos/interviewer.dto';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { IInterviewerRepository } from '../../../domain/interfaces/IInterviewerRepository';
import { generateOtp } from '../../../utils/generateOtp';
import { IEmailService } from '../../../domain/interfaces/IEmailService';
import { toUserDomain } from '../../mappers/userMapper';
import { toInterviewerDomain } from '../../mappers/interviewerMapper';
import { hashPassword } from '../../../utils/hashPassword';
import { ISignupService } from '../../../domain/interfaces/ISignupService';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';

export class SignupUserUseCase implements ISignupService{
  constructor(
    private _userRepository: IUserRepository,
    private _interviewerRepository: IInterviewerRepository,
    private _emailService: IEmailService
  ){}

  async execute(
    userDto: SignupUserDTO,
    interviewerDto: SignupInterviewerDTO
  ){
    // Validation
    if (!userDto.name || userDto.name.trim().length < 2) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Name must be at least 2 characters long', HttpStatusCode.BAD_REQUEST);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userDto.email || !emailRegex.test(userDto.email)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid email format', HttpStatusCode.BAD_REQUEST);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!userDto.password || !passwordRegex.test(userDto.password)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character', HttpStatusCode.BAD_REQUEST);
    }

    if (userDto.role === "admin") {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Admin signup not allowed', HttpStatusCode.BAD_REQUEST);
    }

    if (!["user", "interviewer"].includes(userDto.role)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid role. Must be user or interviewer', HttpStatusCode.BAD_REQUEST);
    }

    const existingUser = await this._userRepository.findUserByEmail(userDto.email);
    if (existingUser) {
      if(existingUser.isVerified){
        throw new AppError(ErrorCode.USER_ALREADY_EXISTS, 'User with this email already exists', HttpStatusCode.CONFLICT);
      }else{
        await this._userRepository.deleteUserByEmail(userDto.email)
      }
    }

    

    const otp=generateOtp()
    const otpExpiry=new Date(Date.now() + 2 * 60 * 1000);
    const hashedPassword=await hashPassword(userDto.password)

    const userDomain = toUserDomain({ ...userDto, password: hashedPassword,otp,otpExpiry,isVerified:false,isGoogleUser: userDto.isGoogleUser ?? false,googleId: userDto.googleId ?? undefined});
    const user = await this._userRepository.createUser(userDomain);

    if (userDto.role === "interviewer" && interviewerDto && user.id) {
      const interviewerDomain = toInterviewerDomain(interviewerDto, user.id); 
      await this._interviewerRepository.createInterviewer(interviewerDomain);
    }

    

    await this._emailService.sendEmail(userDto.email, `Your OTP : ${otp}`)
  }
}



