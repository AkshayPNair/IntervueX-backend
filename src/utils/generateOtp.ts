import { logger } from '../utils/logger';

export class OtpGenerator {
  static generate(length = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    logger.info('OTP for verification :', { otp });
    return otp;
  }
}
export const generateOtp = OtpGenerator.generate;