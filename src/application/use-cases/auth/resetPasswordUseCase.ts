import { ResetPasswordDTO } from '../../../domain/dtos/user.dto';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { IResetPasswordService } from '../../../domain/interfaces/IResetPasswordService';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import bcrypt from 'bcryptjs';
import {HttpStatusCode} from '../../../utils/HttpStatusCode'

export class ResetPasswordUseCase implements IResetPasswordService{
    constructor(
        private _userRepository:IUserRepository
    ){}

    async execute(dto: ResetPasswordDTO): Promise<void> {
        
        const user = await this._userRepository.findUserByEmail(dto.email);

        if(!user){
            throw new AppError(ErrorCode.INVALID_OTP,"Invalid or expired OTP",HttpStatusCode.BAD_REQUEST);
        }
        
        if(!user.isVerified){
            throw new AppError(ErrorCode.UNAUTHORIZED,"Please verify your email first'",HttpStatusCode.BAD_REQUEST);
        }

        const hashedPassword=await bcrypt.hash(dto.newPassword,10)

        await this._userRepository.updatePassword(dto.email,hashedPassword)

        await this._userRepository.updateOtp(dto.email, null, null);  

    }
}