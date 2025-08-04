import { VerifyOtpDTO } from '../../../domain/dtos/user.dto';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { IVerifyOtpService } from '../../../domain/interfaces/IVerifyOtpService';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';

export class VerifyOtpUseCase implements IVerifyOtpService {
  constructor(private _userRepository: IUserRepository) { }

  async execute(dto: VerifyOtpDTO) {
    const user = await this._userRepository.findUserByEmail(dto.email)

    if (!user) {
      throw new AppError(ErrorCode.INVALID_OTP, 'Invalid or expired OTP', HttpStatusCode.BAD_REQUEST)
    }

    

    if (!user.otp || user.otp !== dto.otp) {
      throw new AppError(ErrorCode.INVALID_OTP, 'Invalid OTP', HttpStatusCode.BAD_REQUEST);
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new AppError(ErrorCode.EXPIRED_OTP, 'OTP has expired', HttpStatusCode.BAD_REQUEST);
    }

    if(dto.type==='reset-password'){

      if (!user.isVerified) {
        throw new AppError(ErrorCode.UNAUTHORIZED, 'Please verify your account first', HttpStatusCode.BAD_REQUEST);
      }

    }else{

      if (user.isVerified) {
        throw new AppError(ErrorCode.USER_ALREADY_EXISTS, 'User already exists', HttpStatusCode.CONFLICT);
      }
    }
    
    await this._userRepository.updateUserVerification(dto.email)
  }
}

