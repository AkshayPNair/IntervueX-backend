import { IResendOtpService } from "../../../domain/interfaces/IResendOtpService";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IEmailService } from "../../../domain/interfaces/IEmailService";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import {HttpStatusCode} from '../../../utils/HttpStatusCode'

export class ResendOtpUseCase implements IResendOtpService {
  constructor(
    private _userRepository: IUserRepository,
    private _emailService: IEmailService
  ) { }

  async execute(email: string): Promise<void> {
    console.log("ResendOtpUseCase received email:", email);
    const user = await this._userRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, "User not found", HttpStatusCode.NOT_FOUND);
    }

    if (user.isVerified) {
      throw new AppError(ErrorCode.USER_ALREADY_EXISTS, "User already verified", HttpStatusCode.CONFLICT);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    await this._userRepository.updateOtp(email, otp, otpExpiry);
    await this._emailService.sendEmail(email, `Your OTP: ${otp}`);

    console.log(`Resend OTP : ${otp}`)
  }
}