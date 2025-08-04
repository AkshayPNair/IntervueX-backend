import { ForgetPasswordDTO } from '../../../domain/dtos/user.dto';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { IForgetPasswordService } from '../../../domain/interfaces/IForgetPasswordService';
import { IEmailService } from '../../../domain/interfaces/IEmailService';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { generateOtp } from '../../../utils/generateOtp';
import {HttpStatusCode} from '../../../utils/HttpStatusCode'


export class ForgetPasswordUseCase implements IForgetPasswordService{
    constructor(
        private _userRepository:IUserRepository,
        private _emailService:IEmailService
    ){}

    async execute(dto:ForgetPasswordDTO):Promise<void>{
        const user=await this._userRepository.findUserByEmail(dto.email)

        if(!user){
            throw new AppError(ErrorCode.INVALID_CREDENTIALS,"User not found",HttpStatusCode.NOT_FOUND)
        }
        if(!user.isVerified){
            throw new AppError(ErrorCode.UNAUTHORIZED,"Please verify your account first",HttpStatusCode.BAD_REQUEST)
        }
        
        const otp=generateOtp();
        const otpExpiry=new Date(Date.now()+2*60*1000)

        await this._userRepository.updateOtp(dto.email,otp,otpExpiry)

        await this._emailService.sendEmail(dto.email,otp)
    }
}