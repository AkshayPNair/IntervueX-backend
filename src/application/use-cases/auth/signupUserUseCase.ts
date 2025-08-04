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

    const userDomain = toUserDomain({ ...userDto, password: hashedPassword,otp,otpExpiry,isVerified:false});
    const user = await this._userRepository.createUser(userDomain);

    if (userDto.role === "interviewer" && interviewerDto && user.id) {
      const interviewerDomain = toInterviewerDomain(interviewerDto, user.id); 
      await this._interviewerRepository.createInterviewer(interviewerDomain);
    }

    

    await this._emailService.sendEmail(userDto.email, `Your OTP : ${otp}`)
  }
}



